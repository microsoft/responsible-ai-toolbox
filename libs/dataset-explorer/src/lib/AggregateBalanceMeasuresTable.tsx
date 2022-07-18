// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Stack
} from "@fluentui/react";
import {
  HeaderWithInfo,
  IAggregateBalanceMeasures
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

export interface IAggregateBalanceMeasuresProps {
  aggregateBalanceMeasures: IAggregateBalanceMeasures;
}

export class AggregateBalanceMeasuresTable extends React.PureComponent<IAggregateBalanceMeasuresProps> {
  public render(): React.ReactNode {
    const aggregateBalanceMeasures = this.props.aggregateBalanceMeasures;
    if (!aggregateBalanceMeasures) {
      return;
    }

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
      <Stack tokens={{ childrenGap: "l1" }} id="aggregateBalanceMeasures">
        <Stack.Item>
          <HeaderWithInfo
            title={measuresLocalization.Name}
            calloutTitle={measuresLocalization.Callout.Title}
            calloutDescription={measuresLocalization.Callout.Description}
            // TODO: Replace link with https://responsibleaitoolbox.ai/ link once docs are published there
            calloutLink="https://microsoft.github.io/SynapseML/docs/features/responsible_ai/Data%20Balance%20Analysis/#aggregate-balance-measures"
            calloutLinkText={localization.ModelAssessment.DataBalance.LearnMore}
            id="aggregateBalanceMeasuresHeader"
          />
        </Stack.Item>

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
