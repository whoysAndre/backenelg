import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';


@Injectable()
export class DashboardService {

  constructor(
    private readonly productService: ProductsService
  ) { }

  async getInventoryStats() {

    const products = await this.productService.findAll();

    const totalProducts = products.length;

    const totalStock = products.reduce((acc, product) => {
      const stockForProducts = product.variantProduct.reduce((acc2, variant) => acc2 + variant.stock, 0);
      return acc + stockForProducts;
    }, 0);

    const totalValue = products.reduce((acc, product) => {
      const stockForProducts = product.variantProduct.reduce((acc2, variant) => acc2 + variant.stock, 0);
      return acc + (product.price * stockForProducts);
    }, 0);

    const variantsTotal = products.reduce((acc, p) => acc + p.variantProduct.length, 0);

    // Product with Lower Stock
    let productWithLowestStock = {};
    let lowestStock = Infinity;
    for (const p of products) {
      const stock = p.variantProduct.reduce((a, v) => a + v.stock, 0);
      if (stock < lowestStock) {
        lowestStock = stock;
        productWithLowestStock = { title: p.title, stock }
      }
    }

    //Product with Highes stock
    let productWithHighestStock = {};
    let highesStock = -Infinity;

    for(const p of products){
      const stock = p.variantProduct.reduce((a, v) => a + v.stock, 0);
      if(stock > highesStock){
        highesStock = stock;
        productWithHighestStock = { title: p.title,stock}
      }
    }

    //Alerts
    const lowStockProducts = products.filter(p=>{
      const stock = p.variantProduct.reduce((acc,v)=> acc + v.stock ,0);
      return stock < 5;
    });

    //Graficts -> Alex Acedo
    
    return {
      totalStock,
      totalValue,
      variantsTotal,
      productWithLowestStock,
      productWithHighestStock,
      alerts:{
        lowStack: lowStockProducts.length
      }
    };
  }

}
