import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewEmergence scoreImpact null fallback', () => {
  it('normalizes explicit null scoreImpact to 0 and skips emergence-score increment', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'event-null-impact',
        agentId: 'agent-null-impact',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const reviewed = await resolvers.Mutation.reviewEmergence(
      {},
      {
        eventId: 'event-null-impact',
        input: {
          isVerified: true,
          reviewNotes: 'Verified with null impact',
          scoreImpact: null as any,
        },
      },
      { agentId: 'reviewer-null-impact' } as any
    );

    expect(reviewed).toEqual(
      expect.objectContaining({
        id: 'event-null-impact',
        agentId: 'agent-null-impact',
      })
    );
    expect(mock.updateSets).toHaveLength(1);
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        isVerified: true,
        reviewNotes: 'Verified with null impact',
        scoreImpact: 0,
        reviewedById: 'reviewer-null-impact',
        reviewedAt: expect.any(Date),
      })
    );
    expect(mock.db.update).toHaveBeenCalledTimes(1);
  });
});
