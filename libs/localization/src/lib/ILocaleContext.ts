// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum Language {
  En = "en",
  Es = "es",
  Cs = "cs",
  De = "de",
  Fr = "fr",
  Id = "id",
  It = "it",
  Ja = "ja",
  Ko = "ko",
  PtBR = "pt-BR",
  Ru = "ru",
  ZhHans = "zh-Hans",
  ZhHant = "zh-Hant",
  Nl = "nl",
  Hu = "hu",
  PtPT = "pt-PT",
  Pl = "pl",
  Sv = "sv",
  Tr = "tr",
  QpsPloc = "qps-ploc"
}

export enum RegionalFormat {
  EnEN = "en",
  EnAU = "en-au",
  EnCA = "en-ca",
  EnIE = "en-ie",
  EnNZ = "en-nz",
  EnSG = "en-SG",
  EnGB = "en-gb",
  EsES = "es",
  EsUS = "es-us",
  EsDO = "es-do",
  DeDE = "de",
  DeAT = "de-at",
  DeCH = "de-ch",
  CsCS = "cs",
  FrFR = "fr",
  FrCA = "fr-ca",
  FrCH = "fr-ch",
  IdID = "id",
  ItIT = "it",
  ItCH = "it-ch",
  JaJA = "ja",
  KoKO = "ko",
  PtBR = "pt-br",
  PtPT = "pt",
  RuRU = "ru",
  HuHU = "hu",
  NlNL = "nl",
  NlBE = "nl-be",
  PlPL = "pl",
  SvSV = "sv",
  TrTR = "tr",
  ZhHans = "zh-Hans",
  ZhHant = "zh-Hant"
}

function mapLanguage(key: string): string {
  switch (key) {
    case "zh-CN":
      return "zh-Hans";
    case "zh-cn":
      return "zh-Hans";
    case "zh-TW":
      return "zh-Hant";
    case "zh-tw":
      return "zh-Hant";
    default:
      return key;
  }
}

function getBrowserLocale(): string {
  const defaultLang = "en";
  // tslint:disable-next-line: no-typeof-undefined strict-type-predicates
  const nav = typeof window !== "undefined" ? navigator : undefined;
  if (nav) {
    if (nav.language) {
      return nav.language;
    }
    if (nav.languages && nav.languages[0]) {
      return nav.languages[0];
    }
  }
  return defaultLang;
}

export function getDefaultLocale(): Language {
  const browserLoc = mapLanguage(getBrowserLocale());
  const locKey: string =
    browserLoc.charAt(0).toUpperCase() + browserLoc.slice(1).replace("-", "");
  const loc = Language[locKey];
  if (loc) {
    return loc;
  }

  // if we don't have exact locale, try to match the language only
  const idx = browserLoc.indexOf("-");
  const lang = idx >= 0 ? browserLoc.slice(0, Math.max(0, idx)) : browserLoc;
  const langKey = lang.charAt(0).toUpperCase() + lang.slice(1);
  const bestMatchingLoc = Object.keys(Language).find((value: string) =>
    value.startsWith(langKey)
  );
  if (bestMatchingLoc) {
    return Language[bestMatchingLoc];
  }
  // fallback to en
  return Language.En;
}

export function getDefaultRegion(): RegionalFormat {
  const browserLoc = mapLanguage(getBrowserLocale());
  const regionKey: string =
    browserLoc.charAt(0).toUpperCase() + browserLoc.slice(1).replace("-", "");
  const region = RegionalFormat[regionKey];
  if (region) {
    return region;
  }

  // if we don't have exact region, try to match to basic region
  const idx = browserLoc.indexOf("-");
  const reg = idx >= 0 ? browserLoc.slice(0, Math.max(0, idx)) : browserLoc;
  const regKey = reg.charAt(0).toUpperCase() + reg.slice(1);
  const regKeyMatch = regKey + regKey.toUpperCase();
  const bestMatchingRegion = Object.keys(RegionalFormat).find((value: string) =>
    value.startsWith(regKeyMatch)
  );
  if (bestMatchingRegion) {
    return RegionalFormat[bestMatchingRegion];
  }
  // fallback to en
  return RegionalFormat.EnEN;
}

export interface ILocaleContext {
  readonly language: Language;
  readonly regionalFormat: RegionalFormat;
  changeLocale(newLocale: Language, newRegion: RegionalFormat): Promise<void>;
  ensureConfigsLoaded(): Promise<void>;
}

// tslint:disable-next-line:no-any
export type ILocStrings = any;
export type ILocFileConfig = {
  readonly [key in Language]: () => Promise<ILocStrings>;
};

export interface ILocConfig {
  // loadLocale(locale: Language, expContext?: IExpContext): Promise<void>;
  loadLocale(locale: Language): Promise<void>;
}

export const defaultLocaleContext: ILocaleContext = {
  changeLocale: async () => {
    return;
  },
  ensureConfigsLoaded: async () => {
    // no-op
  },
  language: getDefaultLocale(),
  regionalFormat: getDefaultRegion()
};
