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
  UseGuards,
} from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtGuard)
  checkout(@User('sub') userId: string, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.checkout(userId, createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('xml-format')
  findAllAsXML() {
    return this.ordersService.findAllAsXML();
  }

  @Get('count')
  findOrdersCount() {
    return this.ordersService.findOrdersCount();
  }

  @Get(':orderId')
  findOne(@Param('orderId') orderId: string) {
    return this.ordersService.findOne(orderId);
  }

  @Patch(':orderId')
  update(
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(orderId, updateOrderDto);
  }

  @Delete(':orderId')
  remove(@Param('orderId') orderId: string) {
    return this.ordersService.remove(orderId);
  }

  @Patch(':orderId/cancel')
  @UseGuards(JwtGuard)
  cancelOrder( @User('sub') userId: string, @Param('orderId') orderId: string) {
    return this.ordersService.cancelOrder(userId, orderId);
  }
}
