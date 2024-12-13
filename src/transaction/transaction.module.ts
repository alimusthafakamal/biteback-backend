import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionProvider } from './transaction.provider';
import { TransactionProofProvider } from 'src/transaction-proof/transaction-proof.provider';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, ...TransactionProvider, ...TransactionProofProvider]
})
export class TransactionModule { }
