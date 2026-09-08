import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { JwtGuard } from '@app/common/guards/jwt.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Roles } from '@app/common/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.productsService.findAll();
  }

  @Get('/search')
  findProductsByQuery(
    @Query()
    query: ProductQueryDto,
  ) {
    return this.productsService.findProductsByQuery(query);
  }

  @Get('count')
  findProductsAndCategoriesCount() {
    return this.productsService.findProductsAndCategoriesCount();
  }

  @Get(':productId')
  findOne(@Param('productId') productId: string) {
    return this.productsService.findOne(productId);
  }

  @Patch(':productId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(productId, updateProductDto);
  }

  @Delete(':productId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('productId') productId: string) {
    return this.productsService.remove(productId);
  }

  @Put('/remove-selected-products')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  removeSelectedProducts(@Body() productsIds: string[]) {
    return this.productsService.removeSelectedProducts(productsIds);
  }
}
