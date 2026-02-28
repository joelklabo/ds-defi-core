import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver pods null-domain handling', () => {
  it('treats explicit null domain as omitted and returns active pods', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([{ id: 'pod-active-null', name: 'Null Domain Pod', isActive: true }]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.pods({}, { domain: null } as any);

    expect(result).toEqual([
      expect.objectContaining({ id: 'pod-active-null', isActive: true }),
    ]);

    expect(mock.db.select).toHaveBeenCalledTimes(1);
    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledTimes(1);
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
  });
});
