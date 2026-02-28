import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver myTasks', () => {
  it('returns an empty list without hitting the database when unauthenticated', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    const result = await resolvers.Query.myTasks({}, {}, { agentId: undefined } as any);

    expect(result).toEqual([]);
    expect(mock.db.select).not.toHaveBeenCalled();
  });

  it('returns claimed tasks for authenticated agent ordered by claimedAt desc', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      { id: 'task-1', claimedById: 'agent-1', status: 'CLAIMED' },
      { id: 'task-2', claimedById: 'agent-1', status: 'SUBMITTED' },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.myTasks({}, {}, { agentId: 'agent-1' } as any);

    expect(result).toEqual([
      expect.objectContaining({ id: 'task-1', claimedById: 'agent-1' }),
      expect.objectContaining({ id: 'task-2', claimedById: 'agent-1' }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledTimes(1);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });
});
