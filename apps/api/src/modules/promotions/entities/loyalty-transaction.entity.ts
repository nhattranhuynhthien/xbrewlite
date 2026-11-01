import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('loyalty_transactions')
export class LoyaltyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'order_id', nullable: true })
  orderId: string;

  @Column({ name: 'points_changed', type: 'int' })
  pointsChanged: number;

  @Column({ length: 50, default: 'ORDER_EARN' })
  type: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
