import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewTask zero quality score edge case', () => {
  it('preserves a 0 qualityScore and still creates payment when approved', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-zero-quality',
        claimedById: 'agent-worker',
        bountyAmount: '77',
        bountyToken: 'SATS',
        status: 'COMPLETED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-zero-quality',
        input: { qualityScore: 0, approved: true },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(result).toEqual(expect.objectContaining({ id: 'task-zero-quality', status: 'COMPLETED' }));
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        qualityScore: 0,
        status: 'COMPLETED',
        completedAt: expect.any(Date),
      })
    );
    expect(mock.insertValues).toContainEqual(
      expect.objectContaining({
        toAgentId: 'agent-worker',
        amount: '77',
        token: 'SATS',
        transactionType: 'TASK_PAYMENT',
        taskId: 'task-zero-quality',
        status: 'PENDING',
      })
    );
  });
});
