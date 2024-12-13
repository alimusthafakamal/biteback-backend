import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { TransactionProof } from './transaction-proof.entity';
import { InsertTransactionProofDto, QueryTransactionProofDto, UpdateTransactionProofDto } from './dto';
import { Transaction } from 'src/transaction/transaction.entity';
import { Product } from 'src/product/product.entity';
import { User } from 'src/user/user.entity';
import * as path from 'path';
import * as fs from 'fs';
import { FindAllTransactionProofInterface } from './interface';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { RoleType } from 'src/general/role.type';
import { TransactionList } from 'src/transaction-list/transaction-list.entity';

@Injectable()
export class TransactionProofService {
    constructor(
        @Inject('TRANSACTION_PROOF_REPOSITORY')
        private transactionProofRepository: typeof TransactionProof
    ) { }

    async findAll(query: QueryTransactionProofDto, user: any): Promise<FindAllTransactionProofInterface> {
        const transaction = await this.transactionProofRepository.findAll({
            include: [{
                model: Transaction,
                as: 'transaction',
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
                ...(query.userId && {
                    '$transaction.userId$': query.userId
                }),
                ...(query.isPaid && {
                    '$transaction.isPaid$': query.isPaid
                }),
            }
        })
        const jumlahData = await this.transactionProofRepository.count({
            include: [{
                model: Transaction,
                as: 'transaction',
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
                }]
            }],
            where: {
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
                ...(query.userId && {
                    '$transaction.userId$': query.userId
                }),
                ...(query.isPaid && {
                    '$transaction.isPaid$': query.isPaid
                }),
            }
        })
        return {
            data: transaction,
            totalData: jumlahData,
            totalRow: transaction.length
        }
    }

    async findOne(id: number): Promise<TransactionProof> {
        const transactionProof = await this.transactionProofRepository.findOne({
            include: [{
                model: Transaction,
                as: 'transaction',
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
                }]
            }],
            where: { id }
        });

        if (!transactionProof) throw new UnprocessableEntityException('Transaction proof not found');
        return transactionProof;
    }

    async create(transactionId: number, data: InsertTransactionProofDto, filename: Express.Multer.File['filename']): Promise<TransactionProof> {
        return this.transactionProofRepository.create({ ...data, transactionId, file: filename }).then(async (res) => await this.findOne(res.id));
    }

    async update(id: number, data: UpdateTransactionProofDto, filename?: Express.Multer.File['filename']): Promise<TransactionProof> {
        return this.transactionProofRepository.update({ ...data, ...(filename && { file: filename }) }, { where: { id } }).then(async (res) => await this.findOne(id));
    }

    async delete(id: number): Promise<TransactionProof> {
        const transactionProof: TransactionProof = await this.findOne(id);
        let directory = path.join(process.cwd(), `uploads/content/${transactionProof.file}`);
        if (fs.existsSync(directory)) fs.unlinkSync(directory);
        return await this.transactionProofRepository.destroy({ where: { id } }).then(async () => await this.findOne(id));
    }
}
