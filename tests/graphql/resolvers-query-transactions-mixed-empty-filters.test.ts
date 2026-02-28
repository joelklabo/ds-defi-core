import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver transactions mixed empty-string filters', () => {
  it('ignores empty-string agentId while applying a non-empty type filter', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-type-only',
        transactionType: 'TASK_PAYMENT',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions(
      {},
      { agentId: '', type: 'TASK_PAYMENT', limit: 9, offset: 2 } as any
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-type-only',
        transactionType: 'TASK_PAYMENT',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(9);
    expect(chain.offset).toHaveBeenCalledWith(2);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it('ignores empty-string type while applying a non-empty agentId filter', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-agent-only',
        fromAgentId: 'agent-77',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions(
      {},
      { agentId: 'agent-77', type: '', limit: 6, offset: 1 } as any
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-agent-only',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(6);
    expect(chain.offset).toHaveBeenCalledWith(1);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
