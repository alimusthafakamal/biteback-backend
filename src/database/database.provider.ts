
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { Category } from 'src/category/category.entity';
import { Configuration } from 'src/configuration/configuration.entity';
import { Product } from 'src/product/product.entity';
import { TransactionList } from 'src/transaction-list/transaction-list.entity';
import { TransactionProof } from 'src/transaction-proof/transaction-proof.entity';
import { Transaction } from 'src/transaction/transaction.entity';
import { ResetPassword } from 'src/user/reset-password.entity';
import { User } from 'src/user/user.entity';
import { ValidationAttempt } from 'src/user/validation-attempt.entity';

export const DatabaseProvider = [
    {
        provide: 'SEQUELIZE',
        useFactory: async (configService: ConfigService) => {
            const sequelize: Sequelize = new Sequelize({
                dialect: 'mysql',
                host: configService.get<string>('DATABASE_HOST', 'localhost'),
                port: configService.get<number>('DATABASE_PORT', 3306),
                username: configService.get<string>('DATABASE_USERNAME', 'root'),
                password: configService.get<string>('DATABASE_PASSWORD', ''),
                database: configService.get<string>('DATABASE_NAME', 'biteback'),
                logging: false,
                timezone: 'Asia/Jakarta',
                dialectOptions: {
                    timezone: 'local',
                    typeCast: function (field, next) {
                        if (field.type === 'DATETIME' || field.type === 'DATE' || field.type === 'TIMESTAMP') {
                            const offset = new Date().getTimezoneOffset() * 60000;
                            return new Date(new Date(field.string()).getTime() - offset);
                        }

                        return next();
                    },
                },
            });
            sequelize.addModels([Configuration, User, ResetPassword, ValidationAttempt, Category, Product, Transaction, TransactionList, TransactionProof]);
            await sequelize.sync({ alter: true });
            return sequelize;
        },
        inject: [ConfigService],
    },
];
