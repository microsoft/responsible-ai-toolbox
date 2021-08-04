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
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  IDetailsColumnRenderTooltipProps,
  IDetailsHeaderProps,
  IRenderFunction,
  SelectionMode,
  TooltipHost
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
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.name,
        fieldName: nameof<ICausalAnalysisSingleData>("feature"),
        key: "name",
        maxWidth: 125,
        minWidth: 100,
        name: localization.ModelAssessment.CausalAnalysis.Table.name,
        onRender: getCausalDisplayFeatureName
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.point,
        fieldName: nameof<ICausalAnalysisSingleData>("point"),
        key: "point",
        maxWidth: 125,
        minWidth: 100,
        name: localization.ModelAssessment.CausalAnalysis.Table.point
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.stderr,
        fieldName: nameof<ICausalAnalysisSingleData>("stderr"),
        key: "stderr",
        maxWidth: 125,
        minWidth: 100,
        name: localization.ModelAssessment.CausalAnalysis.Table.stderr
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.zstat,
        fieldName: nameof<ICausalAnalysisSingleData>("zstat"),
        key: "zstat",
        maxWidth: 125,
        minWidth: 100,
        name: localization.ModelAssessment.CausalAnalysis.Table.zstat
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.pValue,
        fieldName: nameof<ICausalAnalysisSingleData>("p_value"),
        key: "pValue",
        maxWidth: 125,
        minWidth: 100,
        name: localization.ModelAssessment.CausalAnalysis.Table.pValue
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.ciLower,
        fieldName: nameof<ICausalAnalysisSingleData>("ci_lower"),
        key: "ciLower",
        maxWidth: 175,
        minWidth: 150,
        name: localization.ModelAssessment.CausalAnalysis.Table.ciLower
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.ciUpper,
        fieldName: nameof<ICausalAnalysisSingleData>("ci_upper"),
        key: "ciUpper",
        maxWidth: 175,
        minWidth: 150,
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
        onRenderDetailsHeader={this.onRenderDetailsHeader}
        checkboxVisibility={CheckboxVisibility.hidden}
        selectionPreservedOnEmptyClick
        layoutMode={DetailsListLayoutMode.justified}
      />
    );
  }

  public componentDidUpdate(prevProps: ICausalAggregateTableProps): void {
    if (!isEqual(prevProps.data, this.props.data)) {
      this.forceUpdate();
    }
  }

  private onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (
    props,
    defaultRender
  ) => {
    if (!props) {
      return <></>;
    }
    const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> =
      (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />;
    return (
      <div>
        {defaultRender?.({
          ...props,
          onRenderColumnHeaderTooltip
        })}
      </div>
    );
  };
}
