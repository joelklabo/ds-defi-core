import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('type resolver relation behavior', () => {
  it('returns null for optional relations when foreign keys are missing', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    expect(await resolvers.Agent.manager({} as any)).toBeNull();
    expect(await resolvers.Task.claimedBy({} as any)).toBeNull();
    expect(await resolvers.Task.reviewer({} as any)).toBeNull();
    expect(await resolvers.Task.createdBy({} as any)).toBeNull();
    expect(await resolvers.Pod.lead({} as any)).toBeNull();
    expect(await resolvers.Transaction.fromAgent({} as any)).toBeNull();
    expect(await resolvers.Transaction.toAgent({} as any)).toBeNull();
    expect(await resolvers.Transaction.task({} as any)).toBeNull();
    expect(await resolvers.EmergenceEvent.reviewedBy({} as any)).toBeNull();

    expect(mock.db.select).not.toHaveBeenCalled();
  });

  it('resolves agent relation chains from the database', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ id: 'agent-manager', displayName: 'Lead' }],
      [{ id: 'wallet-1', chain: 'bitcoin' }],
      [{ id: 'event-1', eventType: 'BREAKTHROUGH' }],
      [{ id: 'task-claimed', status: 'CLAIMED' }],
      [{ id: 'task-completed', status: 'COMPLETED' }],
      [{ id: 'tx-1', transactionType: 'ZAP' }]
    );

    const resolvers = createResolvers(mock.db);

    const manager = await resolvers.Agent.manager({ managerAgentId: 'agent-manager' } as any);
    const wallets = await resolvers.Agent.wallets({ id: 'agent-1' } as any);
    const emergenceEvents = await resolvers.Agent.emergenceEvents({ id: 'agent-1' } as any);
    const claimedTasks = await resolvers.Agent.claimedTasks({ id: 'agent-1' } as any);
    const completedTasks = await resolvers.Agent.completedTasks({ id: 'agent-1' } as any);
    const transactions = await resolvers.Agent.transactions({ id: 'agent-1' } as any);

    expect(manager).toEqual({ id: 'agent-manager', displayName: 'Lead' });
    expect(wallets).toEqual([{ id: 'wallet-1', chain: 'bitcoin' }]);
    expect(emergenceEvents).toEqual([{ id: 'event-1', eventType: 'BREAKTHROUGH' }]);
    expect(claimedTasks).toEqual([{ id: 'task-claimed', status: 'CLAIMED' }]);
    expect(completedTasks).toEqual([{ id: 'task-completed', status: 'COMPLETED' }]);
    expect(transactions).toEqual([{ id: 'tx-1', transactionType: 'ZAP' }]);
  });

  it('resolves task, pod, and pod-member linked records', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ id: 'agent-claimed' }],
      [{ id: 'agent-reviewer' }],
      [{ id: 'agent-creator' }],
      [{ id: 'pod-lead' }],
      [{ id: 'member-1', podId: 'pod-1' }],
      [{ id: 'agent-member' }],
      [{ id: 'pod-1', name: 'Builders' }]
    );

    const resolvers = createResolvers(mock.db);

    const claimedBy = await resolvers.Task.claimedBy({ claimedById: 'agent-claimed' } as any);
    const reviewer = await resolvers.Task.reviewer({ reviewerId: 'agent-reviewer' } as any);
    const createdBy = await resolvers.Task.createdBy({ createdById: 'agent-creator' } as any);
    const lead = await resolvers.Pod.lead({ leadAgentId: 'pod-lead' } as any);
    const members = await resolvers.Pod.members({ id: 'pod-1' } as any);
    const memberAgent = await resolvers.PodMember.agent({ agentId: 'agent-member' } as any);
    const memberPod = await resolvers.PodMember.pod({ podId: 'pod-1' } as any);

    expect(claimedBy).toEqual({ id: 'agent-claimed' });
    expect(reviewer).toEqual({ id: 'agent-reviewer' });
    expect(createdBy).toEqual({ id: 'agent-creator' });
    expect(lead).toEqual({ id: 'pod-lead' });
    expect(members).toEqual([{ id: 'member-1', podId: 'pod-1' }]);
    expect(memberAgent).toEqual({ id: 'agent-member' });
    expect(memberPod).toEqual({ id: 'pod-1', name: 'Builders' });
  });

  it('resolves transaction and emergence event relations', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ id: 'agent-from' }],
      [{ id: 'agent-to' }],
      [{ id: 'task-1', status: 'SUBMITTED' }],
      [{ id: 'agent-subject' }],
      [{ id: 'agent-reviewer' }]
    );

    const resolvers = createResolvers(mock.db);

    const fromAgent = await resolvers.Transaction.fromAgent({ fromAgentId: 'agent-from' } as any);
    const toAgent = await resolvers.Transaction.toAgent({ toAgentId: 'agent-to' } as any);
    const task = await resolvers.Transaction.task({ taskId: 'task-1' } as any);
    const subjectAgent = await resolvers.EmergenceEvent.agent({ agentId: 'agent-subject' } as any);
    const reviewedBy = await resolvers.EmergenceEvent.reviewedBy({
      reviewedById: 'agent-reviewer',
    } as any);

    expect(fromAgent).toEqual({ id: 'agent-from' });
    expect(toAgent).toEqual({ id: 'agent-to' });
    expect(task).toEqual({ id: 'task-1', status: 'SUBMITTED' });
    expect(subjectAgent).toEqual({ id: 'agent-subject' });
    expect(reviewedBy).toEqual({ id: 'agent-reviewer' });
  });
});
