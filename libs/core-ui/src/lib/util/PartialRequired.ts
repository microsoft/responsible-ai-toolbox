export type PartialRequired<T, K extends keyof T> = Omit<T, K> &
  { [P in K]-?: T[K] };
export type PartialRequired2<
  T,
  K extends keyof T,
  L extends keyof Pick<T, K>[K]
> = Omit<T, K> &
  {
    [P in K]: PartialRequired<T[P], L>;
  };
