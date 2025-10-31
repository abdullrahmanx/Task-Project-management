import { IsNotEmpty, MinLength } from "class-validator";

export class ChangePasswordDto {

    @MinLength(6)
    @IsNotEmpty()
    currentPassword: string

    @MinLength(6)
    @IsNotEmpty()
    newPassword: string

}