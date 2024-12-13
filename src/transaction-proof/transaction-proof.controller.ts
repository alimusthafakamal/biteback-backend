import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { TransactionProofService } from './transaction-proof.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { InsertTransactionProofDto, QueryTransactionProofDto, UpdateTransactionProofDto } from './dto';

@ApiTags('Transaction Proof')
@ApiBearerAuth()
@Controller('transaction-proof')
export class TransactionProofController {
    constructor(private transactionProofService: TransactionProofService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Query() query: QueryTransactionProofDto, @Req() { user }: any) {
        return this.transactionProofService.findAll(query, user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transactionProofService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/transaction-proof',
            filename: (req, file, callback) => {
                const uniqueSuffix =
                    Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                const filename = `${file.originalname} - ${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        })
    }))
    @ApiConsumes('multipart/form-data')
    @Patch('transaction/:transactionId')
    create(@Param('transactionId') transactionId: string, @Body() data: InsertTransactionProofDto, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 2048000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: true,
    })) file: Express.Multer.File) {
        return this.transactionProofService.create(+transactionId, data, file.filename);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/transaction-proof',
            filename: (req, file, callback) => {
                const uniqueSuffix =
                    Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                const filename = `${file.originalname} - ${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        })
    }))
    @ApiConsumes('multipart/form-data')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateTransactionProofDto, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 2048000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false,
    })) file?: Express.Multer.File) {
        return this.transactionProofService.update(+id, data, file?.filename);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.transactionProofService.delete(+id);
    }
}
