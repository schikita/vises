import type { User } from '../../database/entities/user.entity';
import type { UpsertAppDto } from '../dto/upsert-app.dto';
import type { AppOut, UpsertAppResult } from '../types';

export interface IAppsService {
  list(user: User): Promise<AppOut[]>;
  upsert(body: UpsertAppDto, user: User): Promise<UpsertAppResult>;
  remove(appId: string): Promise<{ ok: true }>;
  addDoc(
    appId: string,
    type: string,
    file: Express.Multer.File | undefined,
    user: User,
  ): Promise<AppOut>;
  getDocStream(
    appId: string,
    docId: string,
    user: User,
  ): Promise<{ stream: NodeJS.ReadableStream; filename: string }>;
}
