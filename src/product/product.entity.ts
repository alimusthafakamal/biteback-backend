import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { Category } from "src/category/category.entity";
import { TransactionList } from "src/transaction-list/transaction-list.entity";
import { Transaction } from "src/transaction/transaction.entity";

@Table({
    tableName: 'product'
})
export class Product extends Model<Product> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @ForeignKey(() => Category)
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'category_id'
    })
    categoryId: number;

    @Column({
        type: new DataType.TEXT('medium'),
        allowNull: false
    })
    title: string;

    @Column({
        type: new DataType.TEXT('long'),
        allowNull: false
    })
    description: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false,
    })
    thumbnail: string;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    price: number;

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

    @BelongsTo(() => Category, {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    })
    category: Category;

    @HasMany(() => TransactionList)
    transactionList?: TransactionList[];
}