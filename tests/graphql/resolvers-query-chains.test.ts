import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver chain behavior', () => {
  it('returns empty myTasks when caller is unauthenticated', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    const result = await resolvers.Query.myTasks({}, {}, {} as any);

    expect(result).toEqual([]);
    expect(mock.db.select).not.toHaveBeenCalled();
  });

  it('returns myTasks for authenticated caller with chained where/orderBy', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'task-1',
        claimedById: 'agent-1',
        status: 'CLAIMED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.myTasks({}, {}, { agentId: 'agent-1' } as any);

    expect(result).toEqual([
      expect.objectContaining({
        id: 'task-1',
        claimedById: 'agent-1',
      }),
    ]);
  });

  it('returns filtered transactions through where/limit/offset/orderBy chain', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-1',
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions(
      {},
      {
        agentId: 'agent-1',
        type: 'ZAP',
        limit: 10,
        offset: 5,
      }
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-1',
        transactionType: 'ZAP',
      }),
    ]);
  });
});
