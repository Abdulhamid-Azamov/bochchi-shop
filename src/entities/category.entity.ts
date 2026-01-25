import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ unique: true, nullable: false })
    name: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @OneToMany(()=>Product,(product)=>product.category)
    products:Product[];
}