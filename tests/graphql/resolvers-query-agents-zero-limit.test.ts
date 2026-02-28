import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver agents zero-limit handling', () => {
  it('preserves explicit zero limit instead of applying the default page size', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents({}, { limit: 0, offset: 0 } as any);

    expect(result).toEqual([]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(undefined);
    expect(chain.limit).toHaveBeenCalledWith(0);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
