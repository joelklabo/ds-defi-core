import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewTask completedAt behavior', () => {
  it('sets completedAt when a task review is approved', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-approved',
        claimedById: 'agent-worker',
        bountyAmount: '120',
        bountyToken: 'SATS',
        status: 'COMPLETED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-approved',
        input: { qualityScore: 10, reviewNotes: 'Excellent', approved: true },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'COMPLETED',
        completedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    );
  });

  it('keeps completedAt undefined when a task review is rejected', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-rejected',
        claimedById: 'agent-worker',
        bountyAmount: '120',
        bountyToken: 'SATS',
        status: 'DISPUTED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-rejected',
        input: { qualityScore: 3, reviewNotes: 'Needs work', approved: false },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'DISPUTED',
        completedAt: undefined,
        updatedAt: expect.any(Date),
      })
    );
  });
});
