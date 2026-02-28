import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('createTask mutation', () => {
  it('creates a task with default requiredLevel and bountyToken', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'task-1',
        title: 'Ship docs',
        status: 'AVAILABLE',
        requiredLevel: 'L1_WORKER',
        bountyToken: 'SATS',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const created = await resolvers.Mutation.createTask(
      {},
      {
        input: {
          title: 'Ship docs',
          description: 'Write guide',
          domain: 'DEVELOPMENT',
          bountyAmount: '500',
        },
      },
      { agentId: 'agent-creator' } as any
    );

    expect(created).toEqual(
      expect.objectContaining({
        id: 'task-1',
        status: 'AVAILABLE',
        requiredLevel: 'L1_WORKER',
        bountyToken: 'SATS',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        title: 'Ship docs',
        description: 'Write guide',
        domain: 'DEVELOPMENT',
        requiredLevel: 'L1_WORKER',
        requiredCapabilities: [],
        bountyAmount: '500',
        bountyToken: 'SATS',
        createdById: 'agent-creator',
        status: 'AVAILABLE',
      })
    );
  });

  it('uses explicit requiredLevel, capabilities, and bountyToken when provided', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'task-2',
        title: 'Implement API',
        status: 'AVAILABLE',
        requiredLevel: 'L2_PROFESSIONAL',
        bountyToken: 'USDH',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const created = await resolvers.Mutation.createTask(
      {},
      {
        input: {
          title: 'Implement API',
          description: 'Build endpoint',
          domain: 'INFRASTRUCTURE',
          requiredLevel: 'L2_PROFESSIONAL',
          requiredCapabilities: ['graphql', 'testing'],
          estimatedDurationMinutes: 90,
          bountyAmount: '1200',
          bountyToken: 'USDH',
        },
      },
      { agentId: 'agent-creator' } as any
    );

    expect(created).toEqual(
      expect.objectContaining({
        id: 'task-2',
        requiredLevel: 'L2_PROFESSIONAL',
        bountyToken: 'USDH',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        requiredLevel: 'L2_PROFESSIONAL',
        requiredCapabilities: ['graphql', 'testing'],
        estimatedDurationMinutes: 90,
        bountyToken: 'USDH',
      })
    );
  });
});
