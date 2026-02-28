import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('pod mutation custom field behavior', () => {
  it('keeps provided domain, description, and revenueSharePercent values', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'pod-custom',
        name: 'Custom Pod',
        description: 'Shared execution lane',
        domain: 'DEVELOPMENT',
        leadAgentId: 'agent-2',
        revenueSharePercent: '15.50',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const pod = await resolvers.Mutation.createPod(
      {},
      {
        input: {
          name: 'Custom Pod',
          description: 'Shared execution lane',
          domain: 'DEVELOPMENT',
          revenueSharePercent: '15.50',
        },
      },
      { agentId: 'agent-2' } as any
    );

    expect(pod).toEqual(
      expect.objectContaining({
        id: 'pod-custom',
        domain: 'DEVELOPMENT',
        revenueSharePercent: '15.50',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        name: 'Custom Pod',
        description: 'Shared execution lane',
        domain: 'DEVELOPMENT',
        leadAgentId: 'agent-2',
        revenueSharePercent: '15.50',
      })
    );
    expect(mock.insertValues[1]).toEqual(
      expect.objectContaining({
        podId: 'pod-custom',
        agentId: 'agent-2',
        role: 'LEAD',
      })
    );
  });

  it('stores undefined optional fields when only required pod name is supplied', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'pod-minimal',
        name: 'Minimal Pod',
        leadAgentId: 'agent-3',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const pod = await resolvers.Mutation.createPod(
      {},
      { input: { name: 'Minimal Pod' } },
      { agentId: 'agent-3' } as any
    );

    expect(pod).toEqual(expect.objectContaining({ id: 'pod-minimal', name: 'Minimal Pod' }));
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        name: 'Minimal Pod',
        description: undefined,
        domain: undefined,
        leadAgentId: 'agent-3',
        revenueSharePercent: '10.00',
      })
    );
  });
});
