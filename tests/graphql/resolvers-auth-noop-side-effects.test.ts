import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('auth guard side effects', () => {
  it('does not perform inserts when sendZap is unauthorized', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.sendZap({}, { toAgentId: 'agent-2', amount: '21', message: 'unauthorized' }, {} as any)
    ).rejects.toThrow('Unauthorized');

    expect(mock.db.insert).not.toHaveBeenCalled();
  });

  it('does not perform updates or inserts when reviewEmergence is unauthorized', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.reviewEmergence(
        {},
        { eventId: 'evt-1', input: { isVerified: true, reviewNotes: 'blocked', scoreImpact: 2 } },
        {} as any
      )
    ).rejects.toThrow('Unauthorized');

    expect(mock.db.update).not.toHaveBeenCalled();
    expect(mock.db.insert).not.toHaveBeenCalled();
  });

  it('does not perform updates when updateAgent caller does not own target agent', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.updateAgent(
        {},
        { id: 'agent-owner', input: { displayName: 'Blocked Update' } },
        { agentId: 'different-agent' } as any
      )
    ).rejects.toThrow('Unauthorized: Cannot update another agent');

    expect(mock.db.update).not.toHaveBeenCalled();
  });
});
