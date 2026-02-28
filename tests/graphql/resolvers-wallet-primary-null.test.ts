import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('wallet addWallet null optional handling', () => {
  it('normalizes explicit null isPrimary to false', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'wallet-null-primary',
        agentId: 'agent-13',
        chain: 'bitcoin',
        address: 'bc1qnullprimary',
        isPrimary: false,
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const wallet = await resolvers.Mutation.addWallet(
      {},
      {
        input: {
          chain: 'bitcoin',
          address: 'bc1qnullprimary',
          isPrimary: null as any,
        },
      },
      { agentId: 'agent-13' } as any
    );

    expect(wallet).toEqual(
      expect.objectContaining({
        id: 'wallet-null-primary',
        isPrimary: false,
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        agentId: 'agent-13',
        chain: 'bitcoin',
        address: 'bc1qnullprimary',
        isPrimary: false,
      })
    );
  });
});
