import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('toppings')
export class Topping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;
}
