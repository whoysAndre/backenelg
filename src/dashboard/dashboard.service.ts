import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { SalesService } from 'src/sales/sales.service';

@Injectable()
export class DashboardService {

  constructor(
    private readonly productService: ProductsService,
    private readonly saleService: SalesService
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

    for (const p of products) {
      const stock = p.variantProduct.reduce((a, v) => a + v.stock, 0);
      if (stock > highesStock) {
        highesStock = stock;
        productWithHighestStock = { title: p.title, stock }
      }
    }

    //Alerts
    const lowStockProducts = products.filter(p => {
      const stock = p.variantProduct.reduce((acc, v) => acc + v.stock, 0);
      return stock < 5;
    });

    const sales = await this.saleService.findAll();


    //TOP 1 client with highes buy 
    const clientTotals: Record<string, { name: string; total: number }> = {};

    for (const sale of sales) {
      const clientId = sale.client.id;
      const clientName = `${sale.client.name} ${sale.client.lastname}`;

      const totalQuantity = sale.details.reduce(
        (acc, item) => acc + Number(item.quantity),
        0
      );

      if (!clientTotals[clientId]) {
        clientTotals[clientId] = { name: clientName, total: 0 };
      }

      clientTotals[clientId].total += totalQuantity;
    }

    const topClient = Object.values(clientTotals).reduce((max, curr) =>
      curr.total > max.total ? curr : max
    );

    return {
      totalStock,
      totalValue,
      variantsTotal,
      productWithLowestStock,
      productWithHighestStock,
      alerts: {
        lowStack: lowStockProducts.length
      },
      topClient
    };
  }

}
