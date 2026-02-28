import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver transactions filtering', () => {
  it('applies agentId and type filters with custom pagination', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-1',
        transactionType: 'TASK_PAYMENT',
        toAgentId: 'agent-1',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions(
      {},
      {
        agentId: 'agent-1',
        type: 'TASK_PAYMENT',
        limit: 10,
        offset: 5,
      }
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-1',
        transactionType: 'TASK_PAYMENT',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(10);
    expect(chain.offset).toHaveBeenCalledWith(5);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it('applies type-only filter while retaining default pagination', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-2',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions({}, { type: 'ZAP' });

    expect(result).toEqual([expect.objectContaining({ id: 'tx-2', transactionType: 'ZAP' })]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
