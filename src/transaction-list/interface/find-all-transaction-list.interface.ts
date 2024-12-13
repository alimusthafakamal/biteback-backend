import { TransactionList } from "../transaction-list.entity";

export interface FindAllTransactionListInterface {
    readonly data: TransactionList[],
    readonly totalData: number,
    readonly totalRow: number,
}