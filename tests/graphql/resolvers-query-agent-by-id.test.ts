import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('query resolver agent lookup', () => {
  it('returns the first matching agent by id and null when not found', async () => {
    const mock = createDbMock();
    mock.selectResponses.push(
      [
        { id: 'agent-1', displayName: 'Agent One' },
        { id: 'agent-1-shadow', displayName: 'Shadow Agent' },
      ],
      []
    );

    const resolvers = createResolvers(mock.db);
    const found = await resolvers.Query.agent({}, { id: 'agent-1' });
    const missing = await resolvers.Query.agent({}, { id: 'agent-404' });

    expect(found).toEqual(expect.objectContaining({ id: 'agent-1', displayName: 'Agent One' }));
    expect(missing).toBeNull();
  });

  it('builds a filtered select query for each lookup call', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([{ id: 'agent-a' }], [{ id: 'agent-b' }]);

    const resolvers = createResolvers(mock.db);
    await resolvers.Query.agent({}, { id: 'agent-a' });
    await resolvers.Query.agent({}, { id: 'agent-b' });

    const firstChain = mock.db.select.mock.results[0].value;
    const secondChain = mock.db.select.mock.results[1].value;

    expect(firstChain.from).toHaveBeenCalledTimes(1);
    expect(firstChain.where).toHaveBeenCalledWith(expect.anything());
    expect(secondChain.from).toHaveBeenCalledTimes(1);
    expect(secondChain.where).toHaveBeenCalledWith(expect.anything());
  });
});
