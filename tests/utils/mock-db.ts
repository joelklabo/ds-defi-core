import { vi } from 'vitest';

export function createDbMock() {
  const selectResponses: unknown[] = [];
  const insertResponses: unknown[] = [];
  const updateResponses: unknown[] = [];

  const insertValues: unknown[] = [];
  const updateSets: unknown[] = [];

  const db = {
    select: vi.fn(() => {
      let consumed = false;
      let result: unknown[] = [];
      const resolveResult = () => {
        if (!consumed) {
          consumed = true;
          result = (selectResponses.shift() as any) ?? [];
        }
        return Promise.resolve(result as any);
      };

      const chain: Record<string, any> = {
        from: vi.fn(() => chain),
        where: vi.fn(() => chain),
        limit: vi.fn(() => chain),
        offset: vi.fn(() => chain),
        orderBy: vi.fn(() => chain),
        then: (onFulfilled: (value: unknown[]) => unknown, onRejected?: (reason: any) => unknown) =>
          resolveResult().then(onFulfilled, onRejected),
        catch: (onRejected: (reason: any) => unknown) => resolveResult().catch(onRejected),
        finally: (onFinally: () => void) => resolveResult().finally(onFinally),
      };
      return chain;
    }),

    insert: vi.fn(() => {
      return {
        values: vi.fn((value: unknown) => {
          insertValues.push(value);
          return {
            returning: vi.fn(() => Promise.resolve((insertResponses.shift() as any) ?? [])),
          };
        }),
      };
    }),

    update: vi.fn(() => {
      return {
        set: vi.fn((value: unknown) => {
          updateSets.push(value);
          return {
            where: vi.fn(() => ({
              returning: vi.fn(() => Promise.resolve((updateResponses.shift() as any) ?? [])),
            })),
          };
        }),
      };
    }),
  };

  return {
    db: db as any,
    selectResponses,
    insertResponses,
    updateResponses,
    insertValues,
    updateSets,
  };
}
