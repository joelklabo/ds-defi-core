import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('emergence mutation defaults', () => {
  it('stores an empty evidence object when reportEmergence evidence is omitted', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'event-10',
        agentId: 'agent-10',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const event = await resolvers.Mutation.reportEmergence(
      {},
      {
        input: {
          agentId: 'agent-10',
          eventType: 'BEHAVIOR_SHIFT',
          description: 'Agent changed its planning strategy',
        },
      },
      { agentId: 'reviewer-10' } as any
    );

    expect(event).toEqual(expect.objectContaining({ id: 'event-10', agentId: 'agent-10' }));
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        evidence: {},
        scoreImpact: 0,
      })
    );
  });

  it('does not update agent emergence score when verified review has zero or omitted scoreImpact', async () => {
    const mock = createDbMock();
    mock.updateResponses.push(
      [
        {
          id: 'event-11',
          agentId: 'agent-11',
        },
      ],
      [
        {
          id: 'event-12',
          agentId: 'agent-12',
        },
      ]
    );

    const resolvers = createResolvers(mock.db);
    const withZeroImpact = await resolvers.Mutation.reviewEmergence(
      {},
      {
        eventId: 'event-11',
        input: { isVerified: true, reviewNotes: 'Verified but neutral', scoreImpact: 0 },
      },
      { agentId: 'reviewer-11' } as any
    );

    const withOmittedImpact = await resolvers.Mutation.reviewEmergence(
      {},
      {
        eventId: 'event-12',
        input: { isVerified: true, reviewNotes: 'Verified with no explicit impact' },
      },
      { agentId: 'reviewer-12' } as any
    );

    expect(withZeroImpact).toEqual(expect.objectContaining({ id: 'event-11', agentId: 'agent-11' }));
    expect(withOmittedImpact).toEqual(
      expect.objectContaining({ id: 'event-12', agentId: 'agent-12' })
    );

    expect(mock.updateSets).toHaveLength(2);
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        isVerified: true,
        reviewNotes: 'Verified but neutral',
        scoreImpact: 0,
        reviewedById: 'reviewer-11',
        reviewedAt: expect.any(Date),
      })
    );
    expect(mock.updateSets[1]).toEqual(
      expect.objectContaining({
        isVerified: true,
        reviewNotes: 'Verified with no explicit impact',
        scoreImpact: 0,
        reviewedById: 'reviewer-12',
        reviewedAt: expect.any(Date),
      })
    );
  });
});
