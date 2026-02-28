import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewTask whitespace reviewNotes approved edge case', () => {
  it('preserves whitespace-only reviewNotes on approved reviews and still creates payment', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-whitespace-approved-review-notes',
        claimedById: 'agent-worker',
        bountyAmount: '73',
        bountyToken: 'SATS',
        status: 'COMPLETED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-whitespace-approved-review-notes',
        input: { qualityScore: 7, reviewNotes: '   ', approved: true },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'task-whitespace-approved-review-notes',
        status: 'COMPLETED',
      })
    );
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'COMPLETED',
        qualityScore: 7,
        reviewNotes: '   ',
        completedAt: expect.any(Date),
      })
    );
    expect(mock.insertValues).toContainEqual(
      expect.objectContaining({
        toAgentId: 'agent-worker',
        amount: '73',
        token: 'SATS',
        transactionType: 'TASK_PAYMENT',
        taskId: 'task-whitespace-approved-review-notes',
        status: 'PENDING',
      })
    );
  });
});
