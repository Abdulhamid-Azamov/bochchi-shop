import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AuthSession } from "./auth-session.entity";
import { OtpCode } from "./otp-code.entity";
import { Order } from "./order.entity";
import { Cart } from "./cart.entity";
import { Review } from "./review.entity";
import { Favourite } from "./favourite.entity";

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    SUPERADMIN = 'superadmin'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ unique: true, nullable: false })
    username: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ type: 'varchar', default: UserRole.USER })
    role: UserRole;

    @Column({ default: false })
    isVerified: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToMany(() => AuthSession, (session) => session.user)
    authSession: AuthSession[];

    @OneToMany(() => OtpCode, (otp) => otp.user)
    otpCodes: OtpCode[];

    @OneToMany(() => Cart, (cart) => cart.user)
    carts: Cart[]

    @OneToMany(() => Order, (order) => order.user)
    orders: Order;

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @OneToMany(()=>Favourite,(favourite)=>favourite.user)
    favourites:Favourite[];
}