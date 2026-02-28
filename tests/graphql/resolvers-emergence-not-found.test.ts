import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('reviewEmergence missing-event handling', () => {
  it('throws a clear not-found error when the emergence event does not exist', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([]);

    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.reviewEmergence(
        {},
        {
          eventId: 'missing-event',
          input: { isVerified: true, reviewNotes: 'Looks valid', scoreImpact: 5 },
        },
        { agentId: 'reviewer-1' } as any
      )
    ).rejects.toThrow('Emergence event not found');

    expect(mock.updateSets).toHaveLength(1);
  });

  it('also throws not-found when scoreImpact is omitted', async () => {
    const mock = createDbMock();
    mock.updateResponses.push([]);

    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.reviewEmergence(
        {},
        {
          eventId: 'missing-event-2',
          input: { isVerified: false, reviewNotes: 'No record to review' },
        },
        { agentId: 'reviewer-2' } as any
      )
    ).rejects.toThrow('Emergence event not found');

    expect(mock.updateSets).toHaveLength(1);
  });
});
