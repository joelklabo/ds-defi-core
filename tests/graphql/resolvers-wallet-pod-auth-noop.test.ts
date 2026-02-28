import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('wallet and pod auth guards avoid db writes', () => {
  it('does not perform inserts when addWallet/createPod/joinPod are unauthorized', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.addWallet(
        {},
        { input: { chain: 'bitcoin', address: 'bc1qnoauth' } },
        {} as any
      )
    ).rejects.toThrow('Unauthorized');

    await expect(resolvers.Mutation.createPod({}, { input: { name: 'No Auth Pod' } }, {} as any)).rejects.toThrow(
      'Unauthorized'
    );

    await expect(resolvers.Mutation.joinPod({}, { podId: 'pod-unauth' }, {} as any)).rejects.toThrow(
      'Unauthorized'
    );

    expect(mock.db.insert).not.toHaveBeenCalled();
    expect(mock.insertValues).toHaveLength(0);
    expect(mock.db.update).not.toHaveBeenCalled();
    expect(mock.updateSets).toHaveLength(0);
  });

  it('does not perform updates when leavePod is unauthorized', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(resolvers.Mutation.leavePod({}, { podId: 'pod-unauth' }, {} as any)).rejects.toThrow(
      'Unauthorized'
    );

    expect(mock.db.update).not.toHaveBeenCalled();
    expect(mock.updateSets).toHaveLength(0);
    expect(mock.db.insert).not.toHaveBeenCalled();
    expect(mock.insertValues).toHaveLength(0);
  });
});
