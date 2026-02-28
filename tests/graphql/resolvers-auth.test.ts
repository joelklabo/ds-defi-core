import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

const protectedMutationCases = [
  {
    name: 'claimTask',
    invoke: (mutation: any, ctx: any) => mutation.claimTask({}, { taskId: 'task-1' }, ctx),
  },
  {
    name: 'submitTask',
    invoke: (mutation: any, ctx: any) =>
      mutation.submitTask({}, { taskId: 'task-1', evidence: {} }, ctx),
  },
  {
    name: 'reviewTask',
    invoke: (mutation: any, ctx: any) =>
      mutation.reviewTask({}, { taskId: 'task-1', input: { qualityScore: 8, approved: true } }, ctx),
  },
  {
    name: 'addWallet',
    invoke: (mutation: any, ctx: any) =>
      mutation.addWallet({}, { input: { chain: 'bitcoin', address: 'bc1abc' } }, ctx),
  },
  {
    name: 'createPod',
    invoke: (mutation: any, ctx: any) => mutation.createPod({}, { input: { name: 'Builders' } }, ctx),
  },
  {
    name: 'joinPod',
    invoke: (mutation: any, ctx: any) => mutation.joinPod({}, { podId: 'pod-1' }, ctx),
  },
  {
    name: 'leavePod',
    invoke: (mutation: any, ctx: any) => mutation.leavePod({}, { podId: 'pod-1' }, ctx),
  },
  {
    name: 'reviewEmergence',
    invoke: (mutation: any, ctx: any) =>
      mutation.reviewEmergence(
        {},
        { eventId: 'evt-1', input: { isVerified: true, scoreImpact: 1 } },
        ctx
      ),
  },
  {
    name: 'sendZap',
    invoke: (mutation: any, ctx: any) =>
      mutation.sendZap({}, { toAgentId: 'agent-2', amount: '10' }, ctx),
  },
] as const;

describe('resolvers auth guards', () => {
  it('returns null for Query.me when context has no agentId', async () => {
    const { db } = createDbMock();
    const resolvers = createResolvers(db);

    const result = await resolvers.Query.me({}, {}, { agentId: undefined } as any);

    expect(result).toBeNull();
  });

  it.each(protectedMutationCases)(
    'rejects Mutation.$name when no authenticated agent is present',
    async ({ invoke }) => {
      const { db } = createDbMock();
      const resolvers = createResolvers(db);
      const ctx = { agentId: undefined } as any;

      await expect(invoke(resolvers.Mutation, ctx)).rejects.toThrow('Unauthorized');
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
