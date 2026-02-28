import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver transactions whitespace-only filters', () => {
  it('treats whitespace-only agentId/type as provided filters', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-whitespace-filters',
        transactionType: 'TASK_PAYMENT',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions(
      {},
      { agentId: '   ', type: '   ', limit: 8, offset: 3 } as any
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-whitespace-filters',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(8);
    expect(chain.offset).toHaveBeenCalledWith(3);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it('keeps a whitespace-only type filter truthy when agentId is empty', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-whitespace-type',
        transactionType: 'INVOICE',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions(
      {},
      { agentId: '', type: '   ', limit: 5, offset: 1 } as any
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-whitespace-type',
        transactionType: 'INVOICE',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(chain.offset).toHaveBeenCalledWith(1);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
