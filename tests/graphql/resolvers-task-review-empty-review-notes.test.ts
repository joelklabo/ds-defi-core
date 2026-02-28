import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewTask empty reviewNotes edge case', () => {
  it('preserves explicit empty reviewNotes and still creates payment when approved', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-empty-review-notes',
        claimedById: 'agent-worker',
        bountyAmount: '88',
        bountyToken: 'SATS',
        status: 'COMPLETED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-empty-review-notes',
        input: { qualityScore: 8, reviewNotes: '', approved: true },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(result).toEqual(expect.objectContaining({ id: 'task-empty-review-notes', status: 'COMPLETED' }));
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        qualityScore: 8,
        reviewNotes: '',
        status: 'COMPLETED',
        completedAt: expect.any(Date),
      })
    );
    expect(mock.insertValues).toContainEqual(
      expect.objectContaining({
        toAgentId: 'agent-worker',
        amount: '88',
        token: 'SATS',
        transactionType: 'TASK_PAYMENT',
        taskId: 'task-empty-review-notes',
        status: 'PENDING',
      })
    );
  });
});
