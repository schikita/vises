import type { Application } from '../../database/entities/application.entity';

export type AppFactory = {
  create: (data: Partial<Application>) => Application;
};
