/**
 * Minimal in-memory mock of the supabase-js client surface used by the
 * SPEC cron modules. Implements just enough of the fluent query
 * builder for the queries we issue: select / insert / update / eq /
 * neq / in / lt / gt / not / is / or / order / limit / maybeSingle.
 *
 * Tests construct rows per table, then drive the cron task and assert
 * the resulting writes via .recordedInserts / .recordedUpdates.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SupabaseClient } from '@supabase/supabase-js';

export type Row = Record<string, any>;

export interface InsertRecord {
  table: string;
  rows: Row[];
}

export interface UpdateRecord {
  table: string;
  patch: Row;
  filters: Filter[];
}

interface Filter {
  kind: 'eq' | 'neq' | 'in' | 'lt' | 'gt' | 'not' | 'is' | 'or';
  column?: string;
  value?: any;
  raw?: string;
}

export interface FakeOptions {
  /** Per-table mutation hooks. Used to throw to simulate DB errors. */
  failureHooks?: Partial<Record<string, (op: 'insert' | 'update' | 'select') => Error | null>>;
}

export interface FakeClient extends SupabaseClient {
  recordedInserts: InsertRecord[];
  recordedUpdates: UpdateRecord[];
  rows: Record<string, Row[]>;
}

export function makeFakeSupabase(
  initialRows: Record<string, Row[]>,
  opts: FakeOptions = {},
): FakeClient {
  const rows: Record<string, Row[]> = JSON.parse(JSON.stringify(initialRows));
  const recordedInserts: InsertRecord[] = [];
  const recordedUpdates: UpdateRecord[] = [];

  function from(table: string) {
    return new QueryBuilder(table, rows, recordedInserts, recordedUpdates, opts);
  }

  const client = { from, recordedInserts, recordedUpdates, rows } as unknown as FakeClient;
  return client;
}

class QueryBuilder {
  private filters: Filter[] = [];
  private selectCols: string | null = null;
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitVal: number | null = null;
  private mode: 'select' | 'insert' | 'update' | null = null;
  private pendingPatch: Row | null = null;
  private pendingInsertRows: Row[] | null = null;
  private finalizeMode: 'maybeSingle' | 'single' | null = null;

  constructor(
    public table: string,
    private rowsByTable: Record<string, Row[]>,
    private recordedInserts: InsertRecord[],
    private recordedUpdates: UpdateRecord[],
    private opts: FakeOptions,
  ) {}

  select(cols: string): this {
    this.mode = this.mode ?? 'select';
    this.selectCols = cols;
    return this;
  }
  eq(column: string, value: any): this {
    this.filters.push({ kind: 'eq', column, value });
    return this;
  }
  neq(column: string, value: any): this {
    this.filters.push({ kind: 'neq', column, value });
    return this;
  }
  in(column: string, value: any[]): this {
    this.filters.push({ kind: 'in', column, value });
    return this;
  }
  lt(column: string, value: any): this {
    this.filters.push({ kind: 'lt', column, value });
    return this;
  }
  gt(column: string, value: any): this {
    this.filters.push({ kind: 'gt', column, value });
    return this;
  }
  not(column: string, op: string, value: any): this {
    this.filters.push({ kind: 'not', column, value: { op, value } });
    return this;
  }
  is(column: string, value: any): this {
    this.filters.push({ kind: 'is', column, value });
    return this;
  }
  or(raw: string): this {
    this.filters.push({ kind: 'or', raw });
    return this;
  }
  order(column: string, opts: { ascending: boolean }): this {
    this.orderBy = { column, ascending: opts.ascending };
    return this;
  }
  limit(n: number): this {
    this.limitVal = n;
    return this;
  }
  insert(rowsOrRow: Row | Row[]): this {
    this.mode = 'insert';
    this.pendingInsertRows = Array.isArray(rowsOrRow) ? rowsOrRow : [rowsOrRow];
    return this;
  }
  update(patch: Row): this {
    this.mode = 'update';
    this.pendingPatch = patch;
    return this;
  }

  maybeSingle() {
    this.finalizeMode = 'maybeSingle';
    return this.execute();
  }
  single() {
    this.finalizeMode = 'single';
    return this.execute();
  }

  // Awaiting the builder runs the query / mutation.
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<{ data: any; error: any }> {
    const hook = this.opts.failureHooks?.[this.table];
    const op =
      this.mode === 'insert'
        ? 'insert'
        : this.mode === 'update'
          ? 'update'
          : 'select';
    const hookErr = hook ? hook(op) : null;
    if (hookErr) {
      return { data: null, error: { message: hookErr.message } };
    }

    const table = this.rowsByTable[this.table] ?? (this.rowsByTable[this.table] = []);

    if (this.mode === 'insert' && this.pendingInsertRows) {
      const inserted = this.pendingInsertRows.map((r) => ({
        id: r.id ?? cryptoRandomId(),
        ...r,
      }));
      table.push(...inserted);
      this.recordedInserts.push({ table: this.table, rows: inserted });
      // Insert with .select() returns the inserted rows; otherwise null data.
      if (this.selectCols) {
        if (this.finalizeMode === 'maybeSingle' || this.finalizeMode === 'single') {
          return { data: inserted[0] ?? null, error: null };
        }
        return { data: inserted, error: null };
      }
      return { data: null, error: null };
    }

    if (this.mode === 'update' && this.pendingPatch) {
      const matching = table.filter((row) => matchesAll(row, this.filters));
      for (const row of matching) {
        Object.assign(row, this.pendingPatch);
      }
      this.recordedUpdates.push({ table: this.table, patch: this.pendingPatch, filters: this.filters });
      if (this.selectCols) {
        if (this.finalizeMode === 'maybeSingle' || this.finalizeMode === 'single') {
          return { data: matching[0] ?? null, error: null };
        }
        return { data: matching, error: null };
      }
      return { data: null, error: null };
    }

    // select
    let rows = table.filter((row) => matchesAll(row, this.filters));
    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      rows = [...rows].sort((a, b) => {
        if (a[column] === b[column]) return 0;
        return (a[column] < b[column] ? -1 : 1) * (ascending ? 1 : -1);
      });
    }
    if (this.limitVal !== null) {
      rows = rows.slice(0, this.limitVal);
    }

    if (this.finalizeMode === 'maybeSingle') {
      return { data: rows[0] ?? null, error: null };
    }
    if (this.finalizeMode === 'single') {
      if (rows.length !== 1) {
        return { data: null, error: { message: 'expected single row' } };
      }
      return { data: rows[0], error: null };
    }
    return { data: rows, error: null };
  }
}

function matchesAll(row: Row, filters: Filter[]): boolean {
  for (const f of filters) {
    if (!matches(row, f)) return false;
  }
  return true;
}

function matches(row: Row, f: Filter): boolean {
  switch (f.kind) {
    case 'eq':
      return row[f.column!] === f.value;
    case 'neq':
      return row[f.column!] !== f.value;
    case 'in':
      return (f.value as any[]).includes(row[f.column!]);
    case 'lt':
      return row[f.column!] !== null && row[f.column!] !== undefined && row[f.column!] < f.value;
    case 'gt':
      return row[f.column!] !== null && row[f.column!] !== undefined && row[f.column!] > f.value;
    case 'not': {
      const { op, value } = f.value as { op: string; value: any };
      if (op === 'is' && value === null) {
        return row[f.column!] !== null && row[f.column!] !== undefined;
      }
      return row[f.column!] !== value;
    }
    case 'is':
      if (f.value === null) {
        return row[f.column!] === null || row[f.column!] === undefined;
      }
      return row[f.column!] === f.value;
    case 'or': {
      // Minimal `or` parser for the two forms we use:
      //   last_attempt_at.is.null,last_attempt_at.lt.<iso>
      // We just check each comma-separated clause.
      const clauses = f.raw!.split(',');
      for (const clause of clauses) {
        const [col, op, val] = clause.split('.');
        if (op === 'is' && val === 'null') {
          if (row[col] === null || row[col] === undefined) return true;
        } else if (op === 'lt') {
          if (row[col] !== null && row[col] !== undefined && row[col] < val) return true;
        } else if (op === 'eq') {
          if (row[col] === val) return true;
        }
      }
      return false;
    }
  }
}

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
