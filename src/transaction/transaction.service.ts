import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Transaction } from './transaction.entity';
import { FindAllTransactionInterface } from './interface';
import { Sequelize } from 'sequelize-typescript';
import { Product } from 'src/product/product.entity';
import { User } from 'src/user/user.entity';
import { Op } from 'sequelize';
import { InsertTransactionDto, MarkAsPaidDto, QueryTransactionDto } from './dto';
import { RoleType } from 'src/general/role.type';
import { TransactionProof } from 'src/transaction-proof/transaction-proof.entity';
import * as path from 'path';
import * as fs from 'fs';
import { TransactionList } from 'src/transaction-list/transaction-list.entity';

@Injectable()
export class TransactionService {
    constructor(
        @Inject('TRANSACTION_REPOSITORY')
        private transactionRepository: typeof Transaction,

        @Inject('TRANSACTION_PROOF_REPOSITORY')
        private transactionProofRepository: typeof TransactionProof,
    ) { }

    async findAll(query: QueryTransactionDto, user: any): Promise<FindAllTransactionInterface> {
        const transaction = await this.transactionRepository.findAll({
            include: [{
                model: TransactionList,
                as: 'transactionList',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }, {
                model: User,
                as: 'user',
                attributes: {
                    exclude: ['password']
                }
            }, {
                model: TransactionProof,
                as: 'transactionProof'
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
                        referenceNumber: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        '$user.fullName$': {
                            [Op.like]: `%${query.search}%`
                        }
                    }]
                }),
                ...(user.role === RoleType.USER && {
                    userId: user.id
                }),
                ...(query.userId && {
                    userId: query.userId
                }),
                ...(query.isPaid && {
                    isPaid: query.isPaid
                }),
            }
        })
        const jumlahData = await this.transactionRepository.count({
            include: [{
                model: TransactionList,
                as: 'transactionList',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }, {
                model: User,
                as: 'user',
                attributes: {
                    exclude: ['password']
                }
            }],
            where: {
                ...(query.search && {
                    [Op.or]: [{
                        referenceNumber: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        '$user.fullName$': {
                            [Op.like]: `%${query.search}%`
                        }
                    }]
                }),
                ...(user.role === RoleType.USER && {
                    userId: +user.id
                }),
                ...(query.userId && {
                    userId: query.userId
                }),
                ...(query.isPaid && {
                    isPaid: query.isPaid
                }),
            }
        })
        return {
            data: transaction,
            totalData: jumlahData,
            totalRow: transaction.length
        }
    }

    async findOne(id: number, user: any): Promise<Transaction> {
        const transaction = await this.transactionRepository.findOne({
            include: [{
                model: TransactionList,
                as: 'transactionList',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }, {
                model: User,
                as: 'user',
                attributes: {
                    exclude: ['password']
                }
            }, {
                model: TransactionProof,
                as: 'transactionProof'
            }],
            where: {
                id,
                ...(user.role === RoleType.USER && {
                    userId: +user.id
                })
            }
        });

        if (!transaction) throw new UnprocessableEntityException('Transaction not found');

        return transaction;
    }

    async create(data: InsertTransactionDto, user: any) {
        const transaction = await this.transactionRepository.create({ ...data, userId: +user.id }).then(async (res) => await this.findOne(res.id, user));
        return transaction;
    }

    async markAsPaid(id: number, data: MarkAsPaidDto, user: any): Promise<Transaction> {
        const transaction = await this.findOne(id, user);
        return await this.transactionRepository.update(data, { where: { id } }).then(async () => await this.findOne(id, user))
    }

    async delete(id: number, user: any) {
        const transaction = await this.findOne(+user.id, user);
        if (transaction.isPaid && user.role === RoleType.USER) throw new UnprocessableEntityException('Transaction cannot be deleted, because the payment has already been paid')

        if (transaction.transactionProof.length > 0) {
            transaction.transactionProof.map((val) => {
                let directory = path.join(process.cwd(), `uploads/transaction-proof/${val.file}`);
                if (fs.existsSync(directory)) fs.unlinkSync(directory);
            })

            await this.transactionProofRepository.destroy({ where: { transactionId: id } });
        }

        return await this.transactionRepository.destroy({ where: { id } });
    }
}
