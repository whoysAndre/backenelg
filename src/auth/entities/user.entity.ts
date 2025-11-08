import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  //Relations USer - Category

}
