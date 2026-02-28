import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver agents empty-string filter handling', () => {
  it('treats empty-string level/type as omitted filters', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'agent-empty-filters',
        displayName: 'Agent Empty Filters',
        level: 'L1_WORKER',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents({}, { level: '', type: '' } as any);

    expect(result).toEqual([
      expect.objectContaining({
        id: 'agent-empty-filters',
        displayName: 'Agent Empty Filters',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(undefined);
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
