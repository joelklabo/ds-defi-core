import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewTask empty claimant edge case', () => {
  it('skips payment creation when approved task has empty-string claimedById', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-empty-claimant',
        claimedById: '',
        bountyAmount: '150',
        bountyToken: 'SATS',
        status: 'COMPLETED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-empty-claimant',
        input: { qualityScore: 9, approved: true },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(result).toEqual(expect.objectContaining({ id: 'task-empty-claimant', status: 'COMPLETED' }));
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'COMPLETED',
        completedAt: expect.any(Date),
      })
    );
    expect(mock.insertValues).toHaveLength(0);
  });
});
