import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sale } from "./sale.entity";
import { VariantProduct } from "src/products/entities/variants-product.entity";

@Entity("detail_sale")
export class DetailSale {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'numeric' })
  unitPrice: number;

  @Column({ type: 'numeric' })
  subtotal: number;


  @Column({ name: 'variant_product_id', type: 'text' })
  variantProductId: string; 

  @Column({ name: 'product_title', type: 'text' })
  productTitle: string; 

  @Column({ name: 'variant_sizes', type: 'text' })
  variantSizes: string; 

  @Column({ name: 'variant_color', type: 'text', nullable: true })
  variantColor: string; 

  @Column({ name: 'product_sku', type: 'text' })
  productSku: string; 

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => Sale,
    (s) => s.details,
  )
  sale: Sale


}