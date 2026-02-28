import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver economy stats populated behavior', () => {
  it('maps aggregate values when economy stats rows are present', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ total: 14, sovereign: 9, active: 11 }],
      [{ completedToday: 5, completedTotal: 42 }]
    );

    const resolvers = createResolvers(mock.db);
    const stats = await resolvers.Query.economyStats();

    expect(stats).toEqual({
      totalAgents: 14,
      sovereignAgents: 9,
      activeAgents: 11,
      totalCirculating: '0',
      dailyVolume: '0',
      tasksCompletedToday: 5,
      tasksCompletedTotal: 42,
      averageEmergenceScore: 0,
      emergenceEventsToday: 0,
    });
  });

  it('falls back missing aggregate fields to zero while preserving provided values', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ total: 3, sovereign: undefined, active: 2 }],
      [{ completedToday: undefined, completedTotal: 7 }]
    );

    const resolvers = createResolvers(mock.db);
    const stats = await resolvers.Query.economyStats();

    expect(stats).toEqual({
      totalAgents: 3,
      sovereignAgents: 0,
      activeAgents: 2,
      totalCirculating: '0',
      dailyVolume: '0',
      tasksCompletedToday: 0,
      tasksCompletedTotal: 7,
      averageEmergenceScore: 0,
      emergenceEventsToday: 0,
    });
  });
});
