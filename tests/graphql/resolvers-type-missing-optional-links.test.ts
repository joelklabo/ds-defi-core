import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('type resolver missing optional linked rows', () => {
  it('returns undefined when optional relation ids are present but lookups return no rows', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([], [], [], [], [], []);

    const resolvers = createResolvers(mock.db);

    const manager = await resolvers.Agent.manager({ managerAgentId: 'agent-missing' } as any);
    const createdBy = await resolvers.Task.createdBy({ createdById: 'agent-missing' } as any);
    const lead = await resolvers.Pod.lead({ leadAgentId: 'agent-missing' } as any);
    const toAgent = await resolvers.Transaction.toAgent({ toAgentId: 'agent-missing' } as any);
    const task = await resolvers.Transaction.task({ taskId: 'task-missing' } as any);
    const reviewedBy = await resolvers.EmergenceEvent.reviewedBy(
      { reviewedById: 'agent-missing' } as any
    );

    expect(manager).toBeUndefined();
    expect(createdBy).toBeUndefined();
    expect(lead).toBeUndefined();
    expect(toAgent).toBeUndefined();
    expect(task).toBeUndefined();
    expect(reviewedBy).toBeUndefined();
    expect(mock.db.select).toHaveBeenCalledTimes(6);
  });
});
