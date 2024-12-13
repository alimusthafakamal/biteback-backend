import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { RoleType } from "src/general/role.type";

export class RegisterDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty({ enum: RoleType })
    @IsNotEmpty()
    @IsEnum(RoleType)
    role: RoleType;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fullName: string;
}