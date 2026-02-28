import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver agents whitespace-string filters', () => {
  it('treats whitespace-only level/type as present filters while retaining explicit false sovereign', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'agent-whitespace-filters',
        displayName: 'Agent Whitespace Filters',
        isSovereign: false,
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents(
      {},
      { level: '   ', type: '   ', isSovereign: false } as any
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'agent-whitespace-filters',
        isSovereign: false,
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
