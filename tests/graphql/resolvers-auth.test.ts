import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

const protectedMutationCases = [
  ['claimTask', { taskId: 'task-1' }],
  ['submitTask', { taskId: 'task-1', evidence: {} }],
  ['reviewTask', { taskId: 'task-1', input: { qualityScore: 8, approved: true } }],
  ['addWallet', { input: { chain: 'bitcoin', address: 'bc1abc' } }],
  ['createPod', { input: { name: 'Builders' } }],
  ['joinPod', { podId: 'pod-1' }],
  ['leavePod', { podId: 'pod-1' }],
  ['reviewEmergence', { eventId: 'evt-1', input: { isVerified: true, scoreImpact: 1 } }],
  ['sendZap', { toAgentId: 'agent-2', amount: '10' }],
] as const;

describe('resolvers auth guards', () => {
  it('returns null for Query.me when context has no agentId', async () => {
    const { db } = createDbMock();
    const resolvers = createResolvers(db);

    const result = await resolvers.Query.me({}, {}, { agentId: undefined } as any);

    expect(result).toBeNull();
  });

  it.each(protectedMutationCases)(
    'rejects Mutation.%s when no authenticated agent is present',
    async (name, args) => {
      const { db } = createDbMock();
      const resolvers = createResolvers(db);
      const ctx = { agentId: undefined } as any;

      const mutation = resolvers.Mutation[name as keyof typeof resolvers.Mutation] as any;
      await expect(mutation({}, args, ctx)).rejects.toThrow('Unauthorized');
    }
  );

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
