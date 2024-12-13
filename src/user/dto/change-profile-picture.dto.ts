import { ApiProperty } from "@nestjs/swagger";

export class ChangeProfilePictureDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: true
    })
    image: Express.Multer.File;
}