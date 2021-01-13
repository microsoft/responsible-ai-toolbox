// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Cs from "./en-us.cs.json";
import De from "./en-us.de.json";
import Es from "./en-us.es.json";
import Fr from "./en-us.fr.json";
import Hu from "./en-us.hu.json";
import It from "./en-us.it.json";
import Ja from "./en-us.ja.json";
import En from "./en-us.json";
import Ko from "./en-us.ko.json";
import Nl from "./en-us.nl.json";
import Pl from "./en-us.pl.json";
import PtBR from "./en-us.pt-BR.json";
import PtPT from "./en-us.pt-PT.json";
import Ru from "./en-us.ru.json";
import Sv from "./en-us.sv.json";
import Tr from "./en-us.tr.json";
import ZhHans from "./en-us.zh-Hans.json";
import ZhHant from "./en-us.zh-Hant.json";
import { getLocalization } from "./getLocalization";
import { Language } from "./Language";

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
