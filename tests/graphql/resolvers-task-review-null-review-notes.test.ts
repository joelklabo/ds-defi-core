import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewTask null reviewNotes edge case', () => {
  it('preserves explicit null reviewNotes on approved reviews and still creates payment', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-null-review-notes',
        claimedById: 'agent-worker',
        bountyAmount: '91',
        bountyToken: 'SATS',
        status: 'COMPLETED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-null-review-notes',
        input: { qualityScore: 9, reviewNotes: null as any, approved: true },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'task-null-review-notes',
        status: 'COMPLETED',
      })
    );
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'COMPLETED',
        qualityScore: 9,
        reviewNotes: null,
        completedAt: expect.any(Date),
      })
    );
    expect(mock.insertValues).toContainEqual(
      expect.objectContaining({
        toAgentId: 'agent-worker',
        amount: '91',
        token: 'SATS',
        transactionType: 'TASK_PAYMENT',
        taskId: 'task-null-review-notes',
        status: 'PENDING',
      })
    );
  });
});
