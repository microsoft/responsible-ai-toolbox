// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ConstrainMode,
  DetailsListLayoutMode,
  DetailsRow,
  DetailsRowFields,
  IColumn,
  IDetailsFooterProps,
  IDetailsRowFieldsProps,
  IDetailsRowProps,
  IRenderFunction,
  SelectionMode
} from "@fluentui/react";
import {
  AccessibleDetailsList,
  defaultModelAssessmentContext,
  ICounterfactualData,
  ITelemetryEvent,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _, { toNumber } from "lodash";
import React from "react";

import { getCategoricalOption } from "../util/getCategoricalOption";
import { getColumns } from "../util/getColumns";

import { counterfactualListStyle } from "./CounterfactualList.styles";
import { CounterfactualListColumnName } from "./CounterfactualListColumnName";
import { CounterfactualListDetailsFooter } from "./CounterfactualListDetailsFooter";

export interface ICounterfactualListProps {
  selectedIndex: number;
  originalData: { [key: string]: string | number };
  data?: ICounterfactualData;
  filterText?: string;
  temporaryPoint: Record<string, string | number> | undefined;
  sortFeatures: boolean;
  telemetryHook?: (message: ITelemetryEvent) => void;
  setCustomRowProperty(
    key: string | number,
    isString: boolean,
    newValue?: string | number
  ): void;
  setCustomRowPropertyComboBox(
    key: string | number,
    index?: number,
    value?: string
  ): void;
}

interface ICounterfactualListState {
  data: Record<string, string | number>;
  showCallout: boolean;
}

const nameColumnKey = "row";

export class CounterfactualList extends React.Component<
  ICounterfactualListProps,
  ICounterfactualListState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public constructor(props: ICounterfactualListProps) {
    super(props);
    this.state = {
      data: {},
      showCallout: false
    };
  }

  public componentDidMount(): void {
    this.onSelect(0);
  }

  public render(): React.ReactNode {
    const items = this.getItems();
    const columns = getColumns(
      this.props.data,
      this.props.selectedIndex,
      this.props.sortFeatures,
      this.props.filterText,
      nameColumnKey,
      this.renderName
    );

    if (columns.length === 0) {
      return (
        <MissingParametersPlaceholder>
          {localization.Counterfactuals.noFeatures}
        </MissingParametersPlaceholder>
      );
    }
    return (
      <AccessibleDetailsList
        items={items}
        columns={columns}
        selectionMode={SelectionMode.none}
        setKey="set"
        constrainMode={ConstrainMode.unconstrained}
        layoutMode={DetailsListLayoutMode.fixedColumns}
        onRenderItemColumn={this.renderItemColumn}
        onRenderRow={this.renderRow}
        onRenderDetailsFooter={this.onRenderDetailsFooter}
        ariaLabel={localization.Counterfactuals.AriaLabel}
      />
    );
  }

  private renderRow: IRenderFunction<IDetailsRowProps> = (
    props?: IDetailsRowProps
  ): JSX.Element | null => {
    if (!props) {
      return <div />;
    }
    return <DetailsRow rowFieldsAs={this.renderRowFields} {...props} />;
  };

  private renderRowFields = (
    props: IDetailsRowFieldsProps
  ): React.ReactElement => {
    const classNames = counterfactualListStyle();
    const rowClass = props?.itemIndex === 0 ? classNames.highlightRow : "";
    return (
      <span className={rowClass}>
        <DetailsRowFields {...props} />
      </span>
    );
  };

  private getItems(): Array<Record<string, string | number>> {
    const items: Array<Record<string, string | number>> = [];
    const selectedData =
      this.props.data?.cfs_list[
        this.props.selectedIndex % this.props.data?.cfs_list.length
      ];
    if (selectedData && this.props.originalData) {
      items.push(this.props.originalData);
      selectedData.forEach((point, i) => {
        const temp = {
          row: localization.formatString(
            localization.Counterfactuals.counterfactualEx,
            i + 1
          )
        };
        this.props.data?.feature_names_including_target.forEach((f, j) => {
          temp[f] = this.props.originalData?.[f] !== point[j] ? point[j] : "-";
        });
        items.push(temp);
      });
    }
    return items;
  }

  private onSelect = (idx: number): void => {
    const items = this.getItems();
    const data = _.cloneDeep(items[idx]);
    const metaDict = this.context.jointDataset.metaDict;
    const metaDictKeys = Object.keys(metaDict);
    Object.keys(data).forEach((k) => {
      data[k] = data[k] === "-" ? items[0][k] : data[k];
      const columnKey = metaDictKeys.find((item) => metaDict[item].label === k);
      if (!columnKey) {
        return;
      }
      if (typeof data[k] === "string") {
        const dropdownOption = getCategoricalOption(
          this.context.jointDataset,
          k
        );
        const optionIndex = dropdownOption?.data.categoricalOptions.findIndex(
          (feature: IComboBoxOption) => feature.key === data[k]
        );
        this.props.setCustomRowProperty(columnKey, true, optionIndex);
      } else {
        this.props.setCustomRowProperty(columnKey, false, data[k]);
      }
    });
    data.row = localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      this.props.selectedIndex
    );
    this.setState({ data });
  };

  private renderName = (
    item?: Record<string, string | number>,
    index?: number | undefined
  ): React.ReactElement => {
    return (
      <CounterfactualListColumnName
        {...this.props}
        data={this.state.data}
        index={index}
        item={item}
        nameColumnKey={nameColumnKey}
        showCallout={this.state.showCallout}
        onSelect={this.onSelect}
        toggleCallout={this.toggleCallout}
        updateColValue={this.updateColValue}
      />
    );
  };

  private updateComboBoxColValue = (
    key: string | number,
    options: IComboBoxOption[],
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption
  ): void => {
    const id = key.toString();
    const columnKey = this.getColumnKey(id);
    if (!columnKey) {
      return;
    }
    if (option?.text) {
      const optionIndex = options.findIndex(
        (feature) => feature.key === option.text
      );
      this.props.setCustomRowPropertyComboBox(
        columnKey,
        optionIndex,
        option.text
      );
      this.setState((prevState) => {
        prevState.data[id] = option.text;
        return { data: { ...prevState.data } };
      });
    }
  };

  private updateColValue = (
    evt: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    const target = evt.target as Element;
    const id = target.id;
    const columnKey = this.getColumnKey(id);
    if (!columnKey) {
      return;
    }
    this.props.setCustomRowProperty(columnKey, false, newValue);
    this.setState((prevState) => {
      prevState.data[id] = newValue?.endsWith(".")
        ? newValue
        : toNumber(newValue);
      return { data: { ...prevState.data } };
    });
  };

  private getColumnKey = (featureKey: string): string | undefined => {
    const metaDict = this.context.jointDataset.metaDict;
    const metaDictKeys = Object.keys(metaDict);
    return metaDictKeys.find((item) => metaDict[item].label === featureKey);
  };

  private toggleCallout = (): void => {
    this.setState((preState) => {
      return {
        showCallout: !preState.showCallout
      };
    });
  };

  private renderItemColumn = (
    item: any,
    index?: number,
    column?: IColumn
  ): React.ReactElement => {
    const classNames = counterfactualListStyle();
    const fieldContent = item[column?.fieldName as unknown as string] as string;
    const itemClass =
      index !== 0 && fieldContent !== "-"
        ? classNames.editCell
        : classNames.originalCell;
    return <div className={itemClass}>{fieldContent}</div>;
  };

  private onRenderDetailsFooter = (
    detailsFooterProps?: IDetailsFooterProps
  ): JSX.Element => {
    return (
      <CounterfactualListDetailsFooter
        {...this.props}
        detailsFooterProps={detailsFooterProps}
        itemColumnData={this.state.data}
        updateColValue={this.updateColValue}
        updateComboBoxColValue={this.updateComboBoxColValue}
      />
    );
  };
}
