// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  Checkbox,
  ConstrainMode,
  DetailsList,
  DetailsListLayoutMode,
  DetailsRow,
  DetailsRowFields,
  getTheme,
  MarqueeSelection,
  PrimaryButton,
  IColumn,
  IRenderFunction,
  IDetailsRowFieldsProps,
  IDetailsRowProps,
  IFocusTrapZoneProps,
  IPanelProps,
  IPanelStyles,
  ISearchBoxStyles,
  ISettings,
  IStackTokens,
  IStyleFunctionOrObject,
  ITheme,
  Customizer,
  getId,
  Layer,
  LayerHost,
  Panel,
  ScrollablePane,
  Selection,
  SelectionMode,
  SearchBox,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { ITableState } from "../../Utils/DatasetUtils";

import { updateItems, updatePercents, sortByPercent } from "./FeatureListUtils";

export interface IFeatureListProps {
  isOpen: boolean;
  onDismiss: () => void;
  saveFeatures: (features: string[]) => void;
  features: string[];
  theme?: string;
  importances: number[];
  isEnabled: boolean;
  selectedFeatures: string[];
}

const focusTrapZoneProps: IFocusTrapZoneProps = {
  forceFocusInsideTrap: false,
  isClickableOutsideFocusTrap: true
};

const searchBoxStyles: Partial<ISearchBoxStyles> = { root: { width: 120 } };

// Used to add spacing between example checkboxes
const checkboxStackTokens: IStackTokens = {
  childrenGap: "s1",
  padding: 1
};

export interface IFeatureListState {
  searchedFeatures: string[];
  selectedFeatures: string[];
  percents: number[];
  sortedFeatures: string[];
  enableApplyButton: boolean;
  lastAppliedFeatures: Set<string>;
  tableState: ITableState;
}

const panelStyles: IStyleFunctionOrObject<IPanelProps, IPanelStyles> = {
  main: { zIndex: 1 }
};

export class FeatureList extends React.Component<
  IFeatureListProps,
  IFeatureListState
> {
  private layerHostId: string;
  private _selection: Selection;
  public constructor(props: IFeatureListProps) {
    super(props);
    const percents = updatePercents(this.props.importances);
    const [sortedPercents, sortedFeatures] = sortByPercent(
      percents,
      this.props.features
    );
    const searchedFeatures = sortedFeatures;
    const tableState = updateItems(
      sortedPercents,
      sortedFeatures,
      searchedFeatures,
      this.props.isEnabled
    );
    this.state = {
      enableApplyButton: false,
      lastAppliedFeatures: new Set<string>(this.props.features),
      percents: sortedPercents,
      searchedFeatures,
      selectedFeatures: this.props.selectedFeatures,
      sortedFeatures,
      tableState
    };
    this.layerHostId = getId("featuresListHost");
    this._selection = new Selection({
      onSelectionChanged: (): void => {
        const newSelectedFeatures = this.getSelectionDetails();
        const enableApplyButton =
          this.state.lastAppliedFeatures.size !== newSelectedFeatures.length ||
          newSelectedFeatures.some(
            (selectedFeature) =>
              !this.state.lastAppliedFeatures.has(selectedFeature)
          );
        this.setState({
          enableApplyButton,
          selectedFeatures: newSelectedFeatures
        });
      }
    });
    this.updateSelection();
  }

  public componentDidUpdate(prevProps: IFeatureListProps): void {
    if (this.props.importances !== prevProps.importances) {
      const percents = updatePercents(this.props.importances);
      const [sortedPercents, sortedFeatures] = sortByPercent(
        percents,
        this.props.features
      );
      const searchedFeatures = sortedFeatures.filter((sortedFeature) =>
        this.state.searchedFeatures.includes(sortedFeature)
      );
      const tableState = updateItems(
        sortedPercents,
        sortedFeatures,
        searchedFeatures,
        this.props.isEnabled
      );
      this.setState({
        percents: sortedPercents,
        searchedFeatures,
        sortedFeatures,
        tableState
      });
      this.updateSelection();
    }
  }

  public render(): React.ReactNode {
    const theme = getTheme();
    return (
      <Panel
        headerText="Feature List"
        isOpen={this.props.isOpen}
        focusTrapZoneProps={focusTrapZoneProps}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        // layerProps={{ hostId: this.props.hostId }}
        isBlocking={false}
        onDismiss={this.props.onDismiss}
        styles={panelStyles}
      >
        <div className="featuresSelector">
          <Stack tokens={checkboxStackTokens} verticalAlign="space-around">
            <Stack.Item key="decisionTreeKey" align="start">
              <Text key="decisionTreeTextKey" variant="medium">
                {localization.ErrorAnalysis.treeMapDescription}
              </Text>
            </Stack.Item>
            <Stack.Item key="searchKey" align="start">
              <SearchBox
                placeholder="Search"
                styles={searchBoxStyles}
                onSearch={this.onSearch.bind(this)}
                onClear={this.onSearch.bind(this)}
                onChange={(_, newValue?: string): void => {
                  if (newValue === undefined) return;

                  this.onSearch.bind(this)(newValue);
                }}
              />
            </Stack.Item>
            <Customizer
              settings={(currentSettings): ISettings => ({
                ...currentSettings,
                hostId: this.layerHostId
              })}
            >
              <Layer>
                <ScrollablePane>
                  <MarqueeSelection
                    selection={this._selection}
                    isEnabled={this.props.isEnabled}
                  >
                    <DetailsList
                      items={this.state.tableState.rows}
                      columns={this.state.tableState.columns}
                      setKey="set"
                      layoutMode={DetailsListLayoutMode.fixedColumns}
                      constrainMode={ConstrainMode.unconstrained}
                      onRenderItemColumn={this.renderItemColumn.bind(
                        this,
                        theme
                      )}
                      selectionPreservedOnEmptyClick={true}
                      ariaLabelForSelectionColumn="Toggle selection"
                      ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                      checkButtonAriaLabel="Row checkbox"
                      selectionMode={
                        this.props.isEnabled
                          ? SelectionMode.multiple
                          : SelectionMode.none
                      }
                      selection={this._selection}
                      onRenderRow={this.renderRow.bind(this)}
                    />
                  </MarqueeSelection>
                </ScrollablePane>
              </Layer>
            </Customizer>
            <LayerHost
              id={this.layerHostId}
              style={{
                height: "500px",
                overflow: "hidden",
                position: "relative"
              }}
            />
            <Stack.Item key="applyButtonKey" align="start">
              <PrimaryButton
                text="Apply"
                onClick={this.apply.bind(this)}
                allowDisabledFocus
                disabled={!this.state.enableApplyButton}
                checked={false}
              />
            </Stack.Item>
          </Stack>
        </div>
      </Panel>
    );
  }

  private renderRow: IRenderFunction<IDetailsRowProps> = (
    props?: IDetailsRowProps
  ): JSX.Element | null => {
    if (!props) return <div></div>;

    return (
      <DetailsRow rowFieldsAs={this.renderRowFields.bind(this)} {...props} />
    );
  };

  private renderRowFields(props: IDetailsRowFieldsProps): JSX.Element {
    if (this.props.isEnabled) return <DetailsRowFields {...props} />;

    return (
      <span data-selection-disabled={true}>
        <DetailsRowFields {...props} />
      </span>
    );
  }

  private renderItemColumn(
    theme: ITheme,
    item: any,
    index?: number,
    column?: IColumn
  ): React.ReactNode {
    if (column && index !== undefined) {
      const fieldContent = item[column.fieldName as keyof any] as string;

      switch (column.key) {
        case "checkbox":
          if (this.state.selectedFeatures.includes(fieldContent))
            return <Checkbox checked={true} disabled />;

          return <Checkbox checked={false} disabled />;
        case "importances":
          return (
            <svg width="100px" height="6px">
              <g>
                <rect
                  fill={theme.palette.neutralQuaternary}
                  width="100%"
                  height="4"
                  rx="5"
                ></rect>
                <rect
                  fill={theme.palette.neutralSecondary}
                  width={`${fieldContent}%`}
                  height="4"
                  rx="5"
                ></rect>
              </g>
            </svg>
          );

        default:
          return <span>{fieldContent}</span>;
      }
    }
    return <span></span>;
  }

  private updateSelection(): void {
    this._selection.setItems(this.state.tableState.rows);
    const featureNames = this.state.tableState.rows.map((row) => row[0]);
    featureNames.forEach((feature, index) => {
      if (this.state.selectedFeatures.includes(feature))
        this._selection.setIndexSelected(index, true, true);
    });
  }

  private getSelectionDetails(): string[] {
    const selectedRows = this._selection.getSelection();
    const keys = selectedRows.map((row) => row[0] as string);
    return keys;
  }

  private onSearch(searchValue: string): void {
    this.setState({
      searchedFeatures: this.props.features.filter((feature) =>
        feature.includes(searchValue)
      )
    });
  }

  private apply(): void {
    this.props.saveFeatures(this.state.selectedFeatures);
    this.setState({
      enableApplyButton: false,
      lastAppliedFeatures: new Set<string>(this.state.selectedFeatures)
    });
  }
}
