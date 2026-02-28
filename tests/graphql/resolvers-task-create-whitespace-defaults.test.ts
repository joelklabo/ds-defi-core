import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('createTask mutation whitespace defaults', () => {
  it('keeps whitespace-only requiredLevel and bountyToken instead of defaulting', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'task-whitespace-defaults',
        title: 'Whitespace defaults task',
        requiredLevel: '   ',
        bountyToken: '   ',
        status: 'AVAILABLE',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const created = await resolvers.Mutation.createTask(
      {},
      {
        input: {
          title: 'Whitespace defaults task',
          description: 'Validate whitespace truthy behavior',
          domain: 'DEVELOPMENT',
          requiredLevel: '   ',
          bountyAmount: '250',
          bountyToken: '   ',
        },
      },
      { agentId: 'agent-whitespace' } as any
    );

    expect(created).toEqual(
      expect.objectContaining({
        id: 'task-whitespace-defaults',
        requiredLevel: '   ',
        bountyToken: '   ',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        title: 'Whitespace defaults task',
        requiredLevel: '   ',
        bountyAmount: '250',
        bountyToken: '   ',
        createdById: 'agent-whitespace',
        status: 'AVAILABLE',
      })
    );
  });
});
