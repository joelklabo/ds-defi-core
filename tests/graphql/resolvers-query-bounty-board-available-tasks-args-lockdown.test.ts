import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver bounty board availableTasks argument lockdown', () => {
  it('returns the preloaded task list even when args are passed', async () => {
    const mock = createDbMock();
    const availableTasks = [
      { id: 'task-defi', status: 'AVAILABLE', domain: 'DEFI', bountyAmount: '250' },
      { id: 'task-web', status: 'AVAILABLE', domain: 'WEB', bountyAmount: '75' },
    ];
    mock.selectResponses.push(availableTasks, [{ count: 2 }], [{ total: '325' }]);

    const resolvers = createResolvers(mock.db);
    const board = await resolvers.Query.bountyBoard();

    const withArgs = (board as any).availableTasks({
      domain: 'DEFI',
      minBounty: '200',
      maxLevel: 'L3_SOVEREIGN',
      limit: 1,
      offset: 0,
    });
    const withoutArgs = board.availableTasks();

    expect(withArgs).toEqual(availableTasks);
    expect(withoutArgs).toEqual(availableTasks);
    expect(withArgs).toBe(withoutArgs);
    expect(board.taskCount).toBe(2);
    expect(board.totalBountyPool).toBe('325');
    expect(mock.db.select).toHaveBeenCalledTimes(3);
  });
});
