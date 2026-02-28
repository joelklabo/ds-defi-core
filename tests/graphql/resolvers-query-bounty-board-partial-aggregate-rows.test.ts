import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver bounty board partial aggregate rows', () => {
  it('falls back aggregate fields to defaults when rows are present but values are undefined', async () => {
    const mock = createDbMock();
    const availableTasks = [{ id: 'task-1', status: 'AVAILABLE', bountyAmount: '150' }];
    mock.selectResponses.push(availableTasks, [{ count: undefined }], [{ total: undefined }]);

    const resolvers = createResolvers(mock.db);
    const board = await resolvers.Query.bountyBoard();

    expect(board.availableTasks()).toEqual(availableTasks);
    expect(board.taskCount).toBe(0);
    expect(board.totalBountyPool).toBe('0');
    expect(board.domainStats).toEqual([]);
    expect(mock.db.select).toHaveBeenCalledTimes(3);
  });
});
