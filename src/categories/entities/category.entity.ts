import { Product } from "src/products/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;


  //RELATION
  @OneToMany(
    () => Product,
    (product) => product.category,
    { cascade: true, eager: true }
  )
  products: Product[]
}
