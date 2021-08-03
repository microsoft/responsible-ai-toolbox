// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalAnalysisSingleData,
  ModelAssessmentContext,
  nameof
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { isEqual } from "lodash";
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode
} from "office-ui-fabric-react";
import React from "react";

import { getCausalDisplayFeatureName } from "../../../getCausalDisplayFeatureName";

export interface ICausalAggregateTableProps {
  data: ICausalAnalysisSingleData[];
}

export class CausalAggregateTable extends React.PureComponent<ICausalAggregateTableProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const columns: IColumn[] = [
      {
        fieldName: nameof<ICausalAnalysisSingleData>("feature"),
        isResizable: true,
        key: "name",
        maxWidth: 110,
        minWidth: 70,
        name: localization.ModelAssessment.CausalAnalysis.Table.name,
        onRender: getCausalDisplayFeatureName
      },
      {
        fieldName: nameof<ICausalAnalysisSingleData>("point"),
        isResizable: true,
        key: "point",
        maxWidth: 100,
        minWidth: 70,
        name: localization.ModelAssessment.CausalAnalysis.Table.point
      },
      {
        fieldName: nameof<ICausalAnalysisSingleData>("stderr"),
        isResizable: true,
        key: "stderr",
        maxWidth: 100,
        minWidth: 70,
        name: localization.ModelAssessment.CausalAnalysis.Table.stderr
      },
      {
        fieldName: nameof<ICausalAnalysisSingleData>("zstat"),
        isResizable: true,
        key: "zstat",
        maxWidth: 70,
        minWidth: 50,
        name: localization.ModelAssessment.CausalAnalysis.Table.zstat
      },
      {
        fieldName: nameof<ICausalAnalysisSingleData>("p_value"),
        isResizable: true,
        key: "pValue",
        maxWidth: 70,
        minWidth: 50,
        name: localization.ModelAssessment.CausalAnalysis.Table.pValue
      },
      {
        fieldName: nameof<ICausalAnalysisSingleData>("ci_lower"),
        isResizable: true,
        key: "ciLower",
        maxWidth: 130,
        minWidth: 80,
        name: localization.ModelAssessment.CausalAnalysis.Table.ciLower
      },
      {
        fieldName: nameof<ICausalAnalysisSingleData>("ci_upper"),
        isResizable: true,
        key: "ciUpper",
        maxWidth: 130,
        minWidth: 80,
        name: localization.ModelAssessment.CausalAnalysis.Table.ciUpper
      }
    ];
    const items = this.props.data.map((d) => {
      const roundedData = {};
      Object.entries(d).forEach(([key, value]) => {
        if (typeof value === "number") {
          roundedData[key] = value.toExponential(3);
        } else {
          roundedData[key] = value;
        }
      });
      return roundedData;
    });
    return (
      <DetailsList
        items={items}
        columns={columns}
        selectionMode={SelectionMode.none}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
      />
    );
  }

  public componentDidUpdate(prevProps: ICausalAggregateTableProps): void {
    if (!isEqual(prevProps.data, this.props.data)) {
      this.forceUpdate();
    }
  }
}
