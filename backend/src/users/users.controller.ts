import { User } from '@app/common/decorators/user.decorator';
import { JwtGuard } from '@app/common/guards/jwt.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CartsService } from '../carts/carts.service';
import { OrdersService } from '../orders/orders.service';
import { WishlistsService } from '../wishlists/wishlists.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly wishlistsService: WishlistsService,
    private readonly cartsService: CartsService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  findMe(@User('sub') userId: string) {
    return this.usersService.findMe(userId);
  }

  @Get('count')
  findUsersCount() {
    return this.usersService.findUsersCount();
  }

  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  async remove(@Param('userId') userId: string, @Res() res: Response) {
    await this.usersService.remove(userId);

    res.clearCookie('access-token');

    return {
      message: 'User deleted successfully',
    };
  }

  @Get(':userId/orders')
  @UseGuards(JwtGuard)
  findUserOrders(@Param('userId') userId: string) {
    return this.ordersService.findUserOrders(userId);
  }

  @Get(':userId/wishlists')
  @UseGuards(JwtGuard)
  findUserWishlist(@Param('userId') userId: string) {
    return this.wishlistsService.findUserWishlist(userId);
  }

  @Get(':userId/carts')
  @UseGuards(JwtGuard)
  findUserCart(@Param('userId') userId: string) {
    return this.cartsService.findUserCart(userId);
  }
}
