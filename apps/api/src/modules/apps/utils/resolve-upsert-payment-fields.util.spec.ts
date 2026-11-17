import { Application } from '../../database/entities/application.entity';
import { DEFAULT_PAYMENT_AMOUNT } from '../constants';
import { resolveUpsertPaymentFields } from './resolve-upsert-payment-fields.util';

describe('resolveUpsertPaymentFields (ASAU-TASK-004)', (): void => {
  const row = Object.assign(new Application(), {
    paymentAmount: 220,
    paymentPaid: true,
    paymentNote: 'existing',
  });

  it('preserves row payment for agent on update', (): void => {
    expect(resolveUpsertPaymentFields('agent', { destination: 'ES' }, row)).toEqual({
      paymentAmount: 220,
      paymentPaid: true,
      paymentNote: 'existing',
    });
  });

  it('uses defaults for agent on create', (): void => {
    expect(resolveUpsertPaymentFields('agent', {}, null)).toEqual({
      paymentAmount: DEFAULT_PAYMENT_AMOUNT,
      paymentPaid: false,
      paymentNote: '',
    });
  });

  it('applies body payment for admin', (): void => {
    expect(
      resolveUpsertPaymentFields(
        'admin',
        {
          paymentAmount: 400,
          paymentPaid: true,
          paymentNote: 'ok',
        },
        row,
      ),
    ).toEqual({
      paymentAmount: 400,
      paymentPaid: true,
      paymentNote: 'ok',
    });
  });
});
