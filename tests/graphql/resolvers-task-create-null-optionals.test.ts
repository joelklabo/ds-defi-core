import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('createTask null optional handling', () => {
  it('normalizes null optional fields to defaults', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'task-null-opts',
        title: 'Null optionals',
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
          title: 'Null optionals',
          description: 'Cover null fallback behavior',
          domain: 'DEVELOPMENT',
          requiredLevel: null,
          requiredCapabilities: null,
          bountyAmount: '250',
          bountyToken: null,
        } as any,
      },
      { agentId: 'agent-null-creator' } as any
    );

    expect(created).toEqual(
      expect.objectContaining({
        id: 'task-null-opts',
        requiredLevel: 'L1_WORKER',
        bountyToken: 'SATS',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        title: 'Null optionals',
        description: 'Cover null fallback behavior',
        domain: 'DEVELOPMENT',
        requiredLevel: 'L1_WORKER',
        requiredCapabilities: [],
        bountyAmount: '250',
        bountyToken: 'SATS',
        createdById: 'agent-null-creator',
        status: 'AVAILABLE',
      })
    );
  });
});
