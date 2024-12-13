import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from "sequelize-typescript";
import { Product } from "src/product/product.entity";
import { Transaction } from "src/transaction/transaction.entity";

@Table({
    tableName: 'transaction_list'
})
export class TransactionList extends Model<TransactionList> {
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

    @ForeignKey(() => Product)
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'product_id'
    })
    productId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    qty: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: false
    })
    price: number;

    @BelongsTo(() => Transaction, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    transaction: Transaction;

    @BelongsTo(() => Transaction, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    product: Product;
}
