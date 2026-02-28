import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('wallet addWallet primary flag preservation', () => {
  it('keeps isPrimary true when explicitly provided in input', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'wallet-primary',
        agentId: 'agent-11',
        chain: 'bitcoin',
        address: 'bc1qprimary',
        isPrimary: true,
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const wallet = await resolvers.Mutation.addWallet(
      {},
      {
        input: {
          chain: 'bitcoin',
          address: 'bc1qprimary',
          isPrimary: true,
        },
      },
      { agentId: 'agent-11' } as any
    );

    expect(wallet).toEqual(
      expect.objectContaining({
        id: 'wallet-primary',
        isPrimary: true,
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        agentId: 'agent-11',
        chain: 'bitcoin',
        address: 'bc1qprimary',
        isPrimary: true,
      })
    );
  });
});
