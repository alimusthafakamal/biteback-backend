import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class InsertTransactionProofDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: true
    })
    file: Express.Multer.File;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    senderName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    senderAccountNumber: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;
}