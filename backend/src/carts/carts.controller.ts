import { User } from '@app/common/decorators/user.decorator';
import { JwtGuard } from '@app/common/guards/jwt.guard';
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
import { AddProductToCartDto } from './add-product-to-cart.dto';
import { CartsService } from './carts.service';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  findAll() {
    return this.cartsService.findAll();
  }

  @Get(':cartId')
  findOne(@Param('cartId') cartId: string) {
    return this.cartsService.findOne(cartId);
  }

  @Patch(':cartId')
  update(
    @Param('cartId') cartId: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartsService.update(cartId, updateCartDto);
  }

  @Post('products/:productId')
  @UseGuards(JwtGuard)
  addProductToCart(
    @User('sub') userId: string,
    @Param('productId') productId: string,
    @Body() addProductToCartDto: AddProductToCartDto,
  ) {
    return this.cartsService.addProductToCart(
      userId,
      productId,
      addProductToCartDto,
    );
  }

  @Delete('products/:productId')
  @UseGuards(JwtGuard)
  removeProductFromCart(
    @User('sub') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartsService.removeProductFromCart(
      userId,
      productId,
    );
  }

  @Put('clear')
  @UseGuards(JwtGuard)
  clearCart(@User('sub') userId: string) {
    return this.cartsService.clearCart(userId);
  }
}
