import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductProvider } from './product.provider';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ...ProductProvider]
})
export class ProductModule { }
