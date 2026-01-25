import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { User } from "./user.entity";

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    productId: number;

    @Column({ type: 'int' })
    rating: number; // stars 1-5

    @Column({ type: 'text', nullable: true })
    comment: string;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;

    @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;
}