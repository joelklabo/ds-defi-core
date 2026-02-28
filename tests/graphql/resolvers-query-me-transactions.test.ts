import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver me and transactions defaults', () => {
  it('returns authenticated agent for Query.me and null when not found', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([{ id: 'agent-1', displayName: 'Max' }], []);

    const resolvers = createResolvers(mock.db);
    const me = await resolvers.Query.me({}, {}, { agentId: 'agent-1' } as any);
    const missing = await resolvers.Query.me({}, {}, { agentId: 'agent-missing' } as any);

    expect(me).toEqual(expect.objectContaining({ id: 'agent-1', displayName: 'Max' }));
    expect(missing).toBeNull();
  });

  it('uses default pagination and no filters for Query.transactions', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([{ id: 'tx-1', transactionType: 'TASK_PAYMENT' }]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions({}, {} as any);

    expect(result).toEqual([expect.objectContaining({ id: 'tx-1', transactionType: 'TASK_PAYMENT' })]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(undefined);
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
