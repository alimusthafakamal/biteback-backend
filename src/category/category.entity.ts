import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { User } from "src/user/user.entity";

@Table({
    tableName: 'category'
})
export class Category extends Model<Category> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @ForeignKey(() => Category)
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        allowNull: true,
    })
    pid?: number;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false
    })
    name: string;

    @Column({
        type: new DataType.TEXT('long'),
        allowNull: false
    })
    description: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    priority: number;

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
    parent: Category;

    @HasMany(() => Category)
    children?: Category[];
}