import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewEmergence negative scoreImpact handling', () => {
  it('persists negative scoreImpact and applies a score update for verified reviews', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'event-negative-impact',
        agentId: 'agent-negative-impact',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const reviewed = await resolvers.Mutation.reviewEmergence(
      {},
      {
        eventId: 'event-negative-impact',
        input: {
          isVerified: true,
          reviewNotes: 'Verified with regression impact',
          scoreImpact: -3,
        },
      },
      { agentId: 'reviewer-negative-impact' } as any
    );

    expect(reviewed).toEqual(
      expect.objectContaining({
        id: 'event-negative-impact',
        agentId: 'agent-negative-impact',
      })
    );
    expect(mock.updateSets).toHaveLength(2);
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        isVerified: true,
        reviewNotes: 'Verified with regression impact',
        scoreImpact: -3,
        reviewedById: 'reviewer-negative-impact',
        reviewedAt: expect.any(Date),
      })
    );
    expect(mock.updateSets[1]).toEqual(
      expect.objectContaining({
        lastEmergenceCheck: expect.any(Date),
      })
    );
    expect(mock.updateSets[1]).toHaveProperty('emergenceScore');
    expect(mock.db.update).toHaveBeenCalledTimes(2);
  });
});
