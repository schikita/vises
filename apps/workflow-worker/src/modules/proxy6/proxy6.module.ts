import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proxy6Proxy } from '../database/entities/proxy6-proxy.entity';
import { PortalProxyLeaseService } from './portal-proxy-lease.service';
import { Proxy6ApiService } from './proxy6-api.service';
import { Proxy6InventoryService } from './proxy6-inventory.service';

/**
 * Proxy6 API client + DB inventory/lease for worker process (DEC-019).
 * Admin HTTP controller stays on @vises/api. Near-term lease path forced off
 * via portal-config (DEC-016 / CON-011).
 */
@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Proxy6Proxy])],
  controllers: [],
  providers: [
    Proxy6ApiService,
    Proxy6InventoryService,
    PortalProxyLeaseService,
  ],
  exports: [
    Proxy6ApiService,
    Proxy6InventoryService,
    PortalProxyLeaseService,
  ],
})
export class Proxy6Module {}
