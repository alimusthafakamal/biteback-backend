import { Body, Controller, Delete, FileTypeValidator, ForbiddenException, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { AuthGuard } from '@nestjs/passport';
import { InsertProductDto, QueryProductDto, UpdateProductDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Observable, of } from 'rxjs';
import * as fs from 'fs';

@ApiTags('Product')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
    constructor(private productService: ProductService) { }

    @Get()
    findAll(@Query() query: QueryProductDto) {
        return this.productService.findAll(query);
    }

    @Get('/thumbnail/:filename')
    getThumbnail(@Param('filename') filename: string, @Res() res): Observable<Object> {
        let directory = path.join(process.cwd(), 'uploads/product/' + filename);
        if (!fs.existsSync(directory)) directory = path.join(process.cwd(), 'uploads/error.png');
        return of(res.sendFile(directory));
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('thumbnail', {
        storage: diskStorage({
            destination: './uploads/product',
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
    @Patch()
    create(@Body() data: InsertProductDto, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 2048000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: true,
    })) gambar: Express.Multer.File, @Req() { user }: any) {
        if (user.role === 'Admin') {
            return this.productService.create(data, gambar.filename, +user.id);
        } else {
            throw new ForbiddenException('Only super administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('thumbnail', {
        storage: diskStorage({
            destination: './uploads/product',
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
    update(@Param('id') id: string, @Body() data: UpdateProductDto, @Req() { user }: any, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 2048000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false,
    })) gambar?: Express.Multer.File) {
        if (user.role === 'Admin') {
            return this.productService.update(+id, data, gambar?.filename ?? null);
        } else {
            throw new ForbiddenException('Only super administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string, @Req() { user }: any) {
        if (user.role === 'Admin') {
            return this.productService.delete(+id);
        } else {
            throw new ForbiddenException('Only super administrator can access this endpoint.')
        }
    }
}
