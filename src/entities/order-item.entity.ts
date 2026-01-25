import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "./product.entity";

@Entity('order-items')
export class OrderItem{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column()
    orderId: number;

    @Column()
    productId:number;

    @Column({type: 'int',default: '1'})
    quantity:number;

    @Column({type: 'numeric'})
    price:number;

    @ManyToOne(()=>Order,(order)=>order.orderItems)
    @JoinColumn({name: 'orderId'})
    order:Order;

    @ManyToOne(()=>Product, (product)=>product.orderItem)
    @JoinColumn({name:'productId'})
    product:Product;
}