import { TransactionProof } from "../transaction-proof.entity";

export interface FindAllTransactionProofInterface {
    readonly data: TransactionProof[],
    readonly totalData: number,
    readonly totalRow: number,
}