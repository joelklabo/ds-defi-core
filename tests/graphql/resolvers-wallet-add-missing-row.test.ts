import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('addWallet missing-row handling', () => {
  it('returns undefined when insert returning() yields no wallet row', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    const wallet = await resolvers.Mutation.addWallet(
      {},
      { input: { chain: 'bitcoin', address: 'bc1qmissingrow', isPrimary: true } },
      { agentId: 'agent-1' } as any
    );

    expect(wallet).toBeUndefined();
    expect(mock.insertValues).toHaveLength(1);
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        agentId: 'agent-1',
        chain: 'bitcoin',
        address: 'bc1qmissingrow',
        isPrimary: true,
      })
    );
  });
});
