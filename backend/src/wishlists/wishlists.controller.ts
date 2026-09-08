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
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistsService } from './wishlists.service';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.wishlistsService.findAll();
  }

  @Get(':wishlistId')
  @UseGuards(JwtGuard)
  findOne(@Param('wishlistId') wishlistId: string) {
    return this.wishlistsService.findOne(wishlistId);
  }

  @Patch(':wishlistId')
  @UseGuards(JwtGuard)
  update(
    @Param('wishlistId') wishlistId: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.update(wishlistId, updateWishlistDto);
  }

  @Post('products/:productId')
  @UseGuards(JwtGuard)
  addProductToWishlist(
    @User('sub') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.addProductToWishlist(userId, productId);
  }

  @Delete('products/:productId')
  @UseGuards(JwtGuard)
  removeProductFromWishlist(
    @User('sub') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.removeProductFromWishlist(userId, productId);
  }

  @Put('clear')
  @UseGuards(JwtGuard)
  clearWishlist(@User('sub') userId: string) {
    return this.wishlistsService.clearWishlist(userId);
  }
}
