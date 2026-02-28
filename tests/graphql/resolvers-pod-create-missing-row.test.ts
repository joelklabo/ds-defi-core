import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('createPod missing-row edge behavior', () => {
  it('throws when pod insert returns no row and does not add membership values', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([]);

    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.createPod(
        {},
        { input: { name: 'Missing Pod Row' } },
        { agentId: 'agent-12' } as any
      )
    ).rejects.toThrow();

    expect(mock.insertValues).toHaveLength(1);
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        name: 'Missing Pod Row',
        leadAgentId: 'agent-12',
        revenueSharePercent: '10.00',
      })
    );
  });
});
