import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import type { StaffRole } from '@vises/contracts';
import * as jwtLib from 'jsonwebtoken';
import { User } from '../database/entities/user.entity';
import { JwtTokenService } from './jwt.service';

describe('JwtTokenService StaffRole claims (FR-12)', (): void => {
  const createService = async (): Promise<{
    jwt: JwtTokenService;
    moduleRef: TestingModule;
  }> => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string): string => {
              if (key === 'JWT_SECRET') {
                return 'test-jwt-secret-for-t4-claims';
              }
              if (key === 'NODE_ENV') {
                return 'test';
              }
              return '';
            },
          },
        },
      ],
    }).compile();

    return { jwt: moduleRef.get(JwtTokenService), moduleRef };
  };

  it('embeds and restores StaffRole in JWT claims', async (): Promise<void> => {
    const { jwt, moduleRef } = await createService();
    const role: StaffRole = 'agent';
    const user = {
      id: 'u-1',
      role,
    } as User;

    const token = jwt.makeToken(user);
    const payload = jwt.readToken(token);
    expect(payload).toEqual({ sub: 'u-1', role: 'agent' });

    await moduleRef.close();
  });

  it('rejects legacy manager/client roles in tokens', async (): Promise<void> => {
    const { jwt, moduleRef } = await createService();
    const token = jwt.makeToken({ id: 'u-2', role: 'agent' } as User);
    const forged = jwtLib.sign(
      { sub: 'u-2', role: 'manager' },
      'test-jwt-secret-for-t4-claims',
      { algorithm: 'HS256', expiresIn: '1h' },
    );
    expect(jwt.readToken(forged)).toBeNull();
    expect(jwt.readToken(token)?.role).toBe('agent');

    await moduleRef.close();
  });
});
