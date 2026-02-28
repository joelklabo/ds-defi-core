import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('registerAgent defaults and optional fields', () => {
  it('applies default preferences and capabilities when optional fields are omitted', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'agent-defaults',
        displayName: 'Default Bot',
        agentType: 'WORKER',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const created = await resolvers.Mutation.registerAgent(
      {},
      {
        input: {
          displayName: 'Default Bot',
          agentType: 'WORKER',
        },
      }
    );

    expect(created).toEqual(
      expect.objectContaining({
        id: 'agent-defaults',
        displayName: 'Default Bot',
        agentType: 'WORKER',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        displayName: 'Default Bot',
        agentType: 'WORKER',
        preferences: {},
        capabilities: [],
        level: 'L0_CANDIDATE',
      })
    );
    expect(mock.insertValues[1]).toEqual(
      expect.objectContaining({
        actorAgentId: 'agent-defaults',
        action: 'AGENT_REGISTERED',
        resourceType: 'agent',
        resourceId: 'agent-defaults',
        afterState: expect.objectContaining({ id: 'agent-defaults' }),
      })
    );
  });

  it('persists provided publicKey, preferences, and capabilities', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'agent-custom',
        displayName: 'Custom Bot',
        agentType: 'HUMAN',
        publicKey: 'npub1custom',
        preferences: { timezone: 'UTC', theme: 'dark' },
        capabilities: ['ship', 'review'],
      },
    ]);

    const resolvers = createResolvers(mock.db);
    await resolvers.Mutation.registerAgent(
      {},
      {
        input: {
          displayName: 'Custom Bot',
          agentType: 'HUMAN',
          publicKey: 'npub1custom',
          preferences: { timezone: 'UTC', theme: 'dark' },
          capabilities: ['ship', 'review'],
        },
      }
    );

    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        displayName: 'Custom Bot',
        agentType: 'HUMAN',
        publicKey: 'npub1custom',
        preferences: { timezone: 'UTC', theme: 'dark' },
        capabilities: ['ship', 'review'],
      })
    );
  });
});
