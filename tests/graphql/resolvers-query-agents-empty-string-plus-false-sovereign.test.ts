import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver agents empty-string filters with explicit false sovereign', () => {
  it('ignores empty-string level/type while retaining an explicit false isSovereign filter', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'agent-false-sovereign-only',
        displayName: 'Agent False Sovereign Only',
        isSovereign: false,
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents(
      {},
      { level: '', type: '', isSovereign: false, limit: 9, offset: 2 } as any
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'agent-false-sovereign-only',
        isSovereign: false,
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(9);
    expect(chain.offset).toHaveBeenCalledWith(2);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
