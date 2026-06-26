import { ApiError } from '../src/api/client';

// Mock the API singleton so we can assert dispatch + retry without a network.
jest.mock('../src/api/singleton', () => ({
  paymentsApi: {
    activateEssential: jest.fn(),
    activateContactPack: jest.fn(),
    activateBuilderProjectUpload: jest.fn(),
    activateBuilderLeadCredits: jest.fn(),
    activateAgentListingPublish: jest.fn(),
    activateAgentLeadCredits: jest.fn(),
  },
}));

import { paymentsApi } from '../src/api/singleton';
import { activateCashfreeOrder } from '../src/services/paymentActivation';

const api = paymentsApi as jest.Mocked<typeof paymentsApi>;

beforeEach(() => jest.clearAllMocks());

describe('activateCashfreeOrder dispatch', () => {
  it('routes agent_publish to the agent listing publish activation', async () => {
    api.activateAgentListingPublish.mockResolvedValue({ message: 'Publish credits added.' });
    const msg = await activateCashfreeOrder('agent_publish', 'order_1', 'CUSTOM-2-30-L10', 3420);
    expect(api.activateAgentListingPublish).toHaveBeenCalledWith('CUSTOM-2-30-L10', 'order_1', 3420);
    expect(msg).toBe('Publish credits added.');
  });

  it('routes essential to essential activation', async () => {
    api.activateEssential.mockResolvedValue({ message: 'Plan active.' } as never);
    const msg = await activateCashfreeOrder('essential', 'order_2', 'ESS30', 499);
    expect(api.activateEssential).toHaveBeenCalledWith('ESS30', 'order_2', 499);
    expect(msg).toBe('Plan active.');
  });

  it('contact_pack needs no tier', async () => {
    api.activateContactPack.mockResolvedValue({ message: 'Pack added.' } as never);
    const msg = await activateCashfreeOrder('contact_pack', 'order_3', undefined, 99);
    expect(api.activateContactPack).toHaveBeenCalledWith('order_3', 99);
    expect(msg).toBe('Pack added.');
  });

  it('throws a clear error when a tier-required product has no tier', async () => {
    await expect(
      activateCashfreeOrder('agent_publish', 'order_4', undefined, 100, 1)
    ).rejects.toThrow(/tier is missing/i);
  });
});

describe('activateCashfreeOrder retry behaviour', () => {
  it('does not retry a non-retryable error and surfaces its message', async () => {
    api.activateAgentLeadCredits.mockRejectedValue(new ApiError(400, 'Invalid pack', ''));
    await expect(
      activateCashfreeOrder('agent_leads', 'order_5', 'SOFT15', 375, 5)
    ).rejects.toThrow('Invalid pack');
    expect(api.activateAgentLeadCredits).toHaveBeenCalledTimes(1);
  });

  it('retries a "not paid yet" error then succeeds', async () => {
    jest.useFakeTimers();
    api.activateAgentListingPublish
      .mockRejectedValueOnce(new ApiError(409, 'Order not paid yet', ''))
      .mockResolvedValueOnce({ message: 'Publish credits added.' });

    const promise = activateCashfreeOrder('agent_publish', 'order_6', 'CUSTOM-1-7-L0', 399, 5);
    // flush the 2s backoff between attempts
    await jest.advanceTimersByTimeAsync(2100);
    const msg = await promise;

    expect(api.activateAgentListingPublish).toHaveBeenCalledTimes(2);
    expect(msg).toBe('Publish credits added.');
    jest.useRealTimers();
  });
});
