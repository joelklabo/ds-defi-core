import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('type resolver optional relation zero-string id edge cases', () => {
  it("treats '0' optional ids as present and performs lookups", async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ id: 'manager-0' }],
      [{ id: 'claimed-0' }],
      [{ id: 'reviewer-0' }],
      [{ id: 'creator-0' }],
      [{ id: 'lead-0' }],
      [{ id: 'from-0' }],
      [{ id: 'to-0' }],
      [{ id: 'task-0' }],
      [{ id: 'reviewed-by-0' }]
    );

    const resolvers = createResolvers(mock.db);

    const manager = await resolvers.Agent.manager({ managerAgentId: '0' } as any);
    const claimedBy = await resolvers.Task.claimedBy({ claimedById: '0' } as any);
    const reviewer = await resolvers.Task.reviewer({ reviewerId: '0' } as any);
    const createdBy = await resolvers.Task.createdBy({ createdById: '0' } as any);
    const lead = await resolvers.Pod.lead({ leadAgentId: '0' } as any);
    const fromAgent = await resolvers.Transaction.fromAgent({ fromAgentId: '0' } as any);
    const toAgent = await resolvers.Transaction.toAgent({ toAgentId: '0' } as any);
    const task = await resolvers.Transaction.task({ taskId: '0' } as any);
    const reviewedBy = await resolvers.EmergenceEvent.reviewedBy({ reviewedById: '0' } as any);

    expect(manager).toEqual({ id: 'manager-0' });
    expect(claimedBy).toEqual({ id: 'claimed-0' });
    expect(reviewer).toEqual({ id: 'reviewer-0' });
    expect(createdBy).toEqual({ id: 'creator-0' });
    expect(lead).toEqual({ id: 'lead-0' });
    expect(fromAgent).toEqual({ id: 'from-0' });
    expect(toAgent).toEqual({ id: 'to-0' });
    expect(task).toEqual({ id: 'task-0' });
    expect(reviewedBy).toEqual({ id: 'reviewed-by-0' });
    expect(mock.db.select).toHaveBeenCalledTimes(9);
  });
});
