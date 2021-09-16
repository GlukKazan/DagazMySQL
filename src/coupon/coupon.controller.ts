import { Controller, Get, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TokenGuard } from '../auth/token.guard';
import { Coupon } from '../interfaces/coupon.interface';
import { CouponService } from './coupon.service';

@ApiSecurity('bearer')
@Controller('api/coupon')
export class CouponController {

    constructor(
        private readonly service: CouponService
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard, TokenGuard)
    @Roles('admin')
    @Get(':sum/:cnt')
    @ApiOperation({description: 'Get Coupons', summary: 'Get Coupons'})
    @ApiResponse({ type: [Coupon] })
    @ApiOkResponse({ description: 'Successfully.'})
    @ApiForbiddenResponse({ description: 'Forbidden.'})
    @ApiUnauthorizedResponse({ description: 'Unauthorized.'})
    @ApiInternalServerErrorResponse({ description: 'Internal Server error.'})
    async generate(@Res() res, @Param('sum') sum, @Param('cnt') cnt): Promise<Coupon[]> {
        try {
            const r = await this.service.genCoupons(sum, cnt);
            return res.status(HttpStatus.OK).json(r);
        } catch(e) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: e.message.error.toString(), stack: e.stack});
        }
    }
}
