import { Category } from "src/categories/entities/category.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { VariantProduct } from "./variants-product.entity";

@Entity("products")
export class Product {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column('text', {
    unique: true
  })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'text', unique: true })
  sku: string;

  @Column('numeric', {
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => Number(value),
    },
  })
  price: number;

  @Column({ name: "image_url", nullable: true, type: 'text' })
  imageUrl: string;

  @Column({ name: "public_url", nullable: true, type: 'text' })
  publicUrl: string;

  @Column({ name: "is_active", default: true })
  isActive: boolean

  @ManyToOne(
    () => Category,
    (category) => category.products,
    {
      eager: true
    }
  )
  category: Category

  @OneToMany(
    () => VariantProduct,
    (vp) => vp.product,
    {
      onDelete: "CASCADE",
      eager: true,
      cascade: true
    }
  )
  variantProduct: VariantProduct[]


  @BeforeInsert()
  checkSlugInsert() {
    if (!this.sku) {
      this.sku = this.title
    }
    this.sku = this.sku
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", "")
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.sku = this.title
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", "");
  }

}
