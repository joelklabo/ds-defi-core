import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('type resolver missing linked rows', () => {
  it('returns undefined when optional relation ids are present but no matching row exists', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([], [], []);

    const resolvers = createResolvers(mock.db);

    const claimedBy = await resolvers.Task.claimedBy({ claimedById: 'agent-missing' } as any);
    const reviewer = await resolvers.Task.reviewer({ reviewerId: 'agent-missing' } as any);
    const fromAgent = await resolvers.Transaction.fromAgent({ fromAgentId: 'agent-missing' } as any);

    expect(claimedBy).toBeUndefined();
    expect(reviewer).toBeUndefined();
    expect(fromAgent).toBeUndefined();
    expect(mock.db.select).toHaveBeenCalledTimes(3);
  });

  it('also returns undefined for required relation resolvers when lookup rows are missing', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([], []);

    const resolvers = createResolvers(mock.db);

    const pod = await resolvers.PodMember.pod({ podId: 'pod-missing' } as any);
    const emergenceAgent = await resolvers.EmergenceEvent.agent({ agentId: 'agent-missing' } as any);

    expect(pod).toBeUndefined();
    expect(emergenceAgent).toBeUndefined();
    expect(mock.db.select).toHaveBeenCalledTimes(2);
  });
});
