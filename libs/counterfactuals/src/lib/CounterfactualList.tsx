// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICounterfactualData,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _, { toLower, toNumber } from "lodash";
import {
  Callout,
  ConstrainMode,
  DetailsList,
  DetailsListLayoutMode,
  DetailsRow,
  IColumn,
  IDetailsFooterProps,
  ISelection,
  Link,
  Selection,
  SelectionMode,
  Stack,
  TextField
} from "office-ui-fabric-react";
import React from "react";

import { CustomPredictionLabels } from "./CustomPredictionLabels";
import { ILocalImportanceData } from "./LocalImportanceChart";

export interface ICounterfactualListProps {
  selectedIndex: number;
  originalData: { [key: string]: any };
  data?: ICounterfactualData;
  filterText?: string;
  temporaryPoint: { [key: string]: any } | undefined;
  setCustomRowProperty(
    key: string | number,
    isString: boolean,
    newValue?: string
  ): void;
}

interface ICounterfactualListState {
  data: any;
  showCallout: boolean;
}

export class CounterfactualList extends React.Component<
  ICounterfactualListProps,
  ICounterfactualListState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  private selection: ISelection;
  public constructor(props: ICounterfactualListProps) {
    super(props);
    this.selection = new Selection({
      onSelectionChanged: (): void => {
        const select = this.selection.getSelectedIndices()[0];
        this.setState({
          data: this.processSelectionData(this.getItems(), select)
        });
      }
    });
    this.state = {
      data: this.processSelectionData(this.getItems(), 0),
      showCallout: false
    };
  }

  public render(): React.ReactNode {
    const items = this.getItems();
    const columns = this.getColumns();
    if (columns.length === 0) {
      return (
        <MissingParametersPlaceholder>
          {localization.Counterfactuals.noFeatures}
        </MissingParametersPlaceholder>
      );
    }
    return (
      <DetailsList
        items={items}
        columns={columns}
        selection={this.selection}
        selectionMode={SelectionMode.single}
        setKey="set"
        constrainMode={ConstrainMode.unconstrained}
        layoutMode={DetailsListLayoutMode.fixedColumns}
        onRenderDetailsFooter={this.onRenderDetailsFooter.bind(this)}
      />
    );
  }

  private getItems(): any {
    const items: any = [];
    const selectedData =
      this.props.data?.cfs_list[
        this.props.selectedIndex % this.props.data?.cfs_list.length
      ];
    if (selectedData && this.props.originalData) {
      items.push(this.props.originalData);
      selectedData.forEach((point, i) => {
        const temp = {};
        temp["row"] = localization.formatString(
          localization.Counterfactuals.counterfactualEx,
          i + 1
        );
        this.props.data?.feature_names.forEach((f, j) => {
          temp[f] = this.props.originalData?.[j] !== point[j] ? point[j] : "-";
        });
        items.push(temp);
      });
    }
    return items;
  }

  private processSelectionData(items: any, row: number): any {
    const data = _.cloneDeep(items[row]);
    Object.keys(data).forEach((k) => {
      data[k] = data[k] === "-" ? items[0][k] : data[k];
      const keyIndex =
        this.context.dataset.feature_names &&
        this.context.dataset.feature_names.indexOf(k);
      this.props.setCustomRowProperty(`Data${keyIndex}`, false, data[k]);
    });
    data["row"] = localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      this.props.selectedIndex
    );
    return data;
  }

  private getColumns(): IColumn[] {
    const columns: IColumn[] = [];
    const featureNames = this.getFilterFeatures();
    if (!featureNames || featureNames.length === 0) {
      return columns;
    }
    columns.push({
      fieldName: "row",
      isResizable: true,
      key: "row",
      minWidth: 200,
      name: ""
    });
    featureNames.forEach((f) =>
      columns.push({
        fieldName: f,
        isResizable: true,
        key: f,
        minWidth: 175,
        name: f
      })
    );
    return columns;
  }

  private updateColValue(
    evt: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void {
    const target = evt.target as Element;
    const id = target.id;
    const keyIndex = this.context.dataset.feature_names.indexOf(id);
    this.props.setCustomRowProperty(`Data${keyIndex}`, false, newValue);
    this.setState((prevState) => {
      prevState.data[id] = toNumber(newValue);
      return { data: prevState.data };
    });
  }

  private toggleCallout(): void {
    this.setState((preState) => {
      return {
        showCallout: !preState.showCallout
      };
    });
  }

  private renderDetailsFooterItemColumn(
    _item: any,
    _index?: number,
    column?: IColumn
  ): React.ReactNode | undefined {
    if (column) {
      return (
        <Stack horizontal={false}>
          <Stack.Item>
            <TextField
              value={this.state.data[column.key]}
              label={
                column.key === "row"
                  ? localization.Counterfactuals.createOwn
                  : column.key
              }
              id={column.key}
              disabled={column.key === "row"}
              onChange={this.updateColValue.bind(this)}
            />
          </Stack.Item>
          {column.key === "row" && (
            <Stack.Item>
              <Link
                id={"predictionLink"}
                onClick={this.toggleCallout.bind(this)}
              >
                {localization.Counterfactuals.seePrediction}
              </Link>
              {this.state.showCallout && (
                <Callout
                  target={"#predictionLink"}
                  onDismiss={this.toggleCallout.bind(this)}
                  setInitialFocus
                >
                  <CustomPredictionLabels
                    jointDataset={this.context.jointDataset}
                    metadata={this.context.modelMetadata}
                    selectedWhatIfRootIndex={this.props.selectedIndex}
                    temporaryPoint={this.props.temporaryPoint}
                  />
                </Callout>
              )}
            </Stack.Item>
          )}
        </Stack>
      );
    }
    return undefined;
  }

  private onRenderDetailsFooter(
    detailsFooterProps?: IDetailsFooterProps
  ): JSX.Element {
    if (detailsFooterProps) {
      return (
        <DetailsRow
          {...detailsFooterProps}
          columns={detailsFooterProps.columns}
          item={this.state.data}
          itemIndex={-1}
          groupNestingDepth={detailsFooterProps.groupNestingDepth}
          selectionMode={SelectionMode.single}
          selection={detailsFooterProps.selection}
          onRenderItemColumn={this.renderDetailsFooterItemColumn.bind(this)}
        />
      );
    }
    return <div />;
  }

  private getFilterFeatures = (): string[] => {
    const allFeatures = this.getSortedFeatureNames();
    const filterText = this.props.filterText;
    const invalidInput =
      filterText === undefined || filterText === null || !/\S/.test(filterText);
    const filtered = invalidInput
      ? allFeatures
      : allFeatures.filter((f) => f.includes(toLower(filterText)));
    return filtered;
  };

  private getSortedFeatureNames(): string[] {
    const data: ILocalImportanceData[] = [];
    const localImportanceData =
      this.props.data?.local_importance?.[this.props.selectedIndex];
    if (!localImportanceData) {
      return [];
    }
    this.props?.data?.feature_names.forEach((f, index) => {
      data.push({
        label: f,
        value: localImportanceData[index] || -Infinity
      });
    });
    data.sort((d1, d2) => d2.value - d1.value);
    const result = data.map((p) => p.label);
    return result;
  }
}
