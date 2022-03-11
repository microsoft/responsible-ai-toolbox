// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import _ from "lodash";
import React from "react";

import { AggregateBalanceMeasureChart } from "./AggregateBalanceMeasureChart";
import { dataBalanceTabStyles } from "./DataBalanceTab.styles";
import { DistributionBalanceMeasureChart } from "./DistributionBalanceMeasureChart";
import { FeatureBalanceMeasureChart } from "./FeatureBalanceMeasureChart";

export class IDataBalanceTabProps {}

export class DataBalanceTab extends React.Component<IDataBalanceTabProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = dataBalanceTabStyles();

    if (
      !this.context.dataset.data_balance_measures ||
      (!this.context.dataset.data_balance_measures.featureBalanceMeasures &&
        !this.context.dataset.data_balance_measures.aggregateBalanceMeasures &&
        !this.context.dataset.data_balance_measures.distributionBalanceMeasures)
    ) {
      return (
        <MissingParametersPlaceholder>
          {
            "This tab requires the dataset to contain already computed data balance measures." // TODO: Replace with localization
          }
        </MissingParametersPlaceholder>
      );
    }

    // If some types of measures are available but others are not (i.e. feature balance measures are not available but
    // distribution balance measures are), we still display the measures that are available.
    const dataBalanceMeasures = this.context.dataset.data_balance_measures,
      featureBalanceMeasures = dataBalanceMeasures.featureBalanceMeasures,
      distributionBalanceMeasures =
        dataBalanceMeasures.distributionBalanceMeasures,
      aggregateBalanceMeasures = dataBalanceMeasures.aggregateBalanceMeasures;

    return (
      <div className={styles.page}>
        {featureBalanceMeasures && (
          <FeatureBalanceMeasureChart
            featureBalanceMeasures={featureBalanceMeasures}
            datasetName={this.context.dataset.name}
          />
        )}

        <br />

        {distributionBalanceMeasures && (
          <DistributionBalanceMeasureChart
            distributionBalanceMeasures={distributionBalanceMeasures}
            datasetName={this.context.dataset.name}
          />
        )}

        <br />

        {aggregateBalanceMeasures && (
          <AggregateBalanceMeasureChart
            aggregateBalanceMeasures={aggregateBalanceMeasures}
            datasetName={this.context.dataset.name}
          />
        )}
      </div>
    );
  }
}
