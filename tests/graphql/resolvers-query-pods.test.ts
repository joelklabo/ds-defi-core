import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver pods listing', () => {
  it('returns domain-filtered pods when domain is provided and active pods otherwise', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ id: 'pod-ai', name: 'AI Builders', domain: 'AI' }],
      [{ id: 'pod-active', name: 'Generalists', isActive: true }]
    );

    const resolvers = createResolvers(mock.db);

    const domainPods = await resolvers.Query.pods({}, { domain: 'AI' });
    const activePods = await resolvers.Query.pods({}, {});

    expect(domainPods).toEqual([
      expect.objectContaining({ id: 'pod-ai', domain: 'AI' }),
    ]);
    expect(activePods).toEqual([
      expect.objectContaining({ id: 'pod-active', isActive: true }),
    ]);
  });
});
