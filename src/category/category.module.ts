import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryProvider } from './category.provider';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ...CategoryProvider]
})
export class CategoryModule { }
