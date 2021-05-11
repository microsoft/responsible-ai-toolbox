// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisSingleData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode
} from "office-ui-fabric-react";
import React from "react";

export interface ICasualAggregateTableProps {
  data: ICasualAnalysisSingleData;
}

export class CasualAggregateTable extends React.PureComponent<
  ICasualAggregateTableProps
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const columns: IColumn[] = [
      {
        fieldName: "name",
        key: "name",
        maxWidth: 75,
        minWidth: 50,
        name: localization.ModelAssessment.CasualAnalysis.Table.name
      },
      {
        fieldName: "point",
        key: "point",
        maxWidth: 75,
        minWidth: 50,
        name: localization.ModelAssessment.CasualAnalysis.Table.point
      },
      {
        fieldName: "stderr",
        key: "stderr",
        maxWidth: 75,
        minWidth: 50,
        name: localization.ModelAssessment.CasualAnalysis.Table.stderr
      },
      {
        fieldName: "zstat",
        key: "zstat",
        maxWidth: 75,
        minWidth: 50,
        name: localization.ModelAssessment.CasualAnalysis.Table.zstat
      },
      {
        fieldName: "pValue",
        key: "pValue",
        maxWidth: 75,
        minWidth: 50,
        name: localization.ModelAssessment.CasualAnalysis.Table.pValue
      },
      {
        fieldName: "ciLower",
        key: "ciLower",
        maxWidth: 75,
        minWidth: 50,
        name: localization.ModelAssessment.CasualAnalysis.Table.ciLower
      },
      {
        fieldName: "ciUpper",
        key: "ciUpper",
        maxWidth: 75,
        minWidth: 50,
        name: localization.ModelAssessment.CasualAnalysis.Table.ciUpper
      }
    ];
    const items = this.getItems(columns);
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

  public componentDidUpdate(prevProps: ICasualAggregateTableProps): void {
    if (!_.isEqual(prevProps.data, this.props.data)) this.forceUpdate();
  }
  private getItems = (columns: IColumn[]): unknown[] => {
    const props = columns.map((c) => c.key);
    const items = [];
    const len = this.props.data[props[0]].length;
    for (let i = 0; i < len; i++) {
      const temp = {};
      props.forEach(
        (p) =>
          (temp[p] =
            p === "name"
              ? this.props.data?.[p]?.[i]
              : this.props.data?.[p]?.[0]?.[0]?.[i])
      );
      items.push(temp);
    }
    return items;
  };
}
