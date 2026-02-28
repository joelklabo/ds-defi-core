import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewTask mutation', () => {
  it('marks task completed and creates payment transaction when approved', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-1',
        claimedById: 'agent-worker',
        bountyAmount: '250',
        bountyToken: 'SATS',
        status: 'COMPLETED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-1',
        input: { qualityScore: 9, reviewNotes: 'Great work', approved: true },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'task-1',
        status: 'COMPLETED',
      })
    );
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'COMPLETED',
        reviewerId: 'agent-reviewer',
        qualityScore: 9,
        reviewNotes: 'Great work',
      })
    );
    expect(mock.insertValues).toContainEqual(
      expect.objectContaining({
        fromAgentId: null,
        toAgentId: 'agent-worker',
        amount: '250',
        token: 'SATS',
        transactionType: 'TASK_PAYMENT',
        taskId: 'task-1',
        status: 'PENDING',
      })
    );
  });

  it('marks task disputed and does not create payment when rejected', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-2',
        claimedById: 'agent-worker',
        bountyAmount: '99',
        bountyToken: 'SATS',
        status: 'DISPUTED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-2',
        input: { qualityScore: 3, reviewNotes: 'Needs rework', approved: false },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(result).toEqual(expect.objectContaining({ id: 'task-2', status: 'DISPUTED' }));
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'DISPUTED',
        reviewerId: 'agent-reviewer',
        qualityScore: 3,
      })
    );
    expect(mock.insertValues).toHaveLength(0);
  });
});
