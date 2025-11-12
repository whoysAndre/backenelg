import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';


@Injectable()
export class DashboardService {

  constructor(
    private readonly productService: ProductsService
  ) { }

  async getInventoryStats() {

    const products = await this.productService.findAll();

    const totalStock = products.reduce((acc, product) => {
      const stockForProducts = product.variantProduct.reduce((acc2, variant) => acc2 + variant.stock, 0);
      return acc + stockForProducts;
    }, 0);


    const totalValueInventary = products.reduce((acc, product) => {
      const stockForProducts = product.variantProduct.reduce((acc2, variant) => acc2 + variant.stock, 0);
      return acc + (product.price * stockForProducts);
    }, 0);

    return {
      totalStock,
      totalValueInventary
    };
  }



}
