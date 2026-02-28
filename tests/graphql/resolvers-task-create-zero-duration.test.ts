import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('createTask mutation zero-duration boundary', () => {
  it('preserves estimatedDurationMinutes when set to 0', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'task-zero-duration',
        title: 'Zero duration task',
        estimatedDurationMinutes: 0,
        requiredLevel: 'L1_WORKER',
        bountyToken: 'SATS',
        status: 'AVAILABLE',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const created = await resolvers.Mutation.createTask(
      {},
      {
        input: {
          title: 'Zero duration task',
          description: 'Keep zero minute value instead of dropping it',
          domain: 'DEVELOPMENT',
          estimatedDurationMinutes: 0,
          bountyAmount: '300',
        },
      },
      { agentId: 'agent-zero-duration' } as any
    );

    expect(created).toEqual(
      expect.objectContaining({
        id: 'task-zero-duration',
        estimatedDurationMinutes: 0,
        requiredLevel: 'L1_WORKER',
        bountyToken: 'SATS',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        title: 'Zero duration task',
        estimatedDurationMinutes: 0,
        bountyAmount: '300',
        createdById: 'agent-zero-duration',
        requiredLevel: 'L1_WORKER',
        bountyToken: 'SATS',
      })
    );
  });
});
