import { BadRequestException, ForbiddenException, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { ChangePasswordDto, ChangeProfileDto, CheckResetPasswordTokenDto, LoginDto, RegisterDto, RequestResetPasswordDto } from './dto';
import * as bcrypt from 'bcrypt'
import * as path from 'path'
import * as fs from 'fs'
import * as sharp from 'sharp';
import { ResetPassword } from './reset-password.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
    constructor(
        @Inject('USER_REPOSITORY')
        private userRepository: typeof User,

        @Inject('RESET_PASSWORD_REPOSITORY')
        private resetPasswordRepository: typeof ResetPassword,

        private jwt: JwtService,

        private config: ConfigService,

        private mailService: MailService,
    ) { }

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email
        }
        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '30d',
                secret: this.config.get<string>('JWT_SECRET')
            }
        )
        return {
            access_token: token
        }
    }

    async me(userId: number) {
        return await this.userRepository.findByPk(userId, {
            attributes: {
                exclude: ['password']
            }
        });
    }

    async emailVerificationAction(token: number) {
        const user: User = await this.userRepository.findOne({
            attributes: ['id', 'fullName', 'email', 'isActive'],
            where: { verificationCode: token }
        });

        if (!user) return {
            statusCode: 422,
            message: 'Account not found',
            error: 'Unprocessable Content',
        }
        await this.userRepository.update({
            isActive: true
        }, { where: { id: user.id } })
        return {
            statusCode: 201,
            data: user,
            message: 'Your account is activated. Now you can login with your own account!',
        }
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) throw new UnprocessableEntityException('User not found');

        return user;
    }

    async emailVerification(account: any) {
        return await this.mailService.sendEmailConfirmation(account.email);
    }

    async login(data: LoginDto): Promise<{ access_token: string }> {
        const user: any = await this.userRepository.findOne({
            where: {
                email: data.email
            }
        })

        if (!user) throw new ForbiddenException('Credentials incorrect')

        if (bcrypt.compareSync(data.password, user.password)) {
            return this.signToken(user.id, user.email)
        } else {
            throw new ForbiddenException('Credentials incorrect')
        }
    }

    async register(data: RegisterDto) {
        const salt = bcrypt.genSaltSync(+this.config.get<number>('SALT_ROUND'));
        const password_hash = bcrypt.hashSync(data?.password ? data.password : '12345678', salt)

        try {
            const user: User = await this.userRepository.create({
                ...data,
                password: password_hash,
            })
            delete user.password
            await this.mailService.sendEmailConfirmation(user.email);
            return user
        } catch (err) {
            console.log(err);
            const errors = err.errors.map((val) => ({
                [val.path]: val.message
            }));

            if (err.name === 'SequelizeUniqueConstraintError') throw new BadRequestException({
                statusCode: 400,
                ...errors.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
                error: 'Bad Request',

            })
        }
    }

    async checkResetPasswordToken(data: CheckResetPasswordTokenDto) {
        const resetPassword = await this.resetPasswordRepository.findOne({
            where: {
                uniqueCode: data.token,
                '$user.email$': data.email
            },
            include: {
                model: User,
                as: 'user'
            }
        });

        if (!resetPassword) throw new ForbiddenException('Credentials incorrect')

        return resetPassword
    }

    async requestResetPassword(data: RequestResetPasswordDto) {
        const resetPassword = await this.resetPasswordRepository.findOne({
            where: {
                uniqueCode: data.token,
                '$user.email$': data.email
            },
            include: {
                model: User,
                as: 'user'
            }
        });

        if (!resetPassword) throw new ForbiddenException('Credentials incorrect')

        if (data.passwordBaru !== data.konfirmasiPasswordBaru) throw new BadRequestException({
            statusCode: 400,
            error: 'Bad Request',
            konfirmasiPasswordBaru: 'konfirmasiPasswordBaru must be the same as passwordBaru'
        })

        const salt = bcrypt.genSaltSync(+this.config.get<number>('SALT_ROUND'));
        const password_hash = bcrypt.hashSync(data.passwordBaru, salt)
        await this.userRepository.update({
            password: password_hash
        }, {
            where: { id: resetPassword.userId }
        })
        await this.resetPasswordRepository.destroy({ where: { uniqueCode: data.token } })
        const user = await this.userRepository.findByPk(resetPassword.userId, { raw: true })
        delete user.password
        return user
    }

    async changeProfile(data: ChangeProfileDto, userId: number): Promise<User> {
        return await this.userRepository.update(data, { where: { id: userId } }).then(async () => await this.findOne(userId));
    }

    async changePassword(data: ChangePasswordDto, userId: number): Promise<User> {
        if (data.newPassword != data.newPasswordConfirmation) throw new BadRequestException({
            statusCode: 400,
            newPasswordConfirmation: 'newPasswordConfirmation must match with newPassword',
            error: 'Bad Request'
        })

        const userData = await this.findOne(userId)

        if (!(await bcrypt.compare(data.oldPassword, userData.password))) throw new BadRequestException({
            statusCode: 400,
            oldPassword: 'oldPassword is invalid',
            error: 'Bad Request'
        })

        const salt = bcrypt.genSaltSync(+this.config.get<number>('SALT_ROUND'));
        const password_hash = bcrypt.hashSync(data.newPassword, salt);
        return await this.userRepository.update({ password: password_hash }, { where: { id: userId } }).then(() => userData);
    }

    async changeProfilePicture(image: Express.Multer.File, userId: number): Promise<User> {
        const inputPath = image.path;
        const outputPath = path.join(
            path.dirname(inputPath),
            path.basename(inputPath, path.extname(inputPath)) + '.webp'
        );
        const filename = path.basename(inputPath, path.extname(inputPath)) + '.webp';
        await sharp(inputPath)
            .resize({
                width: 600,
                height: 600,
                position: 'top',
                fit: 'cover',
            })
            .webp({ quality: 80 })
            .toFile(outputPath);
        fs.unlinkSync(inputPath);
        return await this.userRepository.update({ image: filename }, { where: { id: userId } }).then(async () => await this.findOne(userId));
    }
}
