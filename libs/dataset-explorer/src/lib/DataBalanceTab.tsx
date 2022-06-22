// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { AggregateBalanceMeasuresTable } from "./AggregateBalanceMeasuresTable";
import { dataBalanceTabStyles } from "./DataBalanceTab.styles";
import { DistributionBalanceMeasuresChart } from "./DistributionBalanceMeasuresChart";
import { FeatureBalanceMeasuresChart } from "./FeatureBalanceMeasuresChart";

export class IDataBalanceTabProps {}

export class DataBalanceTab extends React.Component<IDataBalanceTabProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    // If some types of measures are available but others are not (i.e. feature balance measures are not available
    // but distribution balance measures are), the measures that are available can still be displayed.
    // Return if all measures are missing.
    const dataBalanceMeasures = this.context.dataset.data_balance_measures;
    if (
      !dataBalanceMeasures ||
      (!dataBalanceMeasures.FeatureBalanceMeasures &&
        !dataBalanceMeasures.AggregateBalanceMeasures &&
        !dataBalanceMeasures.DistributionBalanceMeasures)
    ) {
      return (
        <MissingParametersPlaceholder>
          {localization.ModelAssessment.DataBalance.MeasuresNotComputed}
        </MissingParametersPlaceholder>
      );
    }

    const styles = dataBalanceTabStyles();

    return (
      <Stack grow tokens={{ childrenGap: "l1" }} className={styles.page}>
        <Stack.Item>
          {dataBalanceMeasures.FeatureBalanceMeasures && (
            <FeatureBalanceMeasuresChart
              featureBalanceMeasures={
                dataBalanceMeasures.FeatureBalanceMeasures
              }
            />
          )}
        </Stack.Item>

        <Stack.Item>
          {dataBalanceMeasures.DistributionBalanceMeasures && (
            <DistributionBalanceMeasuresChart
              distributionBalanceMeasures={
                dataBalanceMeasures.DistributionBalanceMeasures
              }
            />
          )}
        </Stack.Item>

        <Stack.Item>
          {dataBalanceMeasures.AggregateBalanceMeasures && (
            <AggregateBalanceMeasuresTable
              aggregateBalanceMeasures={
                dataBalanceMeasures.AggregateBalanceMeasures
              }
            />
          )}
        </Stack.Item>
      </Stack>
    );
  }
}
