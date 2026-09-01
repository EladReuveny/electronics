import { Test, TestingModule } from '@nestjs/testing';
import { WishlistsService } from '../wish-lists/wishlists.service';
import { WishlistsController } from './wishlists.controller';

describe('WishlistsController', () => {
  let controller: WishlistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistsController],
      providers: [WishlistsService],
    }).compile();

    controller = module.get<WishlistsController>(WishlistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
