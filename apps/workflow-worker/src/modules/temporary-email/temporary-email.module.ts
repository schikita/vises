import { Module } from '@nestjs/common';

/**
 * Shared temporary-email port types/tokens/utils.
 * Concrete adapter is bound by BrowserMailModule (tempmail_plus only).
 */
@Module({})
export class TemporaryEmailModule {}
