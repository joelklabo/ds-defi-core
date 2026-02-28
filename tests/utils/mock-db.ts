import { vi } from 'vitest';

export function createDbMock() {
  const selectResponses: unknown[] = [];
  const insertResponses: unknown[] = [];
  const updateResponses: unknown[] = [];

  const insertValues: unknown[] = [];
  const updateSets: unknown[] = [];

  const db = {
    select: vi.fn(() => {
      const chain: Record<string, any> = {
        from: vi.fn(() => chain),
        where: vi.fn(() => Promise.resolve((selectResponses.shift() as any) ?? [])),
        limit: vi.fn(() => chain),
        offset: vi.fn(() => chain),
        orderBy: vi.fn(() => Promise.resolve((selectResponses.shift() as any) ?? [])),
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
