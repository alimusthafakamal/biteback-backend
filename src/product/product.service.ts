import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InsertProductDto, QueryProductDto, UpdateProductDto } from './dto';
import { Op } from 'sequelize';
import { FindAllProductInterface } from './interface';
import { Product } from './product.entity';
import { Sequelize } from 'sequelize-typescript';
import { Category } from 'src/category/category.entity';

@Injectable()
export class ProductService {
    constructor(
        @Inject('PRODUCT_REPOSITORY')
        private productRepository: typeof Product,
    ) { }

    async findAll(query: QueryProductDto): Promise<FindAllProductInterface> {
        const product = await this.productRepository.findAll({
            include: [{
                model: Category,
                as: 'category'
            }],
            ...(query?.offset && { offset: query?.offset }),
            ...(query?.limit && { limit: query?.limit }),
            ...(query.order ? {
                order: [[Array.isArray(query.order.index) ? Sequelize.col(query.order.index.join('.')) : query.order.index, query.order.order]]
            } : {
                order: [['createdAt', 'DESC']]
            }),
            where: {
                ...(query.search && {
                    [Op.or]: [{
                        title: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        price: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        description: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        '$category.name$': {
                            [Op.like]: `%${query.search}%`
                        }
                    }]
                })
            }
        })
        const jumlahData = await this.productRepository.count({
            include: [{
                model: Category,
                as: 'category'
            }],
            where: {
                ...(query.search && {
                    [Op.or]: [{
                        title: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        price: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        description: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        '$category.name$': {
                            [Op.like]: `%${query.search}%`
                        }
                    }]
                })
            }
        })
        return {
            data: product,
            totalData: jumlahData,
            totalRow: product.length
        }
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({
            include: [{
                model: Category,
                as: 'category'
            }],
            where: { id }
        });

        if (!product) throw new UnprocessableEntityException('Product not found');

        return product;
    }

    async create(data: InsertProductDto, filename: string, userId: number): Promise<Product> {
        const { thumbnail, ...filteredData } = data;
        return await this.productRepository.create({ ...filteredData, thumbnail: filename }).then(async (res) => await this.findOne(res.id));
    }

    async update(id: number, data: UpdateProductDto, filename?: string): Promise<Product> {
        const { thumbnail, ...filteredData } = data;
        const product = await this.productRepository.findOne({ where: { id } });

        if (!product) throw new UnprocessableEntityException('Product not found');

        return await this.productRepository.update({ ...filteredData, ...(filename && { thumbnail: filename }) }, { where: { id } }).then(async () => await this.findOne(id));

    }

    async delete(id: number): Promise<Product> {
        const product = await this.findOne(id);

        if (!product) throw new UnprocessableEntityException('Product not found');

        return await this.productRepository.destroy({ where: { id } }).then(() => product);
    }
}
