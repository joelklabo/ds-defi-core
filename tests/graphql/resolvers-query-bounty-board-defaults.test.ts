import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver bounty board fallback behavior', () => {
  it('falls back to zero values when aggregate rows are missing', async () => {
    const mock = createDbMock();
    const availableTasks = [{ id: 'task-1', status: 'AVAILABLE', bountyAmount: '125' }];
    mock.selectResponses.push(availableTasks, [], []);

    const resolvers = createResolvers(mock.db);
    const board = await resolvers.Query.bountyBoard();

    expect(board.availableTasks()).toEqual(availableTasks);
    expect(board.taskCount).toBe(0);
    expect(board.totalBountyPool).toBe('0');
    expect(board.domainStats).toEqual([]);
  });

  it('returns cached availableTasks results without additional selects', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ id: 'task-2', status: 'AVAILABLE', bountyAmount: '300' }],
      [{ count: 1 }],
      [{ total: '300' }]
    );

    const resolvers = createResolvers(mock.db);
    const board = await resolvers.Query.bountyBoard();

    const first = board.availableTasks();
    const second = board.availableTasks();

    expect(first).toEqual([{ id: 'task-2', status: 'AVAILABLE', bountyAmount: '300' }]);
    expect(second).toEqual(first);
    expect(mock.db.select).toHaveBeenCalledTimes(3);
  });
});
