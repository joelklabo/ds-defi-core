import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('wallet sync and zap mutations', () => {
  it('syncs wallet balance by updating lastSyncedAt', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'wallet-1',
        agentId: 'agent-1',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const synced = await resolvers.Mutation.syncWalletBalance({}, { walletId: 'wallet-1' });

    expect(synced).toEqual(expect.objectContaining({ id: 'wallet-1', agentId: 'agent-1' }));
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        lastSyncedAt: expect.any(Date),
      })
    );
  });

  it('creates zap transaction with SATS token and message metadata', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'tx-1',
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '42',
        token: 'SATS',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const tx = await resolvers.Mutation.sendZap(
      {},
      { toAgentId: 'agent-2', amount: '42', message: 'nice work' },
      { agentId: 'agent-1' } as any
    );

    expect(tx).toEqual(
      expect.objectContaining({
        id: 'tx-1',
        transactionType: 'ZAP',
        token: 'SATS',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '42',
        token: 'SATS',
        transactionType: 'ZAP',
        status: 'PENDING',
        metadata: { message: 'nice work' },
      })
    );
  });

  it('rejects zaps when caller is unauthenticated', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.sendZap(
        {},
        { toAgentId: 'agent-2', amount: '42', message: 'unauthorized' },
        {} as any
      )
    ).rejects.toThrow('Unauthorized');
  });
});
