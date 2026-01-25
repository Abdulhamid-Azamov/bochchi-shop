import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

export enum OtpPurpose {
    VERIFY = 'verify',
    RESET = 'reset'
}

@Entity('otp-codes')
export class OtpCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column({ type: "varchar" })
    code: string;

    @Column({ type: 'varchar' })
    purpose: OtpPurpose;

    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @ManyToOne(() => User, (user) => user.otpCodes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}