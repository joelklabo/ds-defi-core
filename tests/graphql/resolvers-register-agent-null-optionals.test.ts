import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('registerAgent null optional handling', () => {
  it('normalizes null preferences and capabilities to defaults', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'agent-null-opts',
        displayName: 'Null Bot',
        agentType: 'WORKER',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const created = await resolvers.Mutation.registerAgent(
      {},
      {
        input: {
          displayName: 'Null Bot',
          agentType: 'WORKER',
          preferences: null,
          capabilities: null,
        } as any,
      }
    );

    expect(created).toEqual(
      expect.objectContaining({
        id: 'agent-null-opts',
        displayName: 'Null Bot',
        agentType: 'WORKER',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        displayName: 'Null Bot',
        agentType: 'WORKER',
        preferences: {},
        capabilities: [],
        level: 'L0_CANDIDATE',
      })
    );
    expect(mock.insertValues[1]).toEqual(
      expect.objectContaining({
        actorAgentId: 'agent-null-opts',
        action: 'AGENT_REGISTERED',
        resourceType: 'agent',
        resourceId: 'agent-null-opts',
      })
    );
  });
});
