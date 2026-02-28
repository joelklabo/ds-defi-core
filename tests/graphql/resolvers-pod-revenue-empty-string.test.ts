import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('pod revenueSharePercent empty-string fallback', () => {
  it('stores the default revenueSharePercent when an empty string is provided', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'pod-empty-revenue',
        name: 'Empty Revenue Pod',
        leadAgentId: 'agent-9',
        revenueSharePercent: '10.00',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const pod = await resolvers.Mutation.createPod(
      {},
      {
        input: {
          name: 'Empty Revenue Pod',
          revenueSharePercent: '',
        },
      },
      { agentId: 'agent-9' } as any
    );

    expect(pod).toEqual(
      expect.objectContaining({
        id: 'pod-empty-revenue',
        revenueSharePercent: '10.00',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        name: 'Empty Revenue Pod',
        leadAgentId: 'agent-9',
        revenueSharePercent: '10.00',
      })
    );
  });
});
