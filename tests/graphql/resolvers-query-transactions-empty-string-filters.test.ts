import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver transactions empty-string filter handling', () => {
  it('treats empty-string agentId/type as omitted filters', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'tx-empty-filters',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.transactions({}, { agentId: '', type: '' } as any);

    expect(result).toEqual([
      expect.objectContaining({
        id: 'tx-empty-filters',
        transactionType: 'ZAP',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(undefined);
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
