import { Sale } from "src/sales/entities/sale.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  lastname: string;

  @Column("text", {
    nullable: true
  })
  phone: string;

  @Column("text", {
    nullable: true
  })
  direccion: string;

  @Column({ name: "is_active", default: true })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 1 - N VENTAS
  @OneToMany(
    () => Sale,
    (s) => s.client,
    {
      cascade: true,
    }
  )
  sales: Sale[]

}
