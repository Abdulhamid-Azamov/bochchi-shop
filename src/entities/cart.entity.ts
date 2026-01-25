import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { CartItem } from "./cart-item.entity";

@Entity('carts')
export class Cart {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    userId: number;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;

    @ManyToOne(()=>User,(user)=>user.carts,{onDelete:'CASCADE'})
    @JoinColumn({name:'userId'})
    user:User;

    @OneToMany(()=>CartItem,(cartItem)=>cartItem.cart)
    cartItems: CartItem[];

}