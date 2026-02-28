import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver pods whitespace-domain handling', () => {
  it('treats whitespace-only domain as provided and uses domain-filter path', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'pod-whitespace-domain',
        name: 'Whitespace Pod',
        domain: '   ',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.pods({}, { domain: '   ' });

    expect(result).toEqual([
      expect.objectContaining({
        id: 'pod-whitespace-domain',
        domain: '   ',
      }),
    ]);

    expect(mock.db.select).toHaveBeenCalledTimes(1);
    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledTimes(1);
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
  });
});
