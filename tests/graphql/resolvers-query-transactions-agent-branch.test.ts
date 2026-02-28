import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver transactions agent-branch behavior', () => {
  it('applies agentId-only filter with default pagination', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-agent',
        fromAgentId: 'agent-9',
        toAgentId: 'agent-2',
        transactionType: 'TASK_PAYMENT',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions({}, { agentId: 'agent-9' });

    expect(result).toEqual([expect.objectContaining({ id: 'tx-agent', transactionType: 'TASK_PAYMENT' })]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it('keeps where(undefined) when filters are omitted while honoring custom pagination', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-page',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions({}, { limit: 7, offset: 3 } as any);

    expect(result).toEqual([expect.objectContaining({ id: 'tx-page', transactionType: 'ZAP' })]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(undefined);
    expect(chain.limit).toHaveBeenCalledWith(7);
    expect(chain.offset).toHaveBeenCalledWith(3);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
