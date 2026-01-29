import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateReviewDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;
    @IsNumber()
    @IsNotEmpty()
    rating: number;
    @IsNotEmpty()
    comment: string;
}
