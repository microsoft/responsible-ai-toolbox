// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDistributionBalanceMeasures, nameof } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

const measureLocalization =
  localization.ModelAssessment.DataBalance.DistributionBalanceMeasures.Measures;

interface IDistributionBalanceMetadata {
  Description: string;
  KeyName: string;
}

// Maps distribution balance measure names to their metadata
export const DistributionBalanceMeasuresMap = new Map<
  string,
  IDistributionBalanceMetadata
>([
  [
    measureLocalization.ChiSquarePValue.Name,
    {
      Description: measureLocalization.ChiSquarePValue.Description,
      KeyName: nameof<IDistributionBalanceMeasures>("ChiSquarePValue")
    }
  ],
  [
    measureLocalization.ChiSquareStatistic.Name,
    {
      Description: measureLocalization.ChiSquareStatistic.Description,
      KeyName: nameof<IDistributionBalanceMeasures>("ChiSquareStat")
    }
  ],
  [
    measureLocalization.CrossEntropy.Name,
    {
      Description: measureLocalization.CrossEntropy.Description,
      KeyName: nameof<IDistributionBalanceMeasures>("CrossEntropy")
    }
  ],
  [
    measureLocalization.InfiniteNormDistance.Name,
    {
      Description: measureLocalization.InfiniteNormDistance.Description,
      KeyName: nameof<IDistributionBalanceMeasures>("InfiniteNormDist")
    }
  ],
  [
    measureLocalization.JSDistance.Name,
    {
      Description: measureLocalization.JSDistance.Description,
      KeyName: nameof<IDistributionBalanceMeasures>("JensenShannonDist")
    }
  ],
  [
    measureLocalization.KLDivergence.Name,
    {
      Description: measureLocalization.KLDivergence.Description,
      KeyName: nameof<IDistributionBalanceMeasures>("KLDivergence")
    }
  ],
  [
    measureLocalization.TotalVariationDistance.Name,
    {
      Description: measureLocalization.TotalVariationDistance.Description,
      KeyName: nameof<IDistributionBalanceMeasures>("TotalVarianceDist")
    }
  ],
  [
    measureLocalization.WassersteinDistance.Name,
    {
      Description: measureLocalization.WassersteinDistance.Description,
      KeyName: nameof<IDistributionBalanceMeasures>("WassersteinDist")
    }
  ]
]);
