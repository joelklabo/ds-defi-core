import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('wallet and pod mutations', () => {
  it('adds wallet for authenticated agent and defaults isPrimary to false', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'wallet-1',
        agentId: 'agent-1',
        chain: 'bitcoin',
        address: 'bc1qtest',
        isPrimary: false,
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const wallet = await resolvers.Mutation.addWallet(
      {},
      { input: { chain: 'bitcoin', address: 'bc1qtest' } },
      { agentId: 'agent-1' } as any
    );

    expect(wallet).toEqual(
      expect.objectContaining({
        id: 'wallet-1',
        chain: 'bitcoin',
        address: 'bc1qtest',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        agentId: 'agent-1',
        chain: 'bitcoin',
        address: 'bc1qtest',
        isPrimary: false,
      })
    );
  });

  it('creates pod and inserts creator as LEAD member', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'pod-1',
        name: 'Makers',
        leadAgentId: 'agent-1',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const pod = await resolvers.Mutation.createPod(
      {},
      { input: { name: 'Makers', description: 'Build agents' } },
      { agentId: 'agent-1' } as any
    );

    expect(pod).toEqual(expect.objectContaining({ id: 'pod-1', name: 'Makers' }));
    expect(mock.insertValues).toHaveLength(2);
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        name: 'Makers',
        leadAgentId: 'agent-1',
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

  it('joins and leaves pods for authenticated agent', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'member-1',
        podId: 'pod-1',
        agentId: 'agent-2',
        role: 'MEMBER',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const joined = await resolvers.Mutation.joinPod(
      {},
      { podId: 'pod-1' },
      { agentId: 'agent-2' } as any
    );
    const left = await resolvers.Mutation.leavePod(
      {},
      { podId: 'pod-1' },
      { agentId: 'agent-2' } as any
    );

    expect(joined).toEqual(
      expect.objectContaining({
        podId: 'pod-1',
        agentId: 'agent-2',
        role: 'MEMBER',
      })
    );
    expect(left).toBe(true);
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        leftAt: expect.any(Date),
      })
    );
  });
});
