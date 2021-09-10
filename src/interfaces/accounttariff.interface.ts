import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AccountTariff {

    @ApiPropertyOptional()
    id: number;

    @ApiProperty()
    tariff_id: number;

    @ApiPropertyOptional()
    tariff: string;

    @ApiProperty()
    created: Date;
}