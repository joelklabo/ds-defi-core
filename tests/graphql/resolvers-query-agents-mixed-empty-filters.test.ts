import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver agents mixed empty-string filters', () => {
  it('ignores empty-string level while applying a non-empty type filter', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'agent-type-only',
        displayName: 'Agent Type Only',
        agentType: 'EXECUTOR',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents(
      {},
      { level: '', type: 'EXECUTOR', limit: 11, offset: 4 } as any
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'agent-type-only',
        displayName: 'Agent Type Only',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(11);
    expect(chain.offset).toHaveBeenCalledWith(4);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it('ignores empty-string type while applying a non-empty level filter', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'agent-level-only',
        displayName: 'Agent Level Only',
        level: 'L3_EXPERT',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents(
      {},
      { level: 'L3_EXPERT', type: '', limit: 7, offset: 1 } as any
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'agent-level-only',
        level: 'L3_EXPERT',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(7);
    expect(chain.offset).toHaveBeenCalledWith(1);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
