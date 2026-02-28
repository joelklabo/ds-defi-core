import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('task claim and submit flow', () => {
  it('fails claimTask when task does not exist', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([]);
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.claimTask({}, { taskId: 'missing-task' }, { agentId: 'agent-1' } as any)
    ).rejects.toThrow('Task not found');
  });

  it('fails claimTask when task is not AVAILABLE', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([{ id: 'task-1', status: 'CLAIMED' }]);
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.claimTask({}, { taskId: 'task-1' }, { agentId: 'agent-1' } as any)
    ).rejects.toThrow('Task is not available');
  });

  it('claims an available task and persists claim metadata', async () => {
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

    expect(result).toEqual({ id: 'task-1', status: 'CLAIMED', claimedById: 'agent-1' });
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'CLAIMED',
        claimedById: 'agent-1',
      })
    );
  });

  it('fails submitTask when no matching owned task is updated', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([]);
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.submitTask(
        {},
        { taskId: 'task-1', evidence: { note: 'done' } },
        { agentId: 'agent-1' } as any
      )
    ).rejects.toThrow('Task not found or not owned by you');
  });
});
