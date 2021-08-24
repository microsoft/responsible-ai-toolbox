// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CohortSource,
  IErrorAnalysisMatrixNode
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  DefaultButton,
  mergeStyles,
  IStackStyles,
  IStackTokens,
  IStyle,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { IMatrixAreaState } from "../../MatrixFilterState";
import { MatrixCells } from "../MatrixCells/MatrixCells";
import { MatrixFooter } from "../MatrixFooter/MatrixFooter";

import { matrixAreaStyles } from "./MatrixArea.styles";
import { IMatrixAreaProps } from "./MatrixAreaProps";
import {
  createCompositeFilterFromCells,
  createCohortStatsFromSelectedCells,
  extractCategories,
  fetchMatrix
} from "./MatrixAreaUtils";

const emptyTextStyle: IStackStyles = {
  root: {
    width: 300
  }
};

const emptyTextPadding: IStackTokens = { padding: "10px 0px 0px 0px" };

const stackTokens: IStackTokens = { childrenGap: 5 };

export class MatrixArea extends React.PureComponent<
  IMatrixAreaProps,
  IMatrixAreaState
> {
  public constructor(props: IMatrixAreaProps) {
    super(props);
    this.state = {
      disableClearAll: this.props.state.disableClearAll,
      disableSelectAll: this.props.state.disableSelectAll,
      jsonMatrix: this.props.state.jsonMatrix,
      matrixFeature1: this.props.selectedFeature1,
      matrixFeature2: this.props.selectedFeature2,
      maxMetricValue: this.props.state.maxMetricValue,
      selectedCells: this.props.state.selectedCells
    };
    if (this.props.state.selectedCells === undefined) {
      this.reloadData();
    }
  }

  public componentDidUpdate(prevProps: IMatrixAreaProps): void {
    const selectedFeature1Changed =
      this.props.selectedFeature1 !== prevProps.selectedFeature1;
    const selectedFeature2Changed =
      this.props.selectedFeature2 !== prevProps.selectedFeature2;
    if (
      selectedFeature1Changed ||
      selectedFeature2Changed ||
      this.props.baseCohort !== prevProps.baseCohort
    ) {
      this.reloadData();
    }
  }

  public componentWillUnmount(): void {
    this.props.setMatrixAreaState(this.state);
  }

  public render(): React.ReactNode {
    const classNames = matrixAreaStyles();
    // Note: we render as empty if: 1.) there is no matrix 2.) all features set to empty
    // 3.) when user first changes feature a render is triggered but componentDidUpdate
    // is only called after initial render is done, which would be an inconsistent state
    // Note in third case we just show empty and not the help text
    if (!this.state.jsonMatrix) {
      return (
        <Stack styles={emptyTextStyle} tokens={emptyTextPadding}>
          <Text variant="medium">
            {localization.ErrorAnalysis.MatrixArea.emptyText}
          </Text>
        </Stack>
      );
    }
    if (
      this.state.matrixFeature1 !== this.props.selectedFeature1 ||
      this.state.matrixFeature2 !== this.props.selectedFeature2
    ) {
      return <div />;
    }
    const sameFeatureSelected =
      this.props.selectedFeature1 === this.props.selectedFeature2;
    let rows = 0;
    if (this.props.selectedFeature2 && !sameFeatureSelected) {
      rows = Math.floor((this.state.jsonMatrix.matrix.length - 1) / 2);
    } else {
      rows = this.state.jsonMatrix.matrix.length / 2;
    }
    const topPadding = rows * 50 - 14 + 60;
    const styledMatrixLabel: IStyle = mergeStyles([
      classNames.matrixLabel,
      {
        paddingTop: `${topPadding}px`
      }
    ]);
    const matrixLength = this.state.jsonMatrix.matrix.length;
    const matrixRowLength = this.state.jsonMatrix.matrix[0].length;
    // Extract categories
    const [category1Values] = extractCategories(
      this.state.jsonMatrix.category1
    );
    const [category2Values] = extractCategories(
      this.state.jsonMatrix.category2
    );
    return (
      <Stack>
        <Stack horizontal tokens={stackTokens}>
          <DefaultButton
            text={localization.ErrorAnalysis.MatrixArea.clearAll}
            onClick={this.clearAll.bind(this, matrixLength, matrixRowLength)}
            disabled={this.state.disableClearAll}
          />
          <DefaultButton
            text={localization.ErrorAnalysis.MatrixArea.selectAll}
            onClick={this.selectAll.bind(this, matrixLength, matrixRowLength)}
            disabled={this.state.disableSelectAll}
          />
        </Stack>
        <Stack
          horizontal
          tokens={stackTokens}
          className={classNames.matrixArea}
        >
          <Stack.Item>
            {this.props.selectedFeature2 && !sameFeatureSelected && (
              <div className={classNames.matrixLabelBottom}>
                <div className={classNames.matrixLabelTab} />
                <div>{this.props.selectedFeature2}</div>
              </div>
            )}
            <MatrixCells
              jsonMatrix={this.state.jsonMatrix}
              selectedFeature1={this.props.selectedFeature1}
              selectedFeature2={this.props.selectedFeature2}
              selectedCells={this.state.selectedCells}
              category1Values={category1Values}
              sameFeatureSelected={sameFeatureSelected}
              selectedCellHandler={this.selectedCellHandler.bind(this)}
            />
            <MatrixFooter
              jsonMatrix={this.state.jsonMatrix}
              selectedFeature1={this.props.selectedFeature1}
              selectedFeature2={this.props.selectedFeature2}
              selectedCells={this.state.selectedCells}
              category1Values={category1Values}
              category2Values={category2Values}
              sameFeatureSelected={sameFeatureSelected}
              matrixLength={matrixLength}
            />
          </Stack.Item>
          <Stack.Item>
            {this.props.selectedFeature1 && (
              <div className={styledMatrixLabel}>
                {this.props.selectedFeature1}
              </div>
            )}
          </Stack.Item>
        </Stack>
      </Stack>
    );
  }

  private reloadData = async (): Promise<void> => {
    const jsonMatrix = await fetchMatrix(this.props);
    if (!jsonMatrix) {
      return;
    }
    let maxMetricValue = 0;
    jsonMatrix.matrix.forEach((row: IErrorAnalysisMatrixNode[]): void => {
      row.forEach((value: IErrorAnalysisMatrixNode): void => {
        if (value.falseCount !== undefined) {
          const errorRate = value.falseCount / value.count;
          if (!Number.isNaN(errorRate)) {
            maxMetricValue = Math.max(maxMetricValue, errorRate);
          }
        } else if (value.metricValue !== undefined) {
          const metricValue = value.metricValue;
          if (!Number.isNaN(metricValue)) {
            maxMetricValue = Math.max(maxMetricValue, metricValue);
          }
        }
      });
    });
    this.props.updateMatrixLegendState(maxMetricValue);
    this.setState({
      disableClearAll: true,
      disableSelectAll: false,
      jsonMatrix,
      matrixFeature1: this.props.selectedFeature1,
      matrixFeature2: this.props.selectedFeature2,
      maxMetricValue,
      selectedCells: undefined
    });
  };

  private selectAll(matrixLength: number, rowLength: number): void {
    const size = matrixLength * rowLength;
    const selectedCells = new Array<boolean>(size);
    for (let i = 0; i < size; i++) {
      selectedCells[i] = true;
    }
    this.setState({
      disableClearAll: false,
      disableSelectAll: true,
      selectedCells
    });
    this.updateStateFromSelectedCells(selectedCells);
  }

  private clearAll(matrixLength: number, rowLength: number): void {
    const size = matrixLength * rowLength;
    const selectedCells = new Array<boolean>(size);
    this.setState({
      disableClearAll: true,
      disableSelectAll: false,
      selectedCells
    });
    this.updateStateFromSelectedCells(selectedCells);
  }

  private selectedCellHandler(
    i: number,
    j: number,
    matrixLength: number,
    rowLength: number
  ): void {
    let selectedCells = this.state.selectedCells;
    if (selectedCells === undefined) {
      selectedCells = new Array<boolean>(matrixLength * rowLength);
    } else {
      // Need to make a copy so setState re-renders
      selectedCells = [...selectedCells];
    }
    const index = j + i * rowLength;
    selectedCells[index] = !selectedCells[index];
    let disableClearAll = false;
    let disableSelectAll = false;
    if (selectedCells.every((value) => value)) {
      disableClearAll = false;
      disableSelectAll = true;
    } else if (selectedCells.every((value) => !value)) {
      disableClearAll = true;
      disableSelectAll = false;
    }
    this.setState({
      disableClearAll,
      disableSelectAll,
      selectedCells
    });
    this.updateStateFromSelectedCells(selectedCells);
  }

  private updateStateFromSelectedCells(selectedCells: boolean[]): void {
    if (!this.state.jsonMatrix) {
      return;
    }
    // Create a composite filter from the selected cells
    const compositeFilter = createCompositeFilterFromCells(
      selectedCells,
      this.state.jsonMatrix,
      this.props.selectedFeature1,
      this.props.selectedFeature2,
      this.props.baseCohort,
      this.props.features
    );
    const cells = selectedCells.filter(Boolean).length;
    const cohortStats = createCohortStatsFromSelectedCells(
      selectedCells,
      this.state.jsonMatrix
    );
    this.props.updateSelectedCohort(
      [],
      compositeFilter,
      CohortSource.HeatMap,
      cells,
      cohortStats
    );
  }
}
