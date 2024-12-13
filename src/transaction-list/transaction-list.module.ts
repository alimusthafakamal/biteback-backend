import { Module } from '@nestjs/common';
import { TransactionListController } from './transaction-list.controller';
import { TransactionListService } from './transaction-list.service';
import { TransactionListProvider } from './transaction-list.provider';

@Module({
  controllers: [TransactionListController],
  providers: [TransactionListService, ...TransactionListProvider]
})
export class TransactionListModule { }
