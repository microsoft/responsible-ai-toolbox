// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  default as LocalizedStringsClass,
  LocalizedStrings
} from "localized-strings";
import { mapValues, merge } from "lodash";

import { Language } from "./Language";

type NestedPartial<T> = {
  [P in keyof T]?: T[P] | NestedPartial<T[P]>;
};

export type ILocalizationConfig<T> = { en: T } & {
  readonly [key in Language]: NestedPartial<T>;
};

export type ILocalization<T> = Omit<LocalizedStrings<T>, "formatString"> & {
  formatString(
    str: string,
    ...values: Array<string | number | undefined>
  ): string;
};

export function getLocalization<T>(
  lang: ILocalizationConfig<T>
): ILocalization<T> {
  const localization = new LocalizedStringsClass(
    mapValues(lang, (v) => merge({}, lang.en, v))
  ) as ILocalization<T>;
  const originalFormat = localization.formatString.bind(localization);
  localization.formatString = (
    str: string,
    ...values: Array<string | number | undefined>
  ): string => {
    const par = [...values];
    for (let i = 0; i < par.length; i++) {
      if (par[i] === undefined) {
        // undefined will crash localization
        par[i] = "";
      }
    }
    return originalFormat(str, ...par);
  };
  return localization;
}
