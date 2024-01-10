// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CheckboxVisibility,
  DetailsListLayoutMode,
  IColumn,
  IDetailsColumnRenderTooltipProps,
  IDetailsHeaderProps,
  IRenderFunction,
  SelectionMode,
  TooltipHost
} from "@fluentui/react";
import {
  AccessibleDetailsList,
  defaultModelAssessmentContext,
  ICausalAnalysisSingleData,
  ModelAssessmentContext,
  nameof
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { isEqual } from "lodash";
import React from "react";

import { getCausalDisplayFeatureName } from "./getCausalDisplayFeatureName";

export interface ICausalAggregateTableProps {
  data?: ICausalAnalysisSingleData[];
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
        isResizable: true,
        key: "name",
        maxWidth: 110,
        minWidth: 70,
        name: localization.ModelAssessment.CausalAnalysis.Table.name,
        onRender: getCausalDisplayFeatureName
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.point,
        fieldName: nameof<ICausalAnalysisSingleData>("point"),
        isResizable: true,
        key: "point",
        maxWidth: 100,
        minWidth: 70,
        name: localization.ModelAssessment.CausalAnalysis.Table.point
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.stderr,
        fieldName: nameof<ICausalAnalysisSingleData>("stderr"),
        isResizable: true,
        key: "stderr",
        maxWidth: 100,
        minWidth: 70,
        name: localization.ModelAssessment.CausalAnalysis.Table.stderr
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.zstat,
        fieldName: nameof<ICausalAnalysisSingleData>("zstat"),
        isResizable: true,
        key: "zstat",
        maxWidth: 70,
        minWidth: 50,
        name: localization.ModelAssessment.CausalAnalysis.Table.zstat
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.pValue,
        fieldName: nameof<ICausalAnalysisSingleData>("p_value"),
        isResizable: true,
        key: "pValue",
        maxWidth: 70,
        minWidth: 50,
        name: localization.ModelAssessment.CausalAnalysis.Table.pValue
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.ciLower,
        fieldName: nameof<ICausalAnalysisSingleData>("ci_lower"),
        isResizable: true,
        key: "ciLower",
        maxWidth: 130,
        minWidth: 80,
        name: localization.ModelAssessment.CausalAnalysis.Table.ciLower
      },
      {
        ariaLabel: localization.ModelAssessment.CausalAnalysis.Table.ciUpper,
        fieldName: nameof<ICausalAnalysisSingleData>("ci_upper"),
        isResizable: true,
        key: "ciUpper",
        maxWidth: 130,
        minWidth: 80,
        name: localization.ModelAssessment.CausalAnalysis.Table.ciUpper
      }
    ];
    const items =
      this.props.data?.map((d) => {
        const roundedData = {};
        Object.entries(d).forEach(([key, value]) => {
          if (typeof value === "number") {
            roundedData[key] = value.toExponential(3);
          } else {
            roundedData[key] = value;
          }
        });
        return roundedData;
      }) ?? [];
    return (
      <AccessibleDetailsList
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
      return <div />;
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
