import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver bounty board falsy aggregate values', () => {
  it('falls back to defaults when aggregate rows contain other falsy values', async () => {
    const mock = createDbMock();
    const availableTasks = [{ id: 'task-9', status: 'AVAILABLE', bountyAmount: '450' }];
    mock.selectResponses.push(availableTasks, [{ count: Number.NaN }], [{ total: '' }]);

    const resolvers = createResolvers(mock.db);
    const board = await resolvers.Query.bountyBoard();

    expect(board.availableTasks()).toEqual(availableTasks);
    expect(board.taskCount).toBe(0);
    expect(board.totalBountyPool).toBe('0');
    expect(board.domainStats).toEqual([]);
    expect(mock.db.select).toHaveBeenCalledTimes(3);
  });
});
