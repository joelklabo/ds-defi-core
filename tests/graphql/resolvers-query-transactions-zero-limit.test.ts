import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver transactions zero-limit pagination', () => {
  it('preserves an explicit zero limit on the no-filter branch', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-zero-limit',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions({}, { limit: 0, offset: 4 });

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-zero-limit',
        transactionType: 'ZAP',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(undefined);
    expect(chain.limit).toHaveBeenCalledWith(0);
    expect(chain.offset).toHaveBeenCalledWith(4);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it('preserves an explicit zero limit when a type filter is provided', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-zero-limit-type',
        transactionType: 'TASK_PAYMENT',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions(
      {},
      { type: 'TASK_PAYMENT', limit: 0, offset: 0 }
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-zero-limit-type',
        transactionType: 'TASK_PAYMENT',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(0);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
