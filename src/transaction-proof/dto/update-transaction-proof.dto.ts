import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateTransactionProofDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: false
    })
    file?: Express.Multer.File;

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