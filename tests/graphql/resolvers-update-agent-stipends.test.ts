import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('agent profile and stipend mutations', () => {
  it('updates own agent profile and stamps updatedAt', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'agent-1',
        displayName: 'Max Prime',
        capabilities: ['ship-prs'],
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const updated = await resolvers.Mutation.updateAgent(
      {},
      {
        id: 'agent-1',
        input: { displayName: 'Max Prime', capabilities: ['ship-prs'] },
      },
      { agentId: 'agent-1' } as any
    );

    expect(updated).toEqual(
      expect.objectContaining({
        id: 'agent-1',
        displayName: 'Max Prime',
      })
    );
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        displayName: 'Max Prime',
        capabilities: ['ship-prs'],
        updatedAt: expect.any(Date),
      })
    );
  });

  it('distributes stipends only for agents with positive currentStipend', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      { id: 'agent-1', currentStipend: '150' },
      { id: 'agent-2', currentStipend: '0' },
      { id: 'agent-3', currentStipend: null },
      { id: 'agent-4', currentStipend: '25.5' },
    ]);

    const resolvers = createResolvers(mock.db);
    const count = await resolvers.Mutation.distributeStipends({}, {}, {} as any);

    expect(count).toBe(2);
    expect(mock.insertValues).toHaveLength(2);
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        toAgentId: 'agent-1',
        amount: '150',
        token: 'SATS',
        transactionType: 'STIPEND',
        status: 'PENDING',
      })
    );
    expect(mock.insertValues[1]).toEqual(
      expect.objectContaining({
        toAgentId: 'agent-4',
        amount: '25.5',
        token: 'SATS',
        transactionType: 'STIPEND',
        status: 'PENDING',
      })
    );
  });

  it('returns zero distributed stipends when no agents are returned', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([]);

    const resolvers = createResolvers(mock.db);
    const count = await resolvers.Mutation.distributeStipends({}, {}, {} as any);

    expect(count).toBe(0);
    expect(mock.insertValues).toHaveLength(0);
  });
});
