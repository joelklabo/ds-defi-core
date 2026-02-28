import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver economy stats empty aggregate behavior', () => {
  it('returns zero defaults when aggregate queries return no rows', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([], []);

    const resolvers = createResolvers(mock.db);
    const stats = await resolvers.Query.economyStats();

    expect(stats).toEqual({
      totalAgents: 0,
      sovereignAgents: 0,
      activeAgents: 0,
      totalCirculating: '0',
      dailyVolume: '0',
      tasksCompletedToday: 0,
      tasksCompletedTotal: 0,
      averageEmergenceScore: 0,
      emergenceEventsToday: 0,
    });
    expect(mock.db.select).toHaveBeenCalledTimes(2);
  });
});
