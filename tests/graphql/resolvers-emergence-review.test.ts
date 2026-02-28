import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('emergence mutations', () => {
  it('reports emergence event with default scoreImpact', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'event-1',
        agentId: 'agent-1',
        eventType: 'NOVEL_STRATEGY',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const event = await resolvers.Mutation.reportEmergence(
      {},
      {
        input: {
          agentId: 'agent-1',
          eventType: 'NOVEL_STRATEGY',
          description: 'Found better routing path',
          evidence: { source: 'unit-test' },
        },
      },
      { agentId: 'reviewer-1' } as any
    );

    expect(event).toEqual(expect.objectContaining({ id: 'event-1', agentId: 'agent-1' }));
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        agentId: 'agent-1',
        eventType: 'NOVEL_STRATEGY',
        description: 'Found better routing path',
        evidence: { source: 'unit-test' },
        scoreImpact: 0,
      })
    );
  });

  it('reviews emergence and updates agent score when verified with scoreImpact', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'event-2',
        agentId: 'agent-2',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const reviewed = await resolvers.Mutation.reviewEmergence(
      {},
      {
        eventId: 'event-2',
        input: { isVerified: true, reviewNotes: 'Validated', scoreImpact: 7 },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(reviewed).toEqual(expect.objectContaining({ id: 'event-2', agentId: 'agent-2' }));
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        isVerified: true,
        reviewNotes: 'Validated',
        scoreImpact: 7,
        reviewedById: 'agent-reviewer',
        reviewedAt: expect.any(Date),
      })
    );
    expect(mock.updateSets).toHaveLength(2);
    expect(mock.updateSets[1]).toEqual(
      expect.objectContaining({
        lastEmergenceCheck: expect.any(Date),
      })
    );
    expect(mock.updateSets[1]).toHaveProperty('emergenceScore');
  });

  it('does not update agent score when review is not verified', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'event-3',
        agentId: 'agent-3',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const reviewed = await resolvers.Mutation.reviewEmergence(
      {},
      {
        eventId: 'event-3',
        input: { isVerified: false, reviewNotes: 'Insufficient evidence', scoreImpact: 5 },
      },
      { agentId: 'agent-reviewer' } as any
    );

    expect(reviewed).toEqual(expect.objectContaining({ id: 'event-3', agentId: 'agent-3' }));
    expect(mock.updateSets).toHaveLength(1);
  });
});
