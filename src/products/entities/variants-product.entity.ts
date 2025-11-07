import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
import { DetailSale } from "src/sales/entities/detail-sale.entity";


@Entity("variants_product")
export class VariantProduct {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text")
  sizes: string;

  @Column({ type: 'text', nullable: true })
  color: string;

  @Column({ type: "numeric", default: 0 })
  stock: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(
    () => Product,
    (p) => p.variantProduct
  )
  product: Product

  @OneToMany(
    () => DetailSale,
    (ds) => ds.variantProduct
  )
  details: DetailSale[]

}