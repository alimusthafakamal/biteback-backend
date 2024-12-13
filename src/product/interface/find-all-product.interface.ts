import { Product } from "../product.entity";

export interface FindAllProductInterface {
    readonly data: Product[],
    readonly totalData: number,
    readonly totalRow: number,
}