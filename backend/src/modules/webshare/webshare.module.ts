import { Module } from '@nestjs/common';
import { PortalProxyLeaseService } from './portal-proxy-lease.service';
import { WebshareProxyListService } from './webshare-proxy-list.service';

/**
 * Webshare Proxy List + in-process lease (DEC-002 / DEC-007).
 */
@Module({
  providers: [WebshareProxyListService, PortalProxyLeaseService],
  exports: [WebshareProxyListService, PortalProxyLeaseService],
})
export class WebshareModule {}
