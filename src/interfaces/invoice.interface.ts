import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class Invoice {

    @ApiProperty()
    id: number;

    @ApiProperty()
    account_id: number;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    service_id: number;

    @ApiProperty()
    service: string;

    @ApiProperty()
    created: Date;

    @ApiPropertyOptional()
    closed: Date;
}