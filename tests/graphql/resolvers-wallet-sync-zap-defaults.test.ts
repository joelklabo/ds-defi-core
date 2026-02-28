import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('wallet sync and zap default paths', () => {
  it('returns undefined when syncWalletBalance does not find a wallet row', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([]);

    const resolvers = createResolvers(mock.db);
    const synced = await resolvers.Mutation.syncWalletBalance({}, { walletId: 'wallet-missing' });

    expect(synced).toBeUndefined();
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        lastSyncedAt: expect.any(Date),
      })
    );
  });

  it('creates zap transaction with empty metadata when message is omitted', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'tx-2',
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '7',
        token: 'SATS',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const tx = await resolvers.Mutation.sendZap(
      {},
      { toAgentId: 'agent-2', amount: '7' },
      { agentId: 'agent-1' } as any
    );

    expect(tx).toEqual(
      expect.objectContaining({
        id: 'tx-2',
        transactionType: 'ZAP',
        token: 'SATS',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '7',
        token: 'SATS',
        transactionType: 'ZAP',
        status: 'PENDING',
        metadata: {},
      })
    );
  });
});
