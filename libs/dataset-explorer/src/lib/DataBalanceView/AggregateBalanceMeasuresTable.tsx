// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CheckboxVisibility,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Stack
} from "@fluentui/react";
import {
  AccessibleDetailsList,
  HeaderWithInfo,
  IAggregateBalanceMeasures,
  MissingParametersPlaceholder
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface IAggregateBalanceMeasuresProps {
  aggregateBalanceMeasures?: IAggregateBalanceMeasures;
}

export class AggregateBalanceMeasuresTable extends React.PureComponent<IAggregateBalanceMeasuresProps> {
  public render(): React.ReactNode {
    const aggregateBalanceMeasures = this.props.aggregateBalanceMeasures;

    const measuresLocalization =
      localization.ModelAssessment.DataBalance.AggregateBalanceMeasures;

    const headerWithInfo = (
      <HeaderWithInfo
        title={measuresLocalization.Name}
        calloutTitle={measuresLocalization.Callout.Title}
        calloutDescription={measuresLocalization.Callout.Description}
        calloutLink="https://github.com/microsoft/responsible-ai-toolbox/blob/main/docs/databalance-README.md#aggregate-balance-measures"
        calloutLinkText={localization.ModelAssessment.DataBalance.LearnMore}
        id="aggregateBalanceMeasuresHeader"
      />
    );

    if (!aggregateBalanceMeasures) {
      return (
        <>
          {headerWithInfo}
          <MissingParametersPlaceholder>
            {measuresLocalization.MeasuresNotComputed}
          </MissingParametersPlaceholder>
        </>
      );
    }

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
      <Stack tokens={{ childrenGap: "l1" }} id="aggregateBalanceMeasures">
        <Stack.Item>{headerWithInfo}</Stack.Item>

        <Stack.Item>
          <AccessibleDetailsList
            items={items}
            columns={columns}
            selectionMode={SelectionMode.none}
            layoutMode={DetailsListLayoutMode.justified}
            checkboxVisibility={CheckboxVisibility.hidden}
            ariaLabelForSelectAllCheckbox={
              localization.ModelAssessment.ModelOverview.featureConfiguration
                .selectAllRowsAriaLabel
            }
            ariaLabel={
              localization.ModelAssessment.ModelOverview.featureConfiguration
                .flyoutAriaLabel
            }
          />
        </Stack.Item>
      </Stack>
    );
  }
}
