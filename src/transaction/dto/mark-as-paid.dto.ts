import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class MarkAsPaidDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    referenceNumber?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
    isPaid: boolean;
}