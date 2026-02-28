import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver transactions null filter handling', () => {
  it('treats null agentId/type as omitted filters', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-null-filters',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions({}, { agentId: null, type: null } as any);

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-null-filters',
        transactionType: 'ZAP',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(undefined);
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it('ignores a null agentId while retaining a non-empty type filter', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-null-agent-type-filter',
        transactionType: 'TASK_PAYMENT',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions(
      {},
      { agentId: null, type: 'TASK_PAYMENT', limit: 4, offset: 1 } as any
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-null-agent-type-filter',
        transactionType: 'TASK_PAYMENT',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(4);
    expect(chain.offset).toHaveBeenCalledWith(1);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
