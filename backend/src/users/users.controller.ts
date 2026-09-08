import { Roles } from '@app/common/decorators/roles.decorator';
import { User } from '@app/common/decorators/user.decorator';
import { JwtGuard } from '@app/common/guards/jwt.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
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
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
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
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async findMe(@User('sub') userId: string) {
    const user = await this.usersService.findMe(userId);

    return this.usersService.sanitizeUserWithoutPassword(user);
  }

  @Get('count')
  findUsersCount() {
    return this.usersService.findUsersCount();
  }

  @Patch(':userId')
  @UseGuards(JwtGuard)
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch(':userId/role')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  updateUserRole(
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(userId, updateUserRoleDto);
  }

  @Delete(':userId')
  @UseGuards(JwtGuard)
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
