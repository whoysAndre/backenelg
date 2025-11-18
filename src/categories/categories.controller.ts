import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { Roles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@Controller('categories')
export class CategoriesController {

  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @Auth(Roles.ADMIN)
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoriesService.create(createCategoryDto, user);
  }

  @Get()
  @Auth(Roles.ADMIN)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Auth(Roles.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Auth(Roles.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto, @GetUser() user: User) {
    return this.categoriesService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  @Auth(Roles.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }


  @Get('statistics/percentages')
  @Auth(Roles.ADMIN)
  getCategoriesPercentages() {
    return this.categoriesService.getCategoriesWithPercentages();
  }
}
