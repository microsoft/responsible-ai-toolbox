// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICounterfactualData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { WhatIfConstants } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import _, { toNumber } from "lodash";
import {
  ConstrainMode,
  DetailsList,
  DetailsListLayoutMode,
  Panel,
  PanelType,
  Text,
  Stack,
  PrimaryButton,
  TextField,
  IColumn,
  IDetailsFooterProps,
  DetailsRow,
  Selection,
  SelectionMode,
  ISelection,
  Link,
  Callout
} from "office-ui-fabric-react";
import React from "react";

import { counterfactualPanelStyles } from "./CounterfactualPanelStyles";
import { CustomPredictionLabels } from "./CustomPredictionLabels";

export interface ICounterfactualPanelProps {
  selectedIndex: number;
  data?: ICounterfactualData;
  isPanelOpen: boolean;
  temporaryPoint: { [key: string]: any } | undefined;
  closePanel(): void;
  saveAsPoint(): void;
  setCustomRowProperty(
    key: string | number,
    isString: boolean,
    newValue?: string
  ): void;
}
interface ICounterfactualState {
  data: any;
  items: any;
  showCallout: boolean;
  columns: IColumn[];
}

export class CounterfactualPanel extends React.Component<
  ICounterfactualPanelProps,
  ICounterfactualState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  private selection: ISelection;
  public constructor(props: ICounterfactualPanelProps) {
    super(props);
    this.selection = new Selection({
      onSelectionChanged: (): void => {
        const select = this.selection.getSelectedIndices()[0];
        this.setState({
          data: this.processSelectionData(this.state.items, select)
        });
      }
    });
    const items = this.getItems();
    const columns = this.getColumns();
    this.state = {
      columns,
      data: this.processSelectionData(items, 0),
      items,
      showCallout: false
    };
  }
  public componentDidUpdate(
    prevProps: ICounterfactualPanelProps,
    preState: ICounterfactualState
  ): void {
    if (
      !_.isEqual(prevProps.data, this.props.data) ||
      !_.isEqual(preState.data, this.state.data)
    ) {
      this.forceUpdate();
    }
  }
  public componentDidMount(): void {
    setImmediate(() => {
      this.selection.setIndexSelected(0, true, false);
    });
  }
  public render(): React.ReactNode {
    const classes = counterfactualPanelStyles();
    return (
      <Panel
        isOpen={this.props.isPanelOpen}
        type={PanelType.largeFixed}
        onDismiss={this.props.closePanel}
        closeButtonAriaLabel="Close"
        headerText={localization.Counterfactuals.panelHeader}
      >
        <Stack tokens={{ childrenGap: "m1" }}>
          <Stack.Item>
            <Text variant={"medium"}>
              {localization.Counterfactuals.panelDescription}
            </Text>
          </Stack.Item>
          <Stack.Item>
            <DetailsList
              items={this.state.items}
              columns={this.state.columns}
              selection={this.selection}
              selectionMode={SelectionMode.single}
              setKey="set"
              constrainMode={ConstrainMode.unconstrained}
              layoutMode={DetailsListLayoutMode.fixedColumns}
              onRenderDetailsFooter={this.onRenderDetailsFooter.bind(this)}
            />
          </Stack.Item>
          <Stack.Item>
            <Stack horizontal tokens={{ childrenGap: "15px" }}>
              <Stack.Item align="end" grow={1}>
                <TextField
                  id="whatIfNameLabel"
                  label={localization.Counterfactuals.counterfactualName}
                  value={this.props.temporaryPoint?.[WhatIfConstants.namePath]}
                  onChange={this.setCustomRowProperty.bind(
                    this,
                    WhatIfConstants.namePath,
                    true
                  )}
                  styles={{ fieldGroup: { width: 200 } }}
                />
              </Stack.Item>
              <Stack.Item align="end" grow={5}>
                <PrimaryButton
                  className={classes.button}
                  text={localization.Counterfactuals.saveAsNew}
                  onClick={this.handleSavePoint.bind(this)}
                />
              </Stack.Item>
              <Stack.Item align="end" grow={3}>
                <Text variant={"medium"}>
                  {localization.Counterfactuals.saveDescription}
                </Text>
              </Stack.Item>
            </Stack>
          </Stack.Item>
        </Stack>
      </Panel>
    );
  }
  private getItems(): any {
    const items: any = [];
    const selectedData = this.props.data?.cfsList[
      this.props.selectedIndex % this.props.data?.cfsList.length
    ];
    const originData = selectedData?.[0];
    if (selectedData && originData) {
      selectedData.forEach((point, i) => {
        const temp = {};
        this.props.data?.featureNames.forEach((f, j) => {
          if (f === "row") {
            temp[f] = `Row ${i}`;
          } else {
            temp[f] = i === 0 || originData[j] !== point[j] ? point[j] : "-";
          }
        });
        items.push(temp);
      });
    }
    return items;
  }
  private processSelectionData(items: any, row: number): any {
    const data = _.cloneDeep(items[row]);
    Object.keys(data).forEach(
      (k) => (data[k] = data[k] === "-" ? items[0][k] : data[k])
    );
    data["row"] = localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      row
    );
    return data;
  }
  private getColumns(): IColumn[] {
    const columns: IColumn[] = [];
    if (this.props.data) {
      this.props.data.featureNames.forEach((f) =>
        columns.push({
          fieldName: f,
          isResizable: true,
          key: f,
          minWidth: 150,
          name: f
        })
      );
    }
    return columns;
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
  private updateData(
    evt: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void {
    const target = evt.target as Element;
    const id = target.id;
    this.setState((prevState) => {
      prevState.data[id] = toNumber(newValue);
      return { data: prevState.data };
    });
  }
  private setCustomRowProperty = (
    key: string | number,
    isString: boolean,
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    this.props.setCustomRowProperty(key, isString, newValue);
  };
  private toggleCallout(): void {
    this.setState((preState) => {
      return {
        showCallout: !preState.showCallout
      };
    });
  }

  private handleSavePoint(): void {
    this.props.saveAsPoint();
    this.props.closePanel();
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
              label={column.key}
              id={column.key}
              disabled={column.key === "row"}
              onChange={this.updateData.bind(this)}
            />
          </Stack.Item>
          {column.key === this.state.columns[1].key && (
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
                    temporaryPoint={this.context.jointDataset.getRow(
                      this.props.selectedIndex
                    )}
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
}
