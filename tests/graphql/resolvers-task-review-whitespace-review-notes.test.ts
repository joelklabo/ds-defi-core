import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewTask whitespace reviewNotes edge case', () => {
  it('preserves whitespace-only reviewNotes on rejected reviews and skips payment creation', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-whitespace-review-notes',
        claimedById: 'agent-worker',
        bountyAmount: '64',
        bountyToken: 'SATS',
        status: 'DISPUTED',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.reviewTask(
      {},
      {
        taskId: 'task-whitespace-review-notes',
        input: { qualityScore: 4, reviewNotes: '   ', approved: false },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(result).toEqual(
      expect.objectContaining({ id: 'task-whitespace-review-notes', status: 'DISPUTED' })
    );
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'DISPUTED',
        qualityScore: 4,
        reviewNotes: '   ',
        completedAt: undefined,
      })
    );
    expect(mock.insertValues).toHaveLength(0);
  });
});
