import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { OrderItem } from "./order-item.entity";
import { Payment } from "./payment.entity";

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELED = 'canceled',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    userId: number;

    @Column({ type: 'varchar', default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({ type: 'numeric' })
    total: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(()=>OrderItem,(orderItem)=>orderItem.order)
    orderItems:OrderItem[];

    @OneToOne(()=>Payment,(payment)=>payment.order)
    payment:Payment;
}