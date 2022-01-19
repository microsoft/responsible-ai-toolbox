// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Cs from "./en.cs.json";
import De from "./en.de.json";
import Es from "./en.es.json";
import Fr from "./en.fr.json";
import Hu from "./en.hu.json";
import It from "./en.it.json";
import Ja from "./en.ja.json";
import En from "./en.json";
import Ko from "./en.ko.json";
import Nl from "./en.nl.json";
import Pl from "./en.pl.json";
import PtBR from "./en.pt-BR.json";
import PtPT from "./en.pt-PT.json";
import Ru from "./en.ru.json";
import Sv from "./en.sv.json";
import Tr from "./en.tr.json";
import ZhHans from "./en.zh-Hans.json";
import ZhHant from "./en.zh-Hant.json";
import { getLocalization } from "./getLocalization";
import { Language } from "./Language";
import { Pseudoloc } from "./Pseudoloc";

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
  [Language.Tr]: Tr,
  [Language.QpsPloc]: Pseudoloc.pseudolocalizeStrings(En)
});
