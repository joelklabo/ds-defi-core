import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver board and stats behavior', () => {
  it('returns the first matching agent and null for missing task', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ id: 'agent-1', displayName: 'Alice' }],
      []
    );

    const resolvers = createResolvers(mock.db);
    const agent = await resolvers.Query.agent({}, { id: 'agent-1' });
    const task = await resolvers.Query.task({}, { id: 'task-missing' });

    expect(agent).toEqual(
      expect.objectContaining({
        id: 'agent-1',
        displayName: 'Alice',
      })
    );
    expect(task).toBeNull();
  });

  it('builds bounty board values from task list and aggregates', async () => {
    const mock = createDbMock();
    const availableTasks = [{ id: 'task-1', status: 'AVAILABLE', bountyAmount: '250' }];
    mock.selectResponses.push(
      availableTasks,
      [{ count: 1 }],
      [{ total: '250' }]
    );

    const resolvers = createResolvers(mock.db);
    const board = await resolvers.Query.bountyBoard();

    expect(board.availableTasks()).toEqual(availableTasks);
    expect(board.taskCount).toBe(1);
    expect(board.totalBountyPool).toBe('250');
    expect(board.domainStats).toEqual([]);
  });

  it('returns zeroed economy stats when aggregate rows are empty', async () => {
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
  });

  it('filters pods by domain when provided and active pods otherwise', async () => {
    const mock = createDbMock();
    const defiPods = [{ id: 'pod-1', domain: 'DEFI' }];
    const activePods = [{ id: 'pod-2', isActive: true }];
    mock.selectResponses.push(defiPods, activePods);

    const resolvers = createResolvers(mock.db);
    const byDomain = await resolvers.Query.pods({}, { domain: 'DEFI' });
    const activeOnly = await resolvers.Query.pods({}, {});

    expect(byDomain).toEqual(defiPods);
    expect(activeOnly).toEqual(activePods);
  });
});
