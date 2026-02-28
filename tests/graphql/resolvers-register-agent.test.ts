import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('agent registration flow', () => {
  it('registers a new agent and appends an audit log entry', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'agent-1',
        displayName: 'Max',
        agentType: 'WORKER',
      },
    ]);

    const resolvers = createResolvers(mock.db);

    const created = await resolvers.Mutation.registerAgent(
      {},
      {
        input: {
          displayName: 'Max',
          agentType: 'WORKER',
          capabilities: ['run'],
        },
      }
    );

    expect(created).toEqual({
      id: 'agent-1',
      displayName: 'Max',
      agentType: 'WORKER',
    });

    expect(mock.insertValues).toHaveLength(2);
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        displayName: 'Max',
        agentType: 'WORKER',
        level: 'L0_CANDIDATE',
      })
    );
    expect(mock.insertValues[1]).toEqual(
      expect.objectContaining({
        actorAgentId: 'agent-1',
        action: 'AGENT_REGISTERED',
        resourceType: 'agent',
        resourceId: 'agent-1',
      })
    );
  });
});
