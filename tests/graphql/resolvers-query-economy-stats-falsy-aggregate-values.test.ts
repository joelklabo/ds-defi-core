import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver economy stats falsy aggregate values', () => {
  it('falls back to zero defaults for falsy non-null aggregate fields', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ total: Number.NaN, sovereign: '', active: 7 }],
      [{ completedToday: Number.NaN, completedTotal: '' }]
    );

    const resolvers = createResolvers(mock.db);
    const stats = await resolvers.Query.economyStats();

    expect(stats).toEqual({
      totalAgents: 0,
      sovereignAgents: 0,
      activeAgents: 7,
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
