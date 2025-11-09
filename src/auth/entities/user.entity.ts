import { Category } from "src/categories/entities/category.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column('text')
  fullname: string;

  @Column('text', { name: "profile_img_url", nullable: true })
  profileImgUrl: string

  @Column('boolean', {
    default: true
  })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ["user"]
  })
  roles: string[];

  @BeforeInsert()
  checkFieldBeforeInsert() {
    this.email = this.email.toLocaleLowerCase().trim()
  }

  @BeforeUpdate()
  checkFieldBeforeUpdate() {
    this.checkFieldBeforeInsert()
  }

  //Relations USer - Category
  @OneToMany(
    () => Category,
    (c) => c.user
  )
  categories: Category[]


}
