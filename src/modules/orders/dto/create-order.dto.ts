import { IsNumber } from "class-validator";

export class CreateOrderDto {
    @IsNumber()
    @IsNumber()
    cartId: number;
}