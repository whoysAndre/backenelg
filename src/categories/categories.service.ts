import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class CategoriesService {

  @InjectRepository(Category)
  private readonly categoryRepository: Repository<Category>;

  async create(createCategoryDto: CreateCategoryDto, user: User) {
    try {
      const category = this.categoryRepository.create({
        ...createCategoryDto,
        user
      });
      await this.categoryRepository.save(category);
      return category;

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {
    const categories = await this.categoryRepository.find()
    return categories;
  }

  async findOne(id: string) {

    const category = await this.categoryRepository.findOneBy({
      id
    });

    if (!category) throw new NotFoundException(`Category with id - ${id} not found`)

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: User) {

    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto,
      user
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


  async getCategoriesWithPercentages() {
    try {
      const categories = await this.categoryRepository.find({
        relations: ['products'],
      });

      const categoriesData = categories.map(category => ({
        id: category.id,
        name: category.name,
        productCount: category.products?.filter(product => product.isActive).length || 0
      }));

      const totalProducts = categoriesData.reduce((sum, category) => sum + category.productCount, 0);

      if (totalProducts === 0) {
        return {
          message: 'No hay productos activos',
          data: [],
          total: 0
        };
      }
      const data = categoriesData
        .map(category => ({
          id: category.id,
          name: category.name,
          productCount: category.productCount,
          porcentage: parseFloat(((category.productCount / totalProducts) * 100).toFixed(2))
        }))
        .filter(category => category.productCount > 0)
        .sort((a, b) => b.porcentage - a.porcentage);

      return {
        data,
        total: totalProducts
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener estadísticas de categorías');
    }


  }
}
