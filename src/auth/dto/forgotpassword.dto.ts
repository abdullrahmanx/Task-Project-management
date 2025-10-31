import { IsNotEmpty,IsEmail } from "class-validator";

export class ForgotPassowrdDto {
    @IsEmail()
    @IsNotEmpty()
    email: string
}