import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('submitTask mutation edge cases', () => {
  it('throws a clear error when the task is missing or not owned by caller', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([]);

    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.submitTask(
        {},
        { taskId: 'task-missing', evidence: { output: 'ignored' } },
        { agentId: 'agent-1' } as any
      )
    ).rejects.toThrow('Task not found or not owned by you');
  });

  it('stamps submittedAt and updatedAt when submitTask succeeds', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-2',
        status: 'SUBMITTED',
        claimedById: 'agent-2',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.submitTask(
      {},
      { taskId: 'task-2', evidence: { link: 'https://example.com/proof' } },
      { agentId: 'agent-2' } as any
    );

    expect(result).toEqual(expect.objectContaining({ id: 'task-2', status: 'SUBMITTED' }));
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'SUBMITTED',
        submittedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    );
  });
});
