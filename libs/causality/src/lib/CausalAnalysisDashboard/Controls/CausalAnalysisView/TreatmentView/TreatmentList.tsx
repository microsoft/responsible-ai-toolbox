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
  TooltipHost,
  Text
} from "@fluentui/react";
import {
  AccessibleDetailsList,
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  toScientific
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { TreatmentStyles } from "./TreatmentStyles";

export interface ITreatmentListProps {
  data?: Array<{ [key: string]: any }>;
  topN: number;
}

export class TreatmentList extends React.Component<ITreatmentListProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    if (!this.props.data) {
      return <Text>{localization.CausalAnalysis.TreatmentPolicy.noData}</Text>;
    }
    const styles = TreatmentStyles();
    const defaultColumns: IColumn[] = [
      {
        ariaLabel: localization.Counterfactuals.RecommendedTreatment,
        fieldName: "Treatment",
        isResizable: true,
        key: "Treatment",
        maxWidth: 250,
        minWidth: 175,
        name: localization.Counterfactuals.RecommendedTreatment
      },
      {
        ariaLabel: localization.Counterfactuals.CurrentTreatment,
        fieldName: "Current treatment",
        isResizable: true,
        key: "Current treatment",
        maxWidth: 250,
        minWidth: 125,
        name: localization.Counterfactuals.CurrentTreatment
      },
      {
        ariaLabel: localization.Counterfactuals.EffectOfTreatment,
        fieldName: "Effect of treatment",
        isResizable: true,
        key: "Effect of treatment",
        maxWidth: 400,
        minWidth: 200,
        name: localization.Counterfactuals.EffectOfTreatment
      },
      {
        ariaLabel: localization.Counterfactuals.EffectLowerBound,
        fieldName: "Effect of treatment lower bound",
        isResizable: true,
        key: "Effect of treatment lower bound",
        maxWidth: 100,
        minWidth: 75,
        name: localization.Counterfactuals.EffectLowerBound
      },
      {
        ariaLabel: localization.Counterfactuals.EffectUpperBound,
        fieldName: "Effect of treatment upper bound",
        isResizable: true,
        key: "Effect of treatment upper bound",
        maxWidth: 100,
        minWidth: 75,
        name: localization.Counterfactuals.EffectUpperBound
      }
    ];
    const defaultKeys = new Set(defaultColumns.map((t) => t.fieldName));
    const allKeys = Object.keys(this.props.data[0]);
    const leftKeys = allKeys.filter((c) => !defaultKeys.has(c));
    const leftColumns = leftKeys.map((k) => {
      return {
        ariaLabel: k,
        fieldName: k,
        isResizable: true,
        key: k,
        maxWidth: 100,
        minWidth: 75,
        name: k
      };
    });
    const columns = [...defaultColumns, ...leftColumns];
    const items = this.props.data
      .sort((a, b) => b["Effect of treatment"] - a["Effect of treatment"])
      .slice(0, this.props.topN);
    const convertedItems = items.map((item) => toScientific(item));
    return (
      <div className={styles.listContainer}>
        <AccessibleDetailsList
          items={convertedItems}
          columns={columns}
          selectionMode={SelectionMode.none}
          setKey="set"
          onRenderDetailsHeader={this.onRenderDetailsHeader}
          checkboxVisibility={CheckboxVisibility.hidden}
          selectionPreservedOnEmptyClick
          layoutMode={DetailsListLayoutMode.justified}
        />
      </div>
    );
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
