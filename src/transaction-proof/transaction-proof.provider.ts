import { TransactionProof } from './transaction-proof.entity';

export const TransactionProofProvider = [
    {
        provide: 'TRANSACTION_PROOF_REPOSITORY',
        useValue: TransactionProof,
    },
];
