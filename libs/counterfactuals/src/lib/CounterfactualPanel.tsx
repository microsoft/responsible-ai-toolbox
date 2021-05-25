// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICounterfactualData } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
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
  IColumn
} from "office-ui-fabric-react";
import React from "react";

import { counterfactualPanelStyles } from "./CounterfactualPanelStyles";

export interface ICounterfactualPanelProps {
  selectedIndex: number;
  data?: ICounterfactualData;
  isPanelOpen: boolean;
  closePanel(): void;
}

export class CounterfactualPanel extends React.Component<
  ICounterfactualPanelProps
> {
  public render(): React.ReactNode {
    const classes = counterfactualPanelStyles();
    const items: any = [];
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
    const selectedData = this.props.data?.cfsList[
      this.props.selectedIndex % this.props.data?.cfsList.length
    ];
    const originData = selectedData?.[0];
    if (selectedData && originData) {
      selectedData.forEach((point, i) => {
        const temp = {};
        this.props.data?.featureNames.forEach((f, j) => {
          temp[f] = i === 0 || originData[j] !== point[j] ? point[j] : "-";
        });
        items.push(temp);
      });
    }
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
              items={items}
              columns={columns}
              setKey="set"
              constrainMode={ConstrainMode.unconstrained}
              layoutMode={DetailsListLayoutMode.fixedColumns}
              // onRenderDetailsFooter={this.onRenderDetailsFooter.bind(this)}
            />
          </Stack.Item>
          <Stack.Item>
            <Stack horizontal tokens={{ childrenGap: "15px" }}>
              <Stack.Item grow={1}>
                <TextField
                  id="whatIfNameLabel"
                  label={localization.Counterfactuals.counterfactualName}
                  value={"aaa"}
                  styles={{ fieldGroup: { width: 200 } }}
                />
              </Stack.Item>
              <Stack.Item grow={3}>
                <PrimaryButton
                  className={classes.button}
                  // onClick={this.togglePanel}
                  text={localization.Counterfactuals.saveAsNew}
                />
              </Stack.Item>
              <Stack.Item grow={3}>
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
  // private onRenderDetailsFooter(
  //   detailsFooterProps: IDetailsFooterProps
  // ): JSX.Element {
  //   return (
  //     <DetailsRow
  //       {...detailsFooterProps}
  //       columns={detailsFooterProps.columns}
  //       item={{}}
  //       itemIndex={-1}
  //       groupNestingDepth={detailsFooterProps.groupNestingDepth}
  //       selectionMode={SelectionMode.single}
  //       selection={detailsFooterProps.selection}
  //       onRenderItemColumn={this.renderDetailsFooterItemColumn.bind(this)}
  //       onRenderCheck={this.onRenderCheckForFooterRow.bind(this)}
  //     />
  //   );
  // }
  // private renderDetailsFooterItemColumn(
  //   item: any,
  //   index: any,
  //   column: any
  // ): React.ReactNode | undefined {
  //   if (column) {
  //     return (
  //       <div>
  //         <b>{column.name + "AAA"}</b>
  //       </div>
  //     );
  //   }
  //   return undefined;
  // }

  // private onRenderCheckForFooterRow(props: any): JSX.Element {
  //   return <DetailsRowCheck {...props} selected />;
  // }
}
