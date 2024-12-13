import { Category } from "../category.entity";

export interface FindAllCategoryInterface {
    readonly data: Category[],
    readonly totalData: number,
    readonly totalRow: number,
}