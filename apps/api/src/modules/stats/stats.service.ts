import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import type { IStatsService } from './interfaces';
import type {
  AppsByStatusRow,
  DashboardCityCount,
  DashboardRecentUser,
  DashboardUpcomingVisit,
  OwnerDashboardStatsOut,
  StatsCityCountRow,
  StatsPaymentTotalsRow,
  StatsRawCountRow,
  StatsUsersRoleCountRow,
} from './types';
import {
  fillAppsByStatusBuckets,
  fillCreatedByDaySeries,
  mapAppRowToDashboardUpcoming,
  mapUserEntityToDashboardRecent,
  resolveDashboardDateRange,
} from './utils';
import {
  DASHBOARD_RECENT_USERS_LIMIT,
  DASHBOARD_UPCOMING_VISITS_LIMIT,
  DEFAULT_DASHBOARD_RANGE_DAYS,
} from './constants';

@Injectable()
export class StatsService implements IStatsService {
  constructor(
    @InjectRepository(Application)
    private readonly apps: Repository<Application>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async getDashboard(rangeDaysInput?: number): Promise<OwnerDashboardStatsOut> {
    const rangeDays =
      rangeDaysInput === undefined
        ? DEFAULT_DASHBOARD_RANGE_DAYS
        : rangeDaysInput;
    const range = resolveDashboardDateRange(rangeDays);

    const [
      appsByStatus,
      appsSparse,
      usersSparse,
      roleCounts,
      inactiveUsersTotal,
      paymentTotals,
      applicantsTotal,
      cities,
      recentUsers,
      upcomingVisits,
    ] = await Promise.all([
      this.queryAppsByStatus(),
      this.queryCreatedByDay(this.apps, 'a', range.from, range.toExclusive),
      this.queryCreatedByDay(this.users, 'u', range.from, range.toExclusive),
      this.queryUsersByRole(),
      this.users.count({ where: { active: false } }),
      this.queryPaymentTotals(),
      this.queryApplicantsTotal(),
      this.queryCityCounts(),
      this.queryRecentUsers(),
      this.queryUpcomingVisits(),
    ]);

    const appsTotal = appsByStatus.reduce((sum, row) => sum + row.count, 0);
    const clientsTotal = roleCounts.client;
    const managersTotal = roleCounts.manager;
    const usersTotal = roleCounts.admin + clientsTotal + managersTotal;

    return {
      rangeDays: range.rangeDays,
      from: range.fromIso,
      to: range.toIso,
      appsByStatus,
      appsCreatedByDay: fillCreatedByDaySeries(range.dayKeys, appsSparse),
      usersCreatedByDay: fillCreatedByDaySeries(range.dayKeys, usersSparse),
      appsTotal,
      applicantsTotal,
      usersTotal,
      clientsTotal,
      managersTotal,
      inactiveUsersTotal,
      paidTotal: paymentTotals.paidTotal,
      unpaidTotal: paymentTotals.unpaidTotal,
      cities,
      recentUsers,
      upcomingVisits,
    };
  }

  private async queryAppsByStatus(): Promise<AppsByStatusRow[]> {
    const rows = await this.apps
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.status')
      .getRawMany<StatsRawCountRow>();

    const sparse = rows.map((row) => ({
      status: String(row.status ?? ''),
      count: Number(row.count) || 0,
    }));

    return fillAppsByStatusBuckets(sparse);
  }

  private async queryCreatedByDay(
    repo: Repository<Application> | Repository<User>,
    alias: string,
    from: Date,
    toExclusive: Date,
  ): Promise<Array<{ date: string; count: number }>> {
    const rows = await repo
      .createQueryBuilder(alias)
      .select(
        `to_char(${alias}.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')`,
        'date',
      )
      .addSelect('COUNT(*)', 'count')
      .where(`${alias}.created_at >= :from AND ${alias}.created_at < :toExclusive`, {
        from,
        toExclusive,
      })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany<StatsRawCountRow>();

    return rows.map((row) => ({
      date: String(row.date ?? ''),
      count: Number(row.count) || 0,
    }));
  }

  private async queryUsersByRole(): Promise<{
    admin: number;
    manager: number;
    client: number;
  }> {
    const rows = await this.users
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany<StatsUsersRoleCountRow>();

    const out = { admin: 0, manager: 0, client: 0 };
    for (const row of rows) {
      const role = String(row.role ?? '');
      const count = Number(row.count) || 0;
      if (role === 'admin' || role === 'superadmin') out.admin += count;
      // T2 interim: StaffRole `agent` maps to legacy dashboard "manager" bucket.
      else if (role === 'manager' || role === 'agent') out.manager += count;
      else if (role === 'client') out.client = count;
    }
    return out;
  }

  private async queryPaymentTotals(): Promise<{
    paidTotal: number;
    unpaidTotal: number;
  }> {
    const row = await this.apps
      .createQueryBuilder('a')
      .select(
        'COALESCE(SUM(CASE WHEN a.payment_paid THEN a.payment_amount ELSE 0 END), 0)',
        'paidTotal',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN a.payment_paid THEN 0 ELSE a.payment_amount END), 0)',
        'unpaidTotal',
      )
      .getRawOne<StatsPaymentTotalsRow>();

    return {
      paidTotal: Number(row?.paidTotal ?? 0) || 0,
      unpaidTotal: Number(row?.unpaidTotal ?? 0) || 0,
    };
  }

  private async queryApplicantsTotal(): Promise<number> {
    // T2: applicants jsonb removed; count applications as interim stand-in (T10 analytics).
    const total = await this.apps.count();
    return total;
  }

  private async queryCityCounts(): Promise<DashboardCityCount[]> {
    const rows = await this.apps
      .createQueryBuilder('a')
      .select('a.submit_city', 'city')
      .addSelect('COUNT(*)', 'count')
      .where(`TRIM(COALESCE(a.submit_city, '')) <> ''`)
      .groupBy('a.submit_city')
      .orderBy('a.submit_city', 'ASC')
      .getRawMany<StatsCityCountRow>();

    return rows.map((row) => ({
      city: String(row.city ?? ''),
      count: Number(row.count) || 0,
    }));
  }

  private async queryRecentUsers(): Promise<DashboardRecentUser[]> {
    const rows = await this.users.find({
      order: { createdAt: 'DESC' },
      take: DASHBOARD_RECENT_USERS_LIMIT,
    });
    return rows.map(mapUserEntityToDashboardRecent);
  }

  private async queryUpcomingVisits(): Promise<DashboardUpcomingVisit[]> {
    const rows = await this.apps
      .createQueryBuilder('a')
      .where(`a.status = :status`, { status: 'booked' })
      .andWhere(`TRIM(COALESCE(a.visit_date, '')) <> ''`)
      .orderBy('a.visit_date', 'ASC')
      .addOrderBy('a.visit_time', 'ASC')
      .take(DASHBOARD_UPCOMING_VISITS_LIMIT)
      .getMany();
    return rows.map(mapAppRowToDashboardUpcoming);
  }
}
