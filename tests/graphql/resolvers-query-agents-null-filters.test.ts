import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver agents null filter handling', () => {
  it('treats null level/type as omitted filters', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'agent-null-filters',
        displayName: 'Agent Null Filters',
        level: 'L1_WORKER',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents({}, { level: null, type: null } as any);

    expect(result).toEqual([
      expect.objectContaining({
        id: 'agent-null-filters',
        displayName: 'Agent Null Filters',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(undefined);
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it('ignores null level/type while retaining an explicit false isSovereign filter', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'agent-null-plus-false-sovereign',
        displayName: 'Agent Null Plus False Sovereign',
        isSovereign: false,
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents(
      {},
      { level: null, type: null, isSovereign: false, limit: 4, offset: 1 } as any
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'agent-null-plus-false-sovereign',
        isSovereign: false,
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(4);
    expect(chain.offset).toHaveBeenCalledWith(1);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
