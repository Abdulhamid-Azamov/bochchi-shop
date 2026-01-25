import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";

export enum PaymentProvider{
    CLICK = 'click',
    PAYME = 'payme',
    CARD = 'card',
}

export enum PaymentStatus{
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('payment')
export class Payment{
    @PrimaryGeneratedColumn('increment')
    id:number;

    @Column()
    orderId:number;

    @Column({type:'varchar'})
    provider:PaymentProvider;

    @Column({type:'varchar',default:PaymentStatus.PENDING})
    status:PaymentStatus;

    @Column({type:'timestamptz',nullable:true})
    paidAt: Date;

    @OneToOne(()=>Order,(order)=>order.payment,{onDelete: 'CASCADE'})
    @JoinColumn({name:'orderId'})
    order:Order;
}
