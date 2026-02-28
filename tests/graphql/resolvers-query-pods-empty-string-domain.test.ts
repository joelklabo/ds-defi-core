import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver pods empty-string domain handling', () => {
  it('treats empty-string domain as omitted and returns active pods', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([{ id: 'pod-active', name: 'Generalists', isActive: true }]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.pods({}, { domain: '' });

    expect(result).toEqual([expect.objectContaining({ id: 'pod-active', isActive: true })]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.where).toHaveBeenCalledTimes(1);
  });
});
