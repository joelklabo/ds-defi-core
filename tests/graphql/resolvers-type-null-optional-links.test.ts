import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('type resolver optional relation null id edge cases', () => {
  it('treats explicit null optional ids as missing and skips lookups', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    const manager = await resolvers.Agent.manager({ managerAgentId: null } as any);
    const claimedBy = await resolvers.Task.claimedBy({ claimedById: null } as any);
    const reviewer = await resolvers.Task.reviewer({ reviewerId: null } as any);
    const createdBy = await resolvers.Task.createdBy({ createdById: null } as any);
    const lead = await resolvers.Pod.lead({ leadAgentId: null } as any);
    const fromAgent = await resolvers.Transaction.fromAgent({ fromAgentId: null } as any);
    const toAgent = await resolvers.Transaction.toAgent({ toAgentId: null } as any);
    const task = await resolvers.Transaction.task({ taskId: null } as any);
    const reviewedBy = await resolvers.EmergenceEvent.reviewedBy({ reviewedById: null } as any);

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
});
