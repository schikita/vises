import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Application } from '../database/entities/application.entity';
import { Setting } from '../database/entities/setting.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Application, Setting])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
