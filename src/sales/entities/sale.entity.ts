import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StatusSale } from "../enums/sale.enum";
import { Client } from "src/clients/entities/client.entity";
import { DetailSale } from "./detail-sale.entity";

@Entity("sales")
export class Sale {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column("numeric")
  total: number

  @Column({
    type: "enum",
    enum: StatusSale,
    default: StatusSale.PENDING
  })
  status: StatusSale;


  @Column({ name: 'sale_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  saleDate: Date;

  @Column({ name: "is_active",default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(
    () => Client,
    (c) => c.sales
  )
  client: Client


  @OneToMany(
    () => DetailSale,
    (ds) => ds.sale,
    { cascade: true, eager: true }
  )
  details: DetailSale[]

}
