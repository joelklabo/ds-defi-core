import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('wallet addWallet explicit false primary flag', () => {
  it('keeps isPrimary false when explicitly provided in input', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'wallet-secondary',
        agentId: 'agent-12',
        chain: 'bitcoin',
        address: 'bc1qsecondary',
        isPrimary: false,
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const wallet = await resolvers.Mutation.addWallet(
      {},
      {
        input: {
          chain: 'bitcoin',
          address: 'bc1qsecondary',
          isPrimary: false,
        },
      },
      { agentId: 'agent-12' } as any
    );

    expect(wallet).toEqual(
      expect.objectContaining({
        id: 'wallet-secondary',
        isPrimary: false,
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        agentId: 'agent-12',
        chain: 'bitcoin',
        address: 'bc1qsecondary',
        isPrimary: false,
      })
    );
  });
});
