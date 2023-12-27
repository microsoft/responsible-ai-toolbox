// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SelectionMode, Stack, Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  JointDataset,
  ModelAssessmentContext,
  AccessibleDetailsList
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import {
  isMultiplicationOrDivision,
  Transformation
} from "../Interfaces/Transformation";

interface ITransformationsTableProps {
  transformations: Map<string, Transformation>;
  jointDataset: JointDataset;
}

interface ITransformationsTableState {
  rows: ITransformationRow[];
}

const stackTokens = {
  childrenGap: "l1"
};

interface ITransformationRow {
  key: string;
  transformationName: string;
  method: string;
}

export class TransformationsTable extends React.Component<
  ITransformationsTableProps,
  ITransformationsTableState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ITransformationsTableProps) {
    super(props);
    this.state = { rows: this.calculateUpdatedTable(this.props.jointDataset) };
  }

  public componentDidUpdate(): void {
    // Currently, transformations are not editable or deletable.
    // If that changes in the future we will have to update these checks.
    const nTransformations = this.props.transformations.size;
    const prevTransformationNames = new Set(
      this.state.rows.map((t) => t.transformationName)
    );
    const didUpdate =
      prevTransformationNames.size !== nTransformations ||
      nTransformations !==
        [...this.props.transformations.keys()].filter((t) =>
          prevTransformationNames.has(t)
        ).length;

    if (didUpdate) {
      this.setState({
        rows: this.calculateUpdatedTable(this.props.jointDataset)
      });
    }
  }

  public render(): React.ReactNode {
    if (
      this.props.transformations.size === 0 ||
      this.state === undefined ||
      this.state.rows === undefined ||
      this.state.rows.length === 0
    ) {
      return;
    }
    const classNames = forecastingDashboardStyles();

    const forecastNames: string[] = [];
    const forecastTransformations: Transformation[] = [];

    for (const [
      forecastName,
      forecastTransformation
    ] of this.props.transformations.entries()) {
      forecastNames.push(forecastName);
      forecastTransformations.push(forecastTransformation);
    }

    return (
      <Stack tokens={stackTokens}>
        <Stack.Item>
          <Text className={classNames.mediumText}>
            {localization.formatString(
              localization.Forecasting.TransformationTable.header,
              this.props.transformations.size
            )}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <AccessibleDetailsList
            items={this.state.rows}
            columns={[
              {
                fieldName: "transformationName",
                key: "name",
                maxWidth: 300,
                minWidth: 10,
                name: localization.Forecasting.TransformationTable
                  .nameColumnHeader
              },
              {
                fieldName: "method",
                key: "method",
                minWidth: 10,
                name: localization.Forecasting.TransformationTable
                  .methodColumnHeader
              }
            ]}
            selectionMode={SelectionMode.none}
          />
        </Stack.Item>
      </Stack>
    );
  }

  public calculateUpdatedTable(
    jointDataset: JointDataset
  ): ITransformationRow[] {
    const rows: ITransformationRow[] = [...this.props.transformations.entries()]
      .map(([transformationName, transformation], index) => {
        let value: string | number = transformation.value;
        if (jointDataset.metaDict) {
          const featureMeta = jointDataset.metaDict[transformation.feature.key];
          if (
            featureMeta.sortedCategoricalValues &&
            (featureMeta.isCategorical || featureMeta.treatAsCategorical)
          ) {
            value = featureMeta.sortedCategoricalValues[value];
          }
          // example method strings:
          // "Temperature add 5"
          // "Temperature divide by 2.5" (incl. divisionAndMultiplicationBy)
          // "Outdoor seating available change to no"
          const method = `${transformation.feature.text} ${
            transformation.operation.displayName
          } ${
            isMultiplicationOrDivision(transformation.operation)
              ? localization.Forecasting.TransformationTable
                  .divisionAndMultiplicationBy
              : ""
          }${value.toString()}`;
          return {
            key: index.toString(),
            method,
            transformationName
          };
        }
        return undefined;
      })
      .filter((row) => row !== undefined) as ITransformationRow[];
    return rows;
  }
}
