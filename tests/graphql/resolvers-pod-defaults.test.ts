import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('pod mutation defaults and edge behavior', () => {
  it('defaults createPod revenueSharePercent to 10.00 when omitted', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'pod-1',
        name: 'Infra Guild',
        leadAgentId: 'agent-1',
        revenueSharePercent: '10.00',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const pod = await resolvers.Mutation.createPod(
      {},
      { input: { name: 'Infra Guild' } },
      { agentId: 'agent-1' } as any
    );

    expect(pod).toEqual(
      expect.objectContaining({
        id: 'pod-1',
        revenueSharePercent: '10.00',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        name: 'Infra Guild',
        leadAgentId: 'agent-1',
        revenueSharePercent: '10.00',
      })
    );
    expect(mock.insertValues[1]).toEqual(
      expect.objectContaining({
        podId: 'pod-1',
        agentId: 'agent-1',
        role: 'LEAD',
      })
    );
  });

  it('returns undefined when joinPod insert returns no row', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([]);

    const resolvers = createResolvers(mock.db);
    const member = await resolvers.Mutation.joinPod(
      {},
      { podId: 'pod-missing' },
      { agentId: 'agent-2' } as any
    );

    expect(member).toBeUndefined();
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        podId: 'pod-missing',
        agentId: 'agent-2',
        role: 'MEMBER',
      })
    );
  });
});
