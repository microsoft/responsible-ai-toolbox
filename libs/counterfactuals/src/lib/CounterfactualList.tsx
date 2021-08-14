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
  Link,
  SelectionMode,
  Stack,
  Text,
  TextField
} from "office-ui-fabric-react";
import React from "react";

import { CustomPredictionLabels } from "./CustomPredictionLabels";
import { ILocalImportanceData } from "./LocalImportanceChart";

export interface ICounterfactualListProps {
  selectedIndex: number;
  originalData: { [key: string]: string | number };
  data?: ICounterfactualData;
  filterText?: string;
  temporaryPoint: Record<string, string | number> | undefined;
  sortFeatures: boolean;
  setCustomRowProperty(
    key: string | number,
    isString: boolean,
    newValue?: string | number
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

  public componentDidMount() {
    this.onSelect(0);
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
        selectionMode={SelectionMode.none}
        setKey="set"
        constrainMode={ConstrainMode.unconstrained}
        layoutMode={DetailsListLayoutMode.fixedColumns}
        onRenderDetailsFooter={this.onRenderDetailsFooter}
      />
    );
  }

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

  private onSelect(idx: number): void {
    const items = this.getItems();
    const data = _.cloneDeep(items[idx]);
    Object.keys(data).forEach((k) => {
      data[k] = data[k] === "-" ? items[0][k] : data[k];
      const keyIndex =
        this.props.data?.feature_names_including_target.indexOf(k);
      this.props.setCustomRowProperty(`Data${keyIndex}`, false, data[k]);
    });
    data.row = localization.formatString(
      localization.Interpret.WhatIf.defaultCustomRootName,
      this.props.selectedIndex
    );
    this.setState({ data });
  }

  private renderName = (
    item?: Record<string, string | number>,
    index?: number | undefined
  ) => {
    //footer
    if (index === -1) {
      return (
        <Stack>
          <Stack.Item>
            <TextField
              value={this.state.data[nameColumnKey]?.toString()}
              label={localization.Counterfactuals.createOwn}
              id={nameColumnKey}
              disabled
              onChange={this.updateColValue}
            />
          </Stack.Item>
          <Stack.Item>
            <Link id={"predictionLink"} onClick={this.toggleCallout}>
              {localization.Counterfactuals.seePrediction}
            </Link>
            {this.state.showCallout && (
              <Callout
                target={"#predictionLink"}
                onDismiss={this.toggleCallout}
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
        </Stack>
      );
    }
    if (index === undefined || !item?.row) return React.Fragment;
    return (
      <Stack>
        <Text>{item.row}</Text>
        <Link onClick={this.onSelect.bind(this, index)}>
          {localization.Counterfactuals.WhatIf.setValue}
        </Link>
      </Stack>
    );
  };
  private getColumns(): IColumn[] {
    const columns: IColumn[] = [];
    const featureNames = this.getFilterFeatures();
    if (!featureNames || featureNames.length === 0) {
      return columns;
    }
    columns.push({
      fieldName: nameColumnKey,
      isResizable: true,
      key: nameColumnKey,
      minWidth: 200,
      name: "",
      onRender: this.renderName
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

  private updateColValue = (
    evt: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    const target = evt.target as Element;
    const id = target.id;
    const keyIndex =
      this.props.data?.feature_names_including_target.indexOf(id);
    this.props.setCustomRowProperty(`Data${keyIndex}`, false, newValue);
    this.setState((prevState) => {
      prevState.data[id] = toNumber(newValue);
      return { data: prevState.data };
    });
  };

  private toggleCallout = (): void => {
    this.setState((preState) => {
      return {
        showCallout: !preState.showCallout
      };
    });
  };

  private renderDetailsFooterItemColumn = (
    _item: Record<string, string | number>,
    _index?: number,
    column?: IColumn
  ): React.ReactNode | undefined => {
    if (column) {
      return (
        <Stack horizontal={false}>
          <Stack.Item>
            <TextField
              value={this.state.data[column.key]?.toString()}
              label={column.key}
              id={column.key}
              onChange={this.updateColValue}
            />
          </Stack.Item>
        </Stack>
      );
    }
    return undefined;
  };

  private onRenderDetailsFooter = (
    detailsFooterProps?: IDetailsFooterProps
  ): JSX.Element => {
    if (detailsFooterProps) {
      return (
        <DetailsRow
          {...detailsFooterProps}
          columns={detailsFooterProps.columns}
          item={this.state.data}
          itemIndex={-1}
          groupNestingDepth={detailsFooterProps.groupNestingDepth}
          selectionMode={SelectionMode.none}
          onRenderItemColumn={this.renderDetailsFooterItemColumn}
        />
      );
    }
    return <div />;
  };

  private getFilterFeatures = (): string[] => {
    const allFeatures = this.getSortedFeatureNames();
    const filterText = this.props.filterText;
    const invalidInput =
      filterText === undefined || filterText === null || !/\S/.test(filterText);
    const filtered = invalidInput
      ? allFeatures
      : allFeatures.filter((f) => toLower(f).includes(toLower(filterText)));
    return filtered;
  };

  private getSortedFeatureNames(): string[] {
    const data: ILocalImportanceData[] = [];
    const localImportanceData =
      this.props.data?.local_importance?.[this.props.selectedIndex];
    if (!localImportanceData || !this.props.sortFeatures) {
      return this.props?.data?.feature_names_including_target || [];
    }
    this.props?.data?.feature_names_including_target.forEach((f, index) => {
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
