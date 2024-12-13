import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Transaction } from "src/transaction/transaction.entity";

@Table({
    tableName: 'transaction_proof'
})
export class TransactionProof extends Model<TransactionProof> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @ForeignKey(() => Transaction)
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'transaction_id'
    })
    transactionId: number;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false,
    })
    file: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false
    })
    senderName: string;

    @Column({
        type: new DataType.STRING(50),
        allowNull: false
    })
    senderAccountNumber: string;

    @Column({
        type: DataType.TEXT('medium'),
        allowNull: true
    })
    description?: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'created_at'
    })
    createdAt: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'updated_at'
    })
    updatedAt: string;

    @BelongsTo(() => Transaction, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    transaction: Transaction;
}