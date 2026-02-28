import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('updateAgent mutation', () => {
  it('rejects updates when caller does not own the target agent', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.updateAgent(
        {},
        {
          id: 'agent-target',
          input: {
            displayName: 'New Name',
          },
        },
        { agentId: 'agent-other' } as any
      )
    ).rejects.toThrow('Unauthorized: Cannot update another agent');

    expect(mock.updateSets).toHaveLength(0);
  });

  it('updates allowed fields and stamps updatedAt for the caller', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([
      {
        id: 'agent-self',
        displayName: 'Max Prime',
        preferences: { timezone: 'UTC' },
        capabilities: ['discover', 'execute'],
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.updateAgent(
      {},
      {
        id: 'agent-self',
        input: {
          displayName: 'Max Prime',
          preferences: { timezone: 'UTC' },
          capabilities: ['discover', 'execute'],
        },
      },
      { agentId: 'agent-self' } as any
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'agent-self',
        displayName: 'Max Prime',
      })
    );
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        displayName: 'Max Prime',
        preferences: { timezone: 'UTC' },
        capabilities: ['discover', 'execute'],
        updatedAt: expect.any(Date),
      })
    );
  });

  it('returns undefined when no matching agent row exists', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Mutation.updateAgent(
      {},
      {
        id: 'missing-agent',
        input: {
          displayName: 'Ghost',
        },
      },
      { agentId: 'missing-agent' } as any
    );

    expect(result).toBeUndefined();
    expect(mock.updateSets[0]).toEqual(
      expect.objectContaining({
        displayName: 'Ghost',
        updatedAt: expect.any(Date),
      })
    );
  });
});
