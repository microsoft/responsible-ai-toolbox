import {
  default as LocalizedStringsClass,
  LocalizedStrings
} from "localized-strings";

export enum Language {
  En = "en",
  Es = "es",
  Cs = "cs",
  De = "de",
  Fr = "fr",
  It = "it",
  Ja = "ja",
  Ko = "ko",
  PtBR = "pt-BR",
  Ru = "ru",
  ZhHans = "zh-CN",
  ZhHant = "zh-TW",
  Nl = "nl",
  Hu = "hu",
  PtPT = "pt-PT",
  Pl = "pl",
  Sv = "sv",
  Tr = "tr"
}

export type ILocalizationConfig<T> = { en: T } & {
  readonly [key in Language]: any;
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
  const localization = new LocalizedStringsClass({
    en: lang.en,
    cs: lang.cs,
    de: lang.de,
    es: lang.es,
    fr: lang.fr,
    hu: lang.hu,
    it: lang.it,
    ja: lang.ja,
    ko: lang.ko,
    nl: lang.nl,
    pl: lang.pl,
    "pt-BR": lang["pt-BR"],
    "pt-PT": lang["pt-PT"],
    ru: lang.ru,
    sv: lang.sv,
    tr: lang.tr,
    "zh-CN": lang["zh-CN"],
    "zh-TW": lang["zh-TW"]
  });
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
