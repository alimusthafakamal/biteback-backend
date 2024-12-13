import { TransactionList } from './transaction-list.entity';

export const TransactionListProvider = [
    {
        provide: 'TRANSACTION_LIST_REPOSITORY',
        useValue: TransactionList,
    },
];
