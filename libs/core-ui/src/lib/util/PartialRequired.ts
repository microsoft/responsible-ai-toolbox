// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type PartialRequired<T, TK extends keyof T> = Omit<T, TK> &
  { [P in TK]-?: T[TK] };
export type PartialRequired2<
  T,
  TK extends keyof T,
  TK2 extends keyof Pick<T, TK>[TK]
> = Omit<T, TK> &
  {
    [P in TK]-?: PartialRequired<T[P], TK2>;
  };
