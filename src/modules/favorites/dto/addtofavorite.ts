import { IsNotEmpty, IsNumber } from "class-validator";

export class AddToFavoritesDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;
}