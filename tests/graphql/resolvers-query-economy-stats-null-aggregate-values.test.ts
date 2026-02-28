import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver economy stats null aggregate values', () => {
  it('falls back to zero defaults for null aggregate fields while preserving non-null values', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ total: null, sovereign: 5, active: null }],
      [{ completedToday: null, completedTotal: 18 }]
    );

    const resolvers = createResolvers(mock.db);
    const stats = await resolvers.Query.economyStats();

    expect(stats).toEqual({
      totalAgents: 0,
      sovereignAgents: 5,
      activeAgents: 0,
      totalCirculating: '0',
      dailyVolume: '0',
      tasksCompletedToday: 0,
      tasksCompletedTotal: 18,
      averageEmergenceScore: 0,
      emergenceEventsToday: 0,
    });
    expect(mock.db.select).toHaveBeenCalledTimes(2);
  });
});
