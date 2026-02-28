import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('type resolver optional relation id edge cases', () => {
  it('treats empty-string optional ids as missing and skips lookups', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    const manager = await resolvers.Agent.manager({ managerAgentId: '' } as any);
    const claimedBy = await resolvers.Task.claimedBy({ claimedById: '' } as any);
    const reviewer = await resolvers.Task.reviewer({ reviewerId: '' } as any);
    const createdBy = await resolvers.Task.createdBy({ createdById: '' } as any);
    const lead = await resolvers.Pod.lead({ leadAgentId: '' } as any);
    const fromAgent = await resolvers.Transaction.fromAgent({ fromAgentId: '' } as any);
    const toAgent = await resolvers.Transaction.toAgent({ toAgentId: '' } as any);
    const task = await resolvers.Transaction.task({ taskId: '' } as any);
    const reviewedBy = await resolvers.EmergenceEvent.reviewedBy({ reviewedById: '' } as any);

    expect(manager).toBeNull();
    expect(claimedBy).toBeNull();
    expect(reviewer).toBeNull();
    expect(createdBy).toBeNull();
    expect(lead).toBeNull();
    expect(fromAgent).toBeNull();
    expect(toAgent).toBeNull();
    expect(task).toBeNull();
    expect(reviewedBy).toBeNull();
    expect(mock.db.select).not.toHaveBeenCalled();
  });

  it('still performs lookups for whitespace-only ids', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([], [], [], []);

    const resolvers = createResolvers(mock.db);

    const manager = await resolvers.Agent.manager({ managerAgentId: '   ' } as any);
    const createdBy = await resolvers.Task.createdBy({ createdById: '   ' } as any);
    const toAgent = await resolvers.Transaction.toAgent({ toAgentId: '   ' } as any);
    const reviewedBy = await resolvers.EmergenceEvent.reviewedBy({ reviewedById: '   ' } as any);

    expect(manager).toBeUndefined();
    expect(createdBy).toBeUndefined();
    expect(toAgent).toBeUndefined();
    expect(reviewedBy).toBeUndefined();
    expect(mock.db.select).toHaveBeenCalledTimes(4);
  });
});
