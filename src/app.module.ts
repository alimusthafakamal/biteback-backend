import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';
import { ProductModule } from './product/product.module';
import { TransactionModule } from './transaction/transaction.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { TransactionProofModule } from './transaction-proof/transaction-proof.module';
import { TransactionListModule } from './transaction-list/transaction-list.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ConfigurationModule,
    UserModule,
    MailModule,
    CategoryModule,
    ProductModule,
    TransactionModule,
    TransactionProofModule,
    TransactionListModule,
  ],
})
export class AppModule { }
