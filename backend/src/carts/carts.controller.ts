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
  UseGuards,
} from '@nestjs/common';
import { AddProductToCartDto } from './add-product-to-cart.dto';
import { CartsService } from './carts.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Roles } from '@app/common/decorators/roles.decorator';
import { RolesGuard } from '@app/common/guards/roles.guard';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.cartsService.findAll();
  }

  @Get(':cartId')
  @UseGuards(JwtGuard)
  findOne(@Param('cartId') cartId: string) {
    return this.cartsService.findOne(cartId);
  }

  @Patch(':cartId')
  @UseGuards(JwtGuard)
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
    return this.cartsService.removeProductFromCart(userId, productId);
  }

  @Put('clear')
  @UseGuards(JwtGuard)
  clearCart(@User('sub') userId: string) {
    return this.cartsService.clearCart(userId);
  }
}
