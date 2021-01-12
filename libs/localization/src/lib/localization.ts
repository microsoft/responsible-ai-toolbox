// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Cs from "./cs.json";
import De from "./de.json";
import En from "./en.json";
import Es from "./es.json";
import Fr from "./fr.json";
import { getLocalization } from './getLocalization';
import Hu from "./hu.json";
import It from "./it.json";
import Ja from "./ja.json";
import Ko from "./ko.json";
import { Language } from './Language';
import Nl from "./nl.json";
import Pl from "./pl.json";
import PtBR from "./pt-BR.json";
import PtPT from "./pt-PT.json";
import Ru from "./ru.json";
import Sv from "./sv.json";
import Tr from "./tr.json";
import ZhHans from "./zh-Hans.json";
import ZhHant from "./zh-Hant.json";

export const localization = getLocalization({
  [Language.En]: En,
  [Language.Es]: Es,
  [Language.Cs]: Cs,
  [Language.De]: De,
  [Language.Fr]: Fr,
  [Language.It]: It,
  [Language.Ja]: Ja,
  [Language.Ko]: Ko,
  [Language.PtBR]: PtBR,
  [Language.Ru]: Ru,
  [Language.ZhHans]: ZhHans,
  [Language.ZhHant]: ZhHant,
  [Language.Nl]: Nl,
  [Language.Hu]: Hu,
  [Language.PtPT]: PtPT,
  [Language.Pl]: Pl,
  [Language.Sv]: Sv,
  [Language.Tr]: Tr
});
