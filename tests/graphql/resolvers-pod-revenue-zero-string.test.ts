import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('pod revenueSharePercent zero-string preservation', () => {
  it('keeps revenueSharePercent as "0" instead of defaulting to "10.00"', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'pod-zero-revenue',
        name: 'Zero Revenue Pod',
        leadAgentId: 'agent-10',
        revenueSharePercent: '0',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const pod = await resolvers.Mutation.createPod(
      {},
      {
        input: {
          name: 'Zero Revenue Pod',
          revenueSharePercent: '0',
        },
      },
      { agentId: 'agent-10' } as any
    );

    expect(pod).toEqual(
      expect.objectContaining({
        id: 'pod-zero-revenue',
        revenueSharePercent: '0',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        name: 'Zero Revenue Pod',
        leadAgentId: 'agent-10',
        revenueSharePercent: '0',
      })
    );
    expect(mock.insertValues[1]).toEqual(
      expect.objectContaining({
        podId: 'pod-zero-revenue',
        agentId: 'agent-10',
        role: 'LEAD',
      })
    );
  });
});
