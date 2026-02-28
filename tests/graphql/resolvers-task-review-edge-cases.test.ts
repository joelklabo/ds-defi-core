import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewTask mutation edge cases', () => {
  it('throws a clear error when task is missing', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([]);

    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.reviewTask(
        {},
        {
          taskId: 'missing-task',
          input: { qualityScore: 7, approved: true },
        },
        { agentId: 'agent-reviewer' } as any
      )
    ).rejects.toThrow('Task not found');

    expect(mock.insertValues).toHaveLength(0);
  });

  it('skips payment creation when approved task has no claimant', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-unclaimed',
        claimedById: null,
        bountyAmount: '100',
        bountyToken: 'SATS',
        status: 'COMPLETED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-unclaimed',
        input: { qualityScore: 8, approved: true },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(result).toEqual(expect.objectContaining({ id: 'task-unclaimed', status: 'COMPLETED' }));
    expect(mock.insertValues).toHaveLength(0);
  });
});
