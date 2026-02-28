import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('sendZap missing-row behavior', () => {
  it('returns undefined when transaction insert returns no row', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([]);

    const resolvers = createResolvers(mock.db);
    const tx = await resolvers.Mutation.sendZap(
      {},
      { toAgentId: 'agent-2', amount: '5', message: 'thanks' },
      { agentId: 'agent-1' } as any
    );

    expect(tx).toBeUndefined();
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '5',
        token: 'SATS',
        transactionType: 'ZAP',
        status: 'PENDING',
        metadata: { message: 'thanks' },
      })
    );
  });
});
