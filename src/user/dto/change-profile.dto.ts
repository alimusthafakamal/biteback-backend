import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { SexType } from "src/general/sex.type";

export class ChangeProfileDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dateOfBirth?: Date;

    @ApiPropertyOptional({ enum: SexType })
    @IsOptional()
    @IsEnum(SexType)
    sex?: SexType;
}