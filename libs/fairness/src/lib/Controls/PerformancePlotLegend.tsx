// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { chartColors } from "@responsible-ai/mlchartlib";
import React from "react";

import { SharedStyles } from "../Shared.styles";

import { IPerformancePlotLegendProps } from "./IPerformancePlotLegendProps";
import { PerformancePlotStyles } from "./PerformancePlot.styles";

export class PerformancePlotLegend extends React.PureComponent<IPerformancePlotLegendProps> {
  public render(): React.ReactNode {
    const styles = PerformancePlotStyles();
    const sharedStyles = SharedStyles();

    return (
      <Stack horizontal tokens={{ childrenGap: "l1", padding: "0 0 0 0" }}>
        <div className={sharedStyles.textRow}>
          <div
            className={sharedStyles.colorBlock}
            style={{ backgroundColor: chartColors[1] }}
          />
          <div>
            <div className={styles.legendTitle}>
              {this.props.useOverUnderPrediction
                ? localization.Fairness.Report.underestimationError
                : localization.Fairness.Report.falseNegativeRate}
            </div>
            {this.props.showSubtitle && (
              <div className={styles.legendSubtitle}>
                {localization.Fairness.Report.underpredictionExplanation}
              </div>
            )}
          </div>
        </div>
        <div className={sharedStyles.textRow}>
          <div
            className={sharedStyles.colorBlock}
            style={{ backgroundColor: chartColors[0] }}
          />
          <div>
            <div className={styles.legendTitle}>
              {this.props.useOverUnderPrediction
                ? localization.Fairness.Report.overestimationError
                : localization.Fairness.Report.falsePositiveRate}
            </div>
            {this.props.showSubtitle && (
              <div className={styles.legendSubtitle}>
                {localization.Fairness.Report.overpredictionExplanation}
              </div>
            )}
          </div>
        </div>
      </Stack>
    );
  }
}
