import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  PROXY6_DEFAULT_TYPE,
  PROXY6_DEFAULT_VERSION,
  PROXY6_MSG_REPLACE_PARTIAL,
} from './constants';
import { BuyProxy6Dto } from './dto/buy-proxy6.dto';
import { DeleteProxy6Dto } from './dto/delete-proxy6.dto';
import { ProlongProxy6Dto } from './dto/prolong-proxy6.dto';
import { Proxy6CountQueryDto } from './dto/proxy6-count-query.dto';
import { Proxy6CountriesQueryDto } from './dto/proxy6-countries-query.dto';
import { Proxy6PriceQueryDto } from './dto/proxy6-price-query.dto';
import { ReplaceProxy6Dto } from './dto/replace-proxy6.dto';
import { Proxy6ApiService } from './proxy6-api.service';
import { Proxy6InventoryService } from './proxy6-inventory.service';
import type {
  Proxy6BalanceOut,
  Proxy6ProxiesOut,
  Proxy6ReplaceResultOut,
  Proxy6StatsOut,
} from './types';
import { createProxy6ApiError } from './utils/create-proxy6-api-error.util';
import { mapProxy6ErrorToHttpException } from './utils/map-proxy6-error-to-http-exception.util';

/**
 * Admin-only Proxy6 management APIs (REQ-014 / REQ-025 / DEC-009).
 * Responses never include API key or proxy credentials (DEC-010).
 */
@Controller('proxy6')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class Proxy6Controller {
  constructor(
    private readonly api: Proxy6ApiService,
    private readonly inventory: Proxy6InventoryService,
  ) {}

  @Get('balance')
  async balance(): Promise<Proxy6BalanceOut> {
    try {
      const res = await this.api.getBalance();
      return {
        balance: res.balance ?? null,
        currency: res.currency ?? null,
      };
    } catch (err) {
      throw mapProxy6ErrorToHttpException(err);
    }
  }

  @Get('price')
  async price(@Query() query: Proxy6PriceQueryDto) {
    try {
      return await this.api.getPrice({
        count: query.count,
        period: query.period,
        version: query.version ?? PROXY6_DEFAULT_VERSION,
      });
    } catch (err) {
      throw mapProxy6ErrorToHttpException(err);
    }
  }

  @Get('count')
  async count(@Query() query: Proxy6CountQueryDto) {
    try {
      return await this.api.getCount({
        country: query.country,
        version: query.version ?? PROXY6_DEFAULT_VERSION,
      });
    } catch (err) {
      throw mapProxy6ErrorToHttpException(err);
    }
  }

  @Get('countries')
  async countries(@Query() query: Proxy6CountriesQueryDto) {
    try {
      return await this.api.getCountry({
        version: query.version ?? PROXY6_DEFAULT_VERSION,
      });
    } catch (err) {
      throw mapProxy6ErrorToHttpException(err);
    }
  }

  @Post('buy')
  @HttpCode(HttpStatus.OK)
  async buy(@Body() body: BuyProxy6Dto): Promise<Proxy6ProxiesOut> {
    try {
      const version = body.version ?? PROXY6_DEFAULT_VERSION;
      const type = body.type?.trim() || PROXY6_DEFAULT_TYPE;
      const response = await this.api.buy({
        count: body.count,
        period: body.period,
        country: body.country,
        version,
        type,
        descr: body.descr,
      });
      await this.inventory.upsertFromBuy(response, {
        periodDays: body.period,
        country: body.country,
        version,
        type,
      });
      return this.inventory.listMasked();
    } catch (err) {
      throw mapProxy6ErrorToHttpException(err);
    }
  }

  @Post('prolong')
  @HttpCode(HttpStatus.OK)
  async prolong(@Body() body: ProlongProxy6Dto): Promise<Proxy6ProxiesOut> {
    try {
      const response = await this.api.prolong({
        period: body.period,
        ids: body.ids,
      });
      await this.inventory.upsertFromProlong(response, body.period);
      return this.inventory.listMasked();
    } catch (err) {
      throw mapProxy6ErrorToHttpException(err);
    }
  }

  @Post('replace')
  @HttpCode(HttpStatus.OK)
  async replace(@Body() body: ReplaceProxy6Dto): Promise<Proxy6ReplaceResultOut> {
    try {
      const version = body.version ?? PROXY6_DEFAULT_VERSION;
      const type = body.type?.trim() || PROXY6_DEFAULT_TYPE;
      const buyResponse = await this.api.buy({
        count: body.count,
        period: body.period,
        country: body.country,
        version,
        type,
        descr: body.descr,
      });
      const boughtIds = await this.inventory.upsertFromBuy(buyResponse, {
        periodDays: body.period,
        country: body.country,
        version,
        type,
      });

      try {
        await this.api.delete({ ids: body.replaceIds });
        await this.inventory.deactivateByIds(body.replaceIds);
        return {
          boughtIds,
          deletedIds: body.replaceIds,
          partialFailure: false,
        };
      } catch (deleteErr) {
        throw createProxy6ApiError({
          code: 'replace_partial',
          message: PROXY6_MSG_REPLACE_PARTIAL,
          ...(deleteErr &&
          typeof deleteErr === 'object' &&
          'errorId' in deleteErr &&
          typeof (deleteErr as { errorId?: unknown }).errorId === 'number'
            ? { errorId: (deleteErr as { errorId: number }).errorId }
            : {}),
        });
      }
    } catch (err) {
      throw mapProxy6ErrorToHttpException(err);
    }
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  async delete(@Body() body: DeleteProxy6Dto): Promise<Proxy6ProxiesOut> {
    try {
      await this.api.delete({ ids: body.ids });
      await this.inventory.deactivateByIds(body.ids);
      return this.inventory.listMasked();
    } catch (err) {
      throw mapProxy6ErrorToHttpException(err);
    }
  }

  @Get('proxies')
  listProxies(): Promise<Proxy6ProxiesOut> {
    return this.inventory.listMasked();
  }

  @Post('proxies/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshProxies(): Promise<Proxy6ProxiesOut> {
    try {
      return await this.inventory.refreshFromRemote(true);
    } catch (err) {
      throw mapProxy6ErrorToHttpException(err);
    }
  }

  @Get('stats')
  getStats(): Promise<Proxy6StatsOut> {
    return this.inventory.getStats();
  }
}
