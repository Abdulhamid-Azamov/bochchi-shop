import { IsNotEmpty, IsString, isString } from "class-validator";
import { OrderStatus } from "src/entities/order.entity";

export class UpdateOrderStatusDto {
    @IsNotEmpty()
    @IsString()
    status: OrderStatus;
}
