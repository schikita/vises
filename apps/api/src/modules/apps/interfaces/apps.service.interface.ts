import type { User } from '../../database/entities/user.entity';
import type { UpsertAppDto } from '../dto/upsert-app.dto';
import type {
  AppOutWithPortalProgress,
  AppsListQuery,
  AppsPaginatedList,
  AppsUpsertHttpResponse,
  PaymentsListQuery,
  PaymentsPaginatedList,
  VisitsListQuery,
  VisitsPaginatedList,
} from '../types';

export interface IAppsService {
  list(user: User): Promise<AppOutWithPortalProgress[]>;
  listPaged(user: User, query: AppsListQuery): Promise<AppsPaginatedList>;
  getById(appId: string, user: User): Promise<AppOutWithPortalProgress>;
  listVisits(query: VisitsListQuery): Promise<VisitsPaginatedList>;
  listPayments(query: PaymentsListQuery): Promise<PaymentsPaginatedList>;
  upsert(body: UpsertAppDto, user: User): Promise<AppsUpsertHttpResponse>;
  remove(appId: string): Promise<{ ok: true }>;
  addDoc(
    appId: string,
    type: string,
    file: Express.Multer.File | undefined,
    user: User,
  ): Promise<AppOutWithPortalProgress>;
  getDocStream(
    appId: string,
    docId: string,
    user: User,
  ): Promise<{ stream: NodeJS.ReadableStream; filename: string }>;
}
