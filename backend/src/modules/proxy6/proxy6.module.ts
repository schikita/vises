import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Proxy6Proxy } from '../database/entities/proxy6-proxy.entity';
import { User } from '../database/entities/user.entity';
import { PortalProxyLeaseService } from './portal-proxy-lease.service';
import { Proxy6ApiService } from './proxy6-api.service';
import { Proxy6Controller } from './proxy6.controller';
import { Proxy6InventoryService } from './proxy6-inventory.service';

/**
 * Proxy6 API client, DB inventory/lease, and admin controller (DEC-001/008/009).
 * User entity registered so JwtAuthGuard can resolve UserRepository (settings/apps pattern).
 */
@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Proxy6Proxy, User]),
    AuthModule,
  ],
  controllers: [Proxy6Controller],
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
