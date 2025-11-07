import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {

  @InjectRepository(Category)
  private readonly categoryRepository: Repository<Category>;

  async create(createCategoryDto: CreateCategoryDto) {
    try {

      const category = this.categoryRepository.create(createCategoryDto);
      await this.categoryRepository.save(category);
      return category;

    } catch (error) {

    }

    return 'This action adds a new category';
  }

  async findAll() {

    const categories = await this.categoryRepository.find({
      relations: {
        products: true
      }
    })

    return categories;
  }

  async findOne(id: string) {

    const category = await this.categoryRepository.findOneBy({
      id
    });

    if (!category) throw new NotFoundException(`Category with id - ${id} not found`)

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {

    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto
    })
    if (!category) throw new NotFoundException(`Category with id - ${id} not found`);
    try {
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {

    const category = await this.findOne(id);

    await this.categoryRepository.remove(category);

    return {
      status: true,
      message: "Category deleted"
    }

  }
}
