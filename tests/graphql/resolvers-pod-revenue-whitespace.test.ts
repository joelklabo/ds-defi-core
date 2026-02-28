import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('pod revenueSharePercent whitespace preservation', () => {
  it('keeps whitespace-only revenueSharePercent instead of defaulting to 10.00', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'pod-whitespace-revenue',
        name: 'Whitespace Revenue Pod',
        leadAgentId: 'agent-11',
        revenueSharePercent: '   ',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const pod = await resolvers.Mutation.createPod(
      {},
      {
        input: {
          name: 'Whitespace Revenue Pod',
          revenueSharePercent: '   ',
        },
      },
      { agentId: 'agent-11' } as any
    );

    expect(pod).toEqual(
      expect.objectContaining({
        id: 'pod-whitespace-revenue',
        revenueSharePercent: '   ',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        name: 'Whitespace Revenue Pod',
        leadAgentId: 'agent-11',
        revenueSharePercent: '   ',
      })
    );
    expect(mock.insertValues[1]).toEqual(
      expect.objectContaining({
        podId: 'pod-whitespace-revenue',
        agentId: 'agent-11',
        role: 'LEAD',
      })
    );
  });
});
