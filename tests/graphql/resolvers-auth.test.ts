import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('resolvers auth guards', () => {
  it('returns null for Query.me when context has no agentId', async () => {
    const { db } = createDbMock();
    const resolvers = createResolvers(db);

    const result = await resolvers.Query.me({}, {}, { agentId: undefined } as any);

    expect(result).toBeNull();
  });

  it('rejects protected mutations when no authenticated agent is present', async () => {
    const { db } = createDbMock();
    const resolvers = createResolvers(db);
    const ctx = { agentId: undefined } as any;

    await expect(resolvers.Mutation.claimTask({}, { taskId: 'task-1' }, ctx)).rejects.toThrow(
      'Unauthorized'
    );
    await expect(
      resolvers.Mutation.submitTask({}, { taskId: 'task-1', evidence: {} }, ctx)
    ).rejects.toThrow('Unauthorized');
    await expect(
      resolvers.Mutation.reviewTask(
        {},
        { taskId: 'task-1', input: { qualityScore: 8, approved: true } },
        ctx
      )
    ).rejects.toThrow('Unauthorized');
    await expect(
      resolvers.Mutation.addWallet({}, { input: { chain: 'bitcoin', address: 'bc1abc' } }, ctx)
    ).rejects.toThrow('Unauthorized');
    await expect(
      resolvers.Mutation.createPod({}, { input: { name: 'Builders' } }, ctx)
    ).rejects.toThrow('Unauthorized');
    await expect(resolvers.Mutation.joinPod({}, { podId: 'pod-1' }, ctx)).rejects.toThrow(
      'Unauthorized'
    );
    await expect(resolvers.Mutation.leavePod({}, { podId: 'pod-1' }, ctx)).rejects.toThrow(
      'Unauthorized'
    );
    await expect(
      resolvers.Mutation.reviewEmergence(
        {},
        { eventId: 'evt-1', input: { isVerified: true, scoreImpact: 1 } },
        ctx
      )
    ).rejects.toThrow('Unauthorized');
    await expect(
      resolvers.Mutation.sendZap({}, { toAgentId: 'agent-2', amount: '10' }, ctx)
    ).rejects.toThrow('Unauthorized');
  });

  it('prevents updating another agent profile', async () => {
    const { db } = createDbMock();
    const resolvers = createResolvers(db);

    await expect(
      resolvers.Mutation.updateAgent(
        {},
        { id: 'agent-owner', input: { displayName: 'New Name' } },
        { agentId: 'different-agent' } as any
      )
    ).rejects.toThrow('Unauthorized: Cannot update another agent');
  });
});
