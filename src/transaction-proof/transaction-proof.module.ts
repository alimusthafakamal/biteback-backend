import { Module } from '@nestjs/common';
import { TransactionProofController } from './transaction-proof.controller';
import { TransactionProofService } from './transaction-proof.service';
import { TransactionProofProvider } from './transaction-proof.provider';

@Module({
  controllers: [TransactionProofController],
  providers: [TransactionProofService, ...TransactionProofProvider]
})
export class TransactionProofModule { }
