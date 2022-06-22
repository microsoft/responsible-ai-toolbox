// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  Link,
  SelectionMode,
  Stack,
  Text
} from "@fluentui/react";
import {
  IAggregateBalanceMeasures,
  LabelWithCallout
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { dataBalanceTabStyles } from "./DataBalanceTab.styles";

export interface IAggregateBalanceMeasuresProps {
  aggregateBalanceMeasures: IAggregateBalanceMeasures;
}

export class AggregateBalanceMeasuresTable extends React.PureComponent<IAggregateBalanceMeasuresProps> {
  public render(): React.ReactNode {
    const aggregateBalanceMeasures = this.props.aggregateBalanceMeasures;
    if (!aggregateBalanceMeasures) {
      return;
    }

    const styles = dataBalanceTabStyles();
    const measuresLocalization =
      localization.ModelAssessment.DataBalance.AggregateBalanceMeasures;

    const columns: IColumn[] = [
      {
        ariaLabel: measuresLocalization.Table.FeatureName,
        fieldName: "featureName",
        isResizable: true,
        key: "featureNameCol",
        maxWidth: 150,
        minWidth: 100,
        name: measuresLocalization.Table.FeatureName
      },
      {
        ariaLabel: measuresLocalization.Table.FeatureValue,
        fieldName: "featureValue",
        isResizable: true,
        key: "featureValueCol",
        maxWidth: 150,
        minWidth: 100,
        name: measuresLocalization.Table.FeatureValue
      },
      {
        ariaLabel: measuresLocalization.Table.Description,
        fieldName: "description",
        isMultiline: true,
        isResizable: true,
        key: "descriptionCol",
        minWidth: 100,
        name: measuresLocalization.Table.Description
      }
    ];

    // Keys of each item need to match fieldNames of each column
    const items = [
      {
        description: measuresLocalization.Measures.AtkinsonIndex.Description,
        featureName: measuresLocalization.Measures.AtkinsonIndex.Name,
        featureValue: aggregateBalanceMeasures.AtkinsonIndex.toFixed(3)
      },
      {
        description: measuresLocalization.Measures.TheilLIndex.Description,
        featureName: measuresLocalization.Measures.TheilLIndex.Name,
        featureValue: aggregateBalanceMeasures.TheilLIndex.toFixed(3)
      },
      {
        description: measuresLocalization.Measures.TheilTIndex.Description,
        featureName: measuresLocalization.Measures.TheilTIndex.Name,
        featureValue: aggregateBalanceMeasures.TheilTIndex.toFixed(3)
      }
    ];

    return (
      <Stack tokens={{ childrenGap: "l1" }}>
        {/* Renders the title and info hover-over */}
        <Stack.Item>
          <Stack horizontal>
            <Stack.Item>
              <Text variant="large" className={styles.boldText}>
                {measuresLocalization.Name}
              </Text>
            </Stack.Item>

            <Stack.Item className={styles.callout}>
              <LabelWithCallout
                label=""
                calloutTitle={measuresLocalization.Callout.Title}
                type="button"
              >
                <Text block>{measuresLocalization.Callout.Description}</Text>
                <Link
                  // TODO: Replace link with https://responsibleaitoolbox.ai/ link once docs are published there
                  href="https://microsoft.github.io/SynapseML/docs/features/responsible_ai/Data%20Balance%20Analysis/#aggregate-balance-measures"
                  target="_blank"
                >
                  {localization.ModelAssessment.DataBalance.LearnMore}
                </Link>
              </LabelWithCallout>
            </Stack.Item>
          </Stack>
        </Stack.Item>

        {/* Renders a table of aggregate balance measures */}
        <Stack.Item>
          <DetailsList
            items={items}
            columns={columns}
            selectionMode={SelectionMode.none}
            layoutMode={DetailsListLayoutMode.justified}
            checkboxVisibility={CheckboxVisibility.hidden}
          />
        </Stack.Item>
      </Stack>
    );
  }
}
