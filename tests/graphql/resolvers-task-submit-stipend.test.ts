import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('task submit and stipend distribution', () => {
  it('submits an owned task and sets status to SUBMITTED', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'task-1',
        status: 'SUBMITTED',
        claimedById: 'agent-1',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.submitTask(
      {},
      { taskId: 'task-1', evidence: { txid: 'abc' } },
      { agentId: 'agent-1' } as any
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'task-1',
        status: 'SUBMITTED',
      })
    );
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        status: 'SUBMITTED',
      })
    );
  });

  it('creates stipend transactions only for sovereign agents with positive stipend', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'agent-eligible',
        isSovereign: true,
        isActive: true,
        currentStipend: '50',
      },
      {
        id: 'agent-zero',
        isSovereign: true,
        isActive: true,
        currentStipend: '0',
      },
      {
        id: 'agent-null',
        isSovereign: true,
        isActive: true,
        currentStipend: null,
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const distributed = await resolvers.Mutation.distributeStipends();

    expect(distributed).toBe(1);
    expect(mock.insertValues).toHaveLength(1);
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        toAgentId: 'agent-eligible',
        amount: '50',
        token: 'SATS',
        transactionType: 'STIPEND',
        status: 'PENDING',
      })
    );
  });
});
