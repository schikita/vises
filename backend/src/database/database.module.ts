import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Application } from './entities/application.entity';
import { Setting } from './entities/setting.entity';
import { PortalAutofillRun } from './entities/portal-autofill-run.entity';
import { SchemaBootstrap } from './schema.bootstrap';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ??
        'postgresql://vises:vises@127.0.0.1:5432/vises',
      entities: [User, Application, Setting, PortalAutofillRun],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Application,
      Setting,
      PortalAutofillRun,
    ]),
  ],
  providers: [SchemaBootstrap],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
