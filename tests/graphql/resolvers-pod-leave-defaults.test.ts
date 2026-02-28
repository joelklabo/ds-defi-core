import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('leavePod mutation defaults', () => {
  it('returns true and timestamps leftAt even when no membership row is updated', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    const left = await resolvers.Mutation.leavePod(
      {},
      { podId: 'pod-missing' },
      { agentId: 'agent-404' } as any
    );

    expect(left).toBe(true);
    expect(mock.db.update).toHaveBeenCalledTimes(1);
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        leftAt: expect.any(Date),
      })
    );
  });
});
