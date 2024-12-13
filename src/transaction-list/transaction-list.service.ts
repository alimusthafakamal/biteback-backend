import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { TransactionList } from './transaction-list.entity';
import { QueryTransactionListDto, UpdateTransactionListDto } from './dto';
import { Transaction } from 'src/transaction/transaction.entity';
import { Product } from 'src/product/product.entity';
import { User } from 'src/user/user.entity';
import { FindAllTransactionListInterface } from './interface';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { RoleType } from 'src/general/role.type';
import { TransactionProof } from 'src/transaction-proof/transaction-proof.entity';

@Injectable()
export class TransactionListService {
    constructor(
        @Inject('TRANSACTION_LIST_REPOSITORY')
        private transactionListRepository: typeof TransactionList
    ) { }

    async findAll(query: QueryTransactionListDto, user: any): Promise<FindAllTransactionListInterface> {
        const transaction = await this.transactionListRepository.findAll({
            include: [{
                model: Transaction,
                as: 'transaction',
                include: [{
                    model: Product,
                    as: 'product'
                }, {
                    model: TransactionProof,
                    as: 'transactionProof',
                }, {
                    model: User,
                    as: 'user',
                    attributes: {
                        exclude: ['password']
                    }
                }]
            }],
            ...(query?.offset && { offset: query?.offset }),
            ...(query?.limit && { limit: query?.limit }),
            ...(query.order ? {
                order: [[Array.isArray(query.order.index) ? Sequelize.col(query.order.index.join('.')) : query.order.index, query.order.order]]
            } : {
                order: [['createdAt', 'DESC']]
            }),
            where: {
                transactionId: query.transactionId,
                ...(query.search && {
                    [Op.or]: [{
                        '$transaction.referenceNumber': {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        '$transaction.user.fullName$': {
                            [Op.like]: `%${query.search}%`
                        }
                    }, {
                        senderName: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        senderAccountNumber: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        description: {
                            [Op.like]: `%${query.search}%`
                        },
                    }]
                }),
                ...(user.role === RoleType.USER && {
                    '$transaction.userId$': +user.id
                }),
            }
        })
        const jumlahData = await this.transactionListRepository.count({
            include: [{
                model: Transaction,
                as: 'transaction',
                include: [{
                    model: Product,
                    as: 'product'
                }, {
                    model: TransactionProof,
                    as: 'transactionProof',
                }, {
                    model: User,
                    as: 'user',
                    attributes: {
                        exclude: ['password']
                    }
                }]
            }],
            where: {
                transactionId: query.transactionId,
                ...(query.search && {
                    [Op.or]: [{
                        '$transaction.referenceNumber': {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        '$transaction.user.fullName$': {
                            [Op.like]: `%${query.search}%`
                        }
                    }, {
                        senderName: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        senderAccountNumber: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        description: {
                            [Op.like]: `%${query.search}%`
                        },
                    }]
                }),
                ...(user.role === RoleType.USER && {
                    '$transaction.userId$': +user.id
                }),
            }
        })
        return {
            data: transaction,
            totalData: jumlahData,
            totalRow: transaction.length
        }
    }

    async findOne(id: number): Promise<TransactionList> {
        const transactionList = await this.transactionListRepository.findOne({
            include: [{
                model: Transaction,
                as: 'transaction',
                include: [{
                    model: Product,
                    as: 'product'
                }, {
                    model: TransactionProof,
                    as: 'transactionList',
                }, {
                    model: User,
                    as: 'user',
                    attributes: {
                        exclude: ['password']
                    }
                }]
            }],
            where: { id }
        });

        if (!transactionList) throw new UnprocessableEntityException('Transaction list not found');
        return transactionList;
    }

    async update(id: number, data: UpdateTransactionListDto): Promise<TransactionList> {
        return this.transactionListRepository.update(data, { where: { id } }).then(async (res) => await this.findOne(id));
    }

    async delete(id: number): Promise<TransactionList> {
        const transactionList: TransactionList = await this.findOne(id);
        return await this.transactionListRepository.destroy({ where: { id } }).then(async () => await this.findOne(id));
    }
}
