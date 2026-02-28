import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('createTask mutation empty-string defaults', () => {
  it('falls back to default requiredLevel and bountyToken when empty strings are provided', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'task-empty-defaults',
        title: 'Edge defaults task',
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
          title: 'Edge defaults task',
          description: 'Validate empty-string defaults',
          domain: 'DEVELOPMENT',
          requiredLevel: '',
          bountyAmount: '250',
          bountyToken: '',
        },
      },
      { agentId: 'agent-edge' } as any
    );

    expect(created).toEqual(
      expect.objectContaining({
        id: 'task-empty-defaults',
        requiredLevel: 'L1_WORKER',
        bountyToken: 'SATS',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        title: 'Edge defaults task',
        requiredLevel: 'L1_WORKER',
        bountyAmount: '250',
        bountyToken: 'SATS',
        createdById: 'agent-edge',
        status: 'AVAILABLE',
      })
    );
  });
});
