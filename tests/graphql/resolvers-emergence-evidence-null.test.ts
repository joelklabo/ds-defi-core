import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reportEmergence evidence null fallback', () => {
  it('normalizes explicit null evidence to an empty object', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'event-null-evidence',
        agentId: 'agent-null-evidence',
        eventType: 'NOVEL_STRATEGY',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const event = await resolvers.Mutation.reportEmergence(
      {},
      {
        input: {
          agentId: 'agent-null-evidence',
          eventType: 'NOVEL_STRATEGY',
          description: 'Verify null evidence fallback',
          evidence: null as any,
        },
      },
      { agentId: 'reviewer-null-evidence' } as any
    );

    expect(event).toEqual(
      expect.objectContaining({
        id: 'event-null-evidence',
        agentId: 'agent-null-evidence',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        agentId: 'agent-null-evidence',
        eventType: 'NOVEL_STRATEGY',
        description: 'Verify null evidence fallback',
        evidence: {},
        scoreImpact: 0,
      })
    );
  });
});
