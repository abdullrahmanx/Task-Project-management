import {IsEmail, IsEnum, IsNotEmpty, MinLength} from 'class-validator'


export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @MinLength(3)
    @IsNotEmpty()
    name: string

    @MinLength(6)
    @IsNotEmpty()
    password: string

    
}