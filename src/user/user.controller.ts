import { Body, Controller, FileTypeValidator, ForbiddenException, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, Put, Render, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MailService } from 'src/mail/mail.service';
import { UserService } from './user.service';
import { ChangePasswordDto, ChangeProfileDto, ChangeProfilePictureDto, CheckResetPasswordTokenDto, LoginDto, RegisterDto, RequestResetPasswordDto, ResetPasswordDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleType } from 'src/general/role.type';
import { Observable, of } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiBearerAuth()
@ApiTags('Authentication')
@Controller('user')
export class UserController {
    constructor(private userService: UserService, private mailService: MailService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    me(@Req() { user }: any) {
        return this.userService.me(+user.id);
    }

    @Render('account-activation.hbs')
    @Get('email-verification/:token')
    emailVerificationAction(@Param('token') token: any) {
        return this.userService.emailVerificationAction(+token);
    }

    @Get('profile-picture/:filename')
    getPhotoProfile(@Param('filename') filename: string, @Res() res): Observable<Object> {
        let directory = path.join(process.cwd(), 'uploads/profile-picture/' + filename);
        if (!fs.existsSync(directory)) directory = path.join(process.cwd(), 'uploads/error.png');
        return of(res.sendFile(directory));
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.userService.findOne(+id);
        } else {
            throw new ForbiddenException('Only super administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('email-verification')
    emailVerification(@Req() { user }: any) {
        return this.userService.emailVerification(user);
    }

    @Post('login')
    login(@Body() data: LoginDto) {
        return this.userService.login(data);
    }

    @Patch('register')
    register(@Body() data: RegisterDto) {
        return this.userService.register(data);
    }

    @Post('reset-password')
    resetPassword(@Req() req: any, @Body() data: ResetPasswordDto) {
        return this.mailService.sendResetPassword(data.email, req.protocol, req.get('Host'));
    }

    @Post('check-reset-password-token')
    checkResetPasswordToken(@Body() data: CheckResetPasswordTokenDto) {
        return this.userService.checkResetPasswordToken(data);
    }

    @Put('reset-password')
    requestResetPassword(@Body() data: RequestResetPasswordDto) {
        return this.userService.requestResetPassword(data);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('change-password')
    changePassword(@Body() data: ChangePasswordDto, @Req() { user }: any) {
        return this.userService.changePassword(data, user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('change-profile')
    changeProfile(@Body() data: ChangeProfileDto, @Req() { user }: any) {
        return this.userService.changeProfile(data, +user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/profile-picture',
            filename: (req, file, callback) => {
                const uniqueSuffix =
                    Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                const filename = `${file.originalname} - ${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        })
    }))
    @ApiConsumes('multipart/form-data')
    @Put('change-profile-picture')
    changeProfilePicture(@Body() data: ChangeProfilePictureDto, @Req() { user }: any, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 2048000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: true
    })) image: Express.Multer.File) {
        return this.userService.changeProfilePicture(image, +user.id);
    }
}
