import { Test, type TestingModule } from '@nestjs/testing';

describe('api test harness', (): void => {
  it('compiles an empty Nest testing module', async (): Promise<void> => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [],
    }).compile();

    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});
