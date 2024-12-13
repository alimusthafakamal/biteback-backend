import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { TransactionList } from "src/transaction-list/transaction-list.entity";
import { TransactionProof } from "src/transaction-proof/transaction-proof.entity";
import { User } from "src/user/user.entity";

@Table({
    tableName: 'transaction'
})
export class Transaction extends Model<Transaction> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'user_id'
    })
    userId: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'reference_number'
    })
    referenceNumber?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_paid'
    })
    isPaid: boolean;

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

    @BelongsTo(() => User, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    user: User;

    @HasOne(() => TransactionProof)
    transactionProof?: TransactionProof[];

    @HasMany(() => TransactionList)
    transactionList: TransactionList[];
}