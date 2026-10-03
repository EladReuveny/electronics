import { Roles } from '@app/common/decorators/roles.decorator';
import { JwtGuard } from '@app/common/guards/jwt.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import {
  FILE_TYPE,
  MAX_FILE_SIZE,
} from '@app/infrastructure/cloudinary/cloudinary.constants';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('imageFile'))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: FILE_TYPE,
            skipMagicNumbersValidation: false,
          }),
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
        ],
        fileIsRequired: false,
      }),
    )
    productImage?: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, productImage);
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
  @UseInterceptors(FileInterceptor('imageFile'))
  update(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: FILE_TYPE,
            skipMagicNumbersValidation: false,
          }),
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
        ],
        fileIsRequired: false,
      }),
    )
    productImage?: Express.Multer.File,
  ) {
    return this.productsService.update(
      productId,
      updateProductDto,
      productImage,
    );
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
