// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getLocalization } from './getLocalization';
import { Language } from './Language';

export const localization = getLocalization({
  [Language.En]: import("./en.json"),
  [Language.Es]: () => import("./es.json"),
  [Language.Cs]: () => import("./cs.json"),
  [Language.De]: () => import("./de.json"),
  [Language.Fr]: () => import("./fr.json"),
  [Language.It]: () => import("./it.json"),
  [Language.Ja]: () => import("./ja.json"),
  [Language.Ko]: () => import("./ko.json"),
  [Language.PtBR]: () => import("./pt-BR.json"),
  [Language.Ru]: () => import("./ru.json"),
  [Language.ZhHans]: () => import("./zh-Hans.json"),
  [Language.ZhHant]: () => import("./zh-Hant.json"),
  [Language.Nl]: () => import("./nl.json"),
  [Language.Hu]: () => import("./hu.json"),
  [Language.PtPT]: () => import("./pt-PT.json"),
  [Language.Pl]: () => import("./pl.json"),
  [Language.Sv]: () => import("./sv.json"),
  [Language.Tr]: () => import("./tr.json")
});
