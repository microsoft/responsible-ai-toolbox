// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import {
  IBounds,
  IFairnessData,
  IMetricRequest,
  IMetricResponse
} from "@responsible-ai/core-ui";
import { FairnessWizard, IFairnessProps } from "@responsible-ai/fairness";
import { Language } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import {
  messages,
  supportedBinaryClassificationPerformanceKeys,
  supportedProbabilityPerformanceKeys,
  supportedRegressionPerformanceKeys
} from "./utils";

interface IAppProps {
  dataset: IFairnessData;
  theme: ITheme;
  language: Language;
  version: 2;
}

export class App extends React.Component<IAppProps> {
  public render(): React.ReactNode {
    const dashboardProps: IFairnessProps = {
      ...this.props.dataset,
      locale: this.props.language,
      requestMetrics: this.generateRandomMetrics,
      stringParams: { contextualHelp: messages },
      supportedBinaryClassificationPerformanceKeys,
      supportedProbabilityPerformanceKeys,
      supportedRegressionPerformanceKeys,
      theme: this.props.theme
    };
    return <FairnessWizard {...dashboardProps} />;
  }

  private generateRandomMetrics = (
    request: IMetricRequest,
    abortSignal?: AbortSignal
  ): Promise<IMetricResponse> => {
    const binSize = _.max(request.binVector) || 0;
    const bins: number[] = new Array(binSize + 1)
      .fill(0)
      .map(() => Math.random() / 3 + 0.33);
    const binBounds: IBounds[] = bins.map((bin) => {
      return {
        lower: this.getBound(bin, true),
        upper: this.getBound(bin, false)
      };
    });
    const global: number = Math.random() / 3 + 0.33;
    const bounds: IBounds = {
      lower: this.getBound(global, true),
      upper: this.getBound(global, false)
    };

    const promise = new Promise<IMetricResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve({
          binBounds,
          bins,
          bounds,
          global
        });
      }, 300);
      if (abortSignal) {
        abortSignal.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new DOMException("Aborted", "AbortError"));
        });
      }
    });
    return promise;
  };

  private getBound = (data: number, getLowerBound: boolean): number => {
    return getLowerBound
      ? data - Math.pow(Math.random() / 3, 2)
      : data + Math.pow(Math.random() / 3, 2);
  };
}
