import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('pod revenueSharePercent null fallback', () => {
  it('stores the default revenueSharePercent when null is provided', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'pod-null-revenue',
        name: 'Null Revenue Pod',
        leadAgentId: 'agent-14',
        revenueSharePercent: '10.00',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const pod = await resolvers.Mutation.createPod(
      {},
      {
        input: {
          name: 'Null Revenue Pod',
          revenueSharePercent: null as any,
        },
      },
      { agentId: 'agent-14' } as any
    );

    expect(pod).toEqual(
      expect.objectContaining({
        id: 'pod-null-revenue',
        revenueSharePercent: '10.00',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        name: 'Null Revenue Pod',
        leadAgentId: 'agent-14',
        revenueSharePercent: '10.00',
      })
    );
    expect(mock.insertValues[1]).toEqual(
      expect.objectContaining({
        podId: 'pod-null-revenue',
        agentId: 'agent-14',
        role: 'LEAD',
      })
    );
  });
});
