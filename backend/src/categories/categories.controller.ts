import {
  Controller,
  Get,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    console.log('🔥 Frontend requested /categories endpoint');
    return this.categoriesService.findAll();
  }
}