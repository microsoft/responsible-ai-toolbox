export const routeKey = [
  "application",
  "dataset",
  "theme",
  "language",
  "version"
] as const;
export type IAppSetting = {
  [key in typeof routeKey[number]]?: string;
};
