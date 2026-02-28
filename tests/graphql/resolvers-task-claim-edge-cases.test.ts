import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('claimTask mutation edge cases', () => {
  it('stamps claimedAt and updatedAt when claimTask succeeds', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([{ id: 'task-1', status: 'AVAILABLE' }]);
    mock.updateResponses.push([
      {
        id: 'task-1',
        status: 'CLAIMED',
        claimedById: 'agent-1',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.claimTask(
      {},
      { taskId: 'task-1' },
      { agentId: 'agent-1' } as any
    );

    expect(result).toEqual(expect.objectContaining({ id: 'task-1', status: 'CLAIMED' }));
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'CLAIMED',
        claimedById: 'agent-1',
        claimedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    );
  });

  it('returns undefined when claimTask update finds no matching row after availability check', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([{ id: 'task-race', status: 'AVAILABLE' }]);
    mock.updateResponses.push([]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.claimTask(
      {},
      { taskId: 'task-race' },
      { agentId: 'agent-2' } as any
    );

    expect(result).toBeUndefined();
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'CLAIMED',
        claimedById: 'agent-2',
        claimedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    );
  });
});
