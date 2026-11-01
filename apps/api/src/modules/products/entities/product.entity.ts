import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Size } from './size.entity';

export enum ProductCategory {
  COFFEE = 'COFFEE',
  TEA = 'TEA',
  SIGNATURE = 'SIGNATURE',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: ProductCategory.COFFEE,
  })
  category: ProductCategory;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ type: 'int', default: 100 })
  stock: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Size, (size) => size.product, { cascade: true })
  sizes: Size[];
}
