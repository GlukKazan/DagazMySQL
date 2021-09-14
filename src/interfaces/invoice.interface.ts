import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class Invoice {

    @ApiProperty()
    id: number;

    @ApiPropertyOptional()
    scope_id: number;

    @ApiPropertyOptional()
    servicetype_id: number;

    @ApiPropertyOptional()
    account_id: number;

    @ApiPropertyOptional()
    amount: number;

    @ApiPropertyOptional()
    count: number;

    @ApiProperty()
    service_id: number;

    @ApiProperty()
    service: string;

    @ApiProperty()
    created: Date;

    @ApiPropertyOptional()
    closed: Date;
}