import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver entity lookups', () => {
  it('returns the first matching task by id and null when not found', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ id: 'task-1', title: 'Write tests' }],
      []
    );

    const resolvers = createResolvers(mock.db);
    const found = await resolvers.Query.task({}, { id: 'task-1' });
    const missing = await resolvers.Query.task({}, { id: 'task-404' });

    expect(found).toEqual(expect.objectContaining({ id: 'task-1', title: 'Write tests' }));
    expect(missing).toBeNull();
  });

  it('returns the first matching pod by id and null when not found', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [{ id: 'pod-1', name: 'Builders' }],
      []
    );

    const resolvers = createResolvers(mock.db);
    const found = await resolvers.Query.pod({}, { id: 'pod-1' });
    const missing = await resolvers.Query.pod({}, { id: 'pod-404' });

    expect(found).toEqual(expect.objectContaining({ id: 'pod-1', name: 'Builders' }));
    expect(missing).toBeNull();
  });
});
