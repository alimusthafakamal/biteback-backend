import { Transaction } from "../transaction.entity";

export interface FindAllTransactionInterface {
    readonly data: Transaction[],
    readonly totalData: number,
    readonly totalRow: number,
}