import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('order_item_toppings')
export class OrderItemTopping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_item_id' })
  orderItemId: string;

  @ManyToOne(() => OrderItem, (item) => item.toppings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ name: 'topping_id' })
  toppingId: string;

  @Column({ name: 'topping_name', length: 100 })
  toppingName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
