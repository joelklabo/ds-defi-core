import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('task mutation auth guards', () => {
  it('rejects claimTask when caller is unauthenticated', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(resolvers.Mutation.claimTask({}, { taskId: 'task-1' }, {} as any)).rejects.toThrow(
      'Unauthorized'
    );
    expect(mock.db.select).not.toHaveBeenCalled();
  });

  it('rejects submitTask when caller is unauthenticated', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.submitTask({}, { taskId: 'task-1', evidence: { proof: 'x' } }, {} as any)
    ).rejects.toThrow('Unauthorized');
    expect(mock.db.update).not.toHaveBeenCalled();
  });

  it('rejects reviewTask when caller is unauthenticated', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.reviewTask(
        {},
        { taskId: 'task-1', input: { qualityScore: 8, approved: true } },
        {} as any
      )
    ).rejects.toThrow('Unauthorized');
    expect(mock.db.update).not.toHaveBeenCalled();
    expect(mock.db.insert).not.toHaveBeenCalled();
  });
});
