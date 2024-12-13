import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { AuthGuard } from '@nestjs/passport';
import { InsertCategoryDto, QueryCategoryDto } from './dto';

@ApiTags('Category')
@ApiBearerAuth()
@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService) { }

    @Get()
    findAll(@Query() query: QueryCategoryDto) {
        return this.categoryService.findAll(query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoryService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch()
    create(@Body() data: InsertCategoryDto, @Req() { user }: any) {
        if (user.role === 'Admin') {
            return this.categoryService.create(data, +user.id);
        } else {
            throw new ForbiddenException('Only super administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    update(@Param('id') id: string, @Body() data: InsertCategoryDto, @Req() { user }: any) {
        if (user.role === 'Admin') {
            return this.categoryService.update(+id, data);
        } else {
            throw new ForbiddenException('Only super administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string, @Req() { user }: any) {
        if (user.role === 'Admin') {
            return this.categoryService.delete(+id);
        } else {
            throw new ForbiddenException('Only super administrator can access this endpoint.')
        }
    }
}
