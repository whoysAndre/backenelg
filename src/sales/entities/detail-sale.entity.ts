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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => Sale,
    (s) => s.details,
  )
  sale: Sale

  @ManyToOne(
    () => VariantProduct,
    (vp) => vp.details,{
      eager: true,
    }
  )
  variantProduct: VariantProduct

}
