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
<<<<<<< HEAD
    //{ eager: true }
=======
>>>>>>> 1ee251cf836a658931d8e45be23101a2ebfa5929
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
