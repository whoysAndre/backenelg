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
    const sales = await this.saleService.findAll();


    if (!products || products.length === 0) {
      return {
        totalStock: 0,
        totalValue: 0,
        variantsTotal: 0,
        productWithLowestStock: { title: "Ninguno", stock: 0 },
        productWithHighestStock: { title: "Ninguno", stock: 0 },
        alerts: {
          lowStack: 0,
        },
        topClient: {
          name: "Sin clientes",
          total: 0,
        },
      };
    }

    const totalStock = products.reduce((acc, product) => {
      const stockForProducts = (product.variantProduct ?? []).reduce(
        (acc2, variant) => acc2 + (variant?.stock ?? 0),
        0
      );
      return acc + stockForProducts;
    }, 0);

    const totalValue = products.reduce((acc, product) => {
      const stockForProducts = (product.variantProduct ?? []).reduce(
        (acc2, variant) => acc2 + (variant?.stock ?? 0),
        0
      );
      return acc + (product.price * stockForProducts);
    }, 0);

    const variantsTotal = products.reduce(
      (acc, p) => acc + (p.variantProduct?.length ?? 0),
      0
    );

    let productWithLowestStock = { title: "Ninguno", stock: 0 };
    let lowestStock = Infinity;

    for (const p of products) {
      const stock = (p.variantProduct ?? []).reduce(
        (a, v) => a + (v?.stock ?? 0),
        0
      );

      if (stock < lowestStock) {
        lowestStock = stock;
        productWithLowestStock = { title: p.title, stock };
      }
    }

    let productWithHighestStock = { title: "Ninguno", stock: 0 };
    let highestStock = -Infinity;

    for (const p of products) {
      const stock = (p.variantProduct ?? []).reduce(
        (a, v) => a + (v?.stock ?? 0),
        0
      );

      if (stock > highestStock) {
        highestStock = stock;
        productWithHighestStock = { title: p.title, stock };
      }
    }

    const lowStockProducts = products.filter(p => {
      const stock = (p.variantProduct ?? []).reduce(
        (acc, v) => acc + (v?.stock ?? 0),
        0
      );
      return stock < 5;
    });


    if (!sales || sales.length === 0) {
      return {
        totalStock,
        totalValue,
        variantsTotal,
        productWithLowestStock,
        productWithHighestStock,
        alerts: { lowStack: lowStockProducts.length },
        topClient: {
          name: "Sin clientes",
          total: 0,
        },
      };
    }

    const clientTotals: Record<string, { name: string; total: number }> = {};

    for (const sale of sales) {
      if (!sale.client) continue;

      const clientId = sale.client.id;
      const clientName = `${sale.client.name} ${sale.client.lastname}`;

      const totalQuantity = sale.details?.reduce(
        (acc, item) => acc + Number(item?.quantity ?? 0),
        0
      ) ?? 0;

      if (!clientTotals[clientId]) {
        clientTotals[clientId] = { name: clientName, total: 0 };
      }

      clientTotals[clientId].total += totalQuantity;
    }

    const clientsArray = Object.values(clientTotals);

    const topClient =
      clientsArray.length > 0
        ? clientsArray.reduce((max, curr) =>
          curr.total > max.total ? curr : max
        )
        : { name: "Sin clientes", total: 0 };

    return {
      totalStock,
      totalValue,
      variantsTotal,
      productWithLowestStock,
      productWithHighestStock,
      alerts: {
        lowStack: lowStockProducts.length,
      },
      topClient,
    };
  }
}
