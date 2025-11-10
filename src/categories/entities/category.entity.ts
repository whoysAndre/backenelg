import { User } from "src/auth/entities/user.entity";
import { Product } from "src/products/entities/product.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;


  @ManyToOne(
    () => User,
    (u) => u.categories,
  )
  user: User;

  //RELATION
  @OneToMany(
    () => Product,
    (product) => product.category,
    { cascade: true }
  )
  products: Product[]
}
