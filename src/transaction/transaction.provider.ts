import { Transaction } from './transaction.entity';

export const TransactionProvider = [
    {
        provide: 'TRANSACTION_REPOSITORY',
        useValue: Transaction,
    },
];
