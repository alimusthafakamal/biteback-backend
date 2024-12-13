import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InsertCategoryDto, QueryCategoryDto } from './dto';
import { Op } from 'sequelize';
import { FindAllCategoryInterface } from './interface';
import { Category } from './category.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class CategoryService {
    constructor(
        @Inject('CATEGORY_REPOSITORY')
        private categoryRepository: typeof Category,
    ) { }

    async findAll(query: QueryCategoryDto): Promise<FindAllCategoryInterface> {
        const category = await this.categoryRepository.findAll({
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
                        name: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        '$user.full_name$': {
                            [Op.like]: `%${query.search}%`
                        }
                    }]
                }),
                ...(query.pid && {
                    pid: query.pid
                })
            }
        })
        const jumlahData = await this.categoryRepository.count({
            where: {
                ...(query.search && {
                    [Op.or]: [{
                        name: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        '$user.full_name$': {
                            [Op.like]: `%${query.search}%`
                        }
                    }]
                }),
                ...(query.pid && {
                    pid: query.pid
                })
            }
        })
        return {
            data: category,
            totalData: jumlahData,
            totalRow: category.length
        }
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id }
        });

        if (!category) throw new UnprocessableEntityException('Category not found');

        return category;
    }

    async create(data: InsertCategoryDto, userId: number): Promise<Category> {
        return await this.categoryRepository.create(data).then(async (res) => await this.categoryRepository.findByPk(res.id));
    }

    async update(id: number, data: InsertCategoryDto): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { id } });

        if (!category) throw new UnprocessableEntityException('Category not found');

        return await this.categoryRepository.update(data, { where: { id } }).then(async () => await this.categoryRepository.findOne({
            where: { id }
        }));

    }

    async delete(id: number): Promise<Category> {
        const category = await this.categoryRepository.findOne({ where: { id } });

        if (!category) throw new UnprocessableEntityException('Category not found');

        return await this.categoryRepository.destroy({ where: { id } }).then(() => category);
    }
}
