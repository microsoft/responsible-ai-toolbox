import React from "react";
import { matrixAreaStyles } from "./MatrixArea.styles";
import { mergeStyles, IStyle } from "office-ui-fabric-react";
import { lab as Lab } from "d3-color";
import { scaleLinear as d3scaleLinear } from "d3-scale";
import { interpolateHcl as d3interpolateHcl } from "d3-interpolate";

export interface IMatrixAreaProps {
  theme?: string;
  features: string[];
  selectedFeature1: string;
  selectedFeature2: string;
  getMatrix: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
}

export interface IMatrixAreaState {
  matrix: Array<any>;
  maxErrorRate: number;
  selectedCells: Array<boolean>;
}

export class MatrixArea extends React.PureComponent<
  IMatrixAreaProps,
  IMatrixAreaState
> {
  constructor(props: IMatrixAreaProps) {
    super(props);
    this.state = {
      matrix: null,
      maxErrorRate: 0,
      selectedCells: null
    };
    this.fetchMatrix();
  }

  public componentDidUpdate(prevProps: IMatrixAreaProps): void {
    var selectedFeature1Changed =
      this.props.selectedFeature1 != prevProps.selectedFeature1;
    var selectedFeature2Changed =
      this.props.selectedFeature2 != prevProps.selectedFeature2;
    if (selectedFeature1Changed || selectedFeature2Changed) {
      this.fetchMatrix();
    }
  }

  private fetchMatrix() {
    if (this.props.getMatrix === undefined) {
      return;
    }
    this.props
      .getMatrix(
        [this.props.selectedFeature1, this.props.selectedFeature2],
        new AbortController().signal
      )
      .then((result) => {
        this.reloadData(result);
      });
  }

  public reloadData(matrix) {
    var maxErrorRate = 0;
    matrix.map((row, i) => {
      row.map((value, j) => {
        Math.max(maxErrorRate, (value.falseCount / value.count) * 100);
      });
    });
    this.setState({
      matrix: matrix,
      maxErrorRate: maxErrorRate,
      selectedCells: null
    });
  }

  public render(): React.ReactNode {
    let classNames = matrixAreaStyles();
    if (
      !this.state.matrix ||
      (this.props.selectedFeature1 == null &&
        this.props.selectedFeature2 == null)
    )
      return null;
    var rows = 0;
    if (this.props.selectedFeature2 !== null) {
      var rows = Math.floor((this.state.matrix.length - 1) / 2);
    } else {
      var rows = this.state.matrix.length / 2;
    }
    var topPadding = rows * 50 - 14 + 60;
    var styledMatrixLabel: IStyle = mergeStyles([
      classNames.matrixLabel,
      {
        paddingTop: `${topPadding}px`
      }
    ]);
    var matrixLength = this.state.matrix.length;
    return (
      <>
        <div className={classNames.matrixArea}>
          <div>
            {this.props.selectedFeature2 !== null && (
              <div className={classNames.matrixLabelBottom}>
                <div className={classNames.matrixLabelTab}></div>
                <div>{this.props.selectedFeature2}</div>
              </div>
            )}
            {this.props.selectedFeature2 === null && (
              <div className={classNames.emptyLabelPadding}></div>
            )}

            {this.state.matrix.map((row, i) => (
              <div key={`${i}row`} className={classNames.matrixRow}>
                {row.map((value, j) => {
                  if (j === 0) {
                    if (
                      i === matrixLength - 1 ||
                      this.props.selectedFeature2 === null
                    ) {
                      return (
                        <div
                          key={`${i}_${j}category1`}
                          className={classNames.matrixCellPivot1Categories}
                        ></div>
                      );
                    } else {
                      return (
                        <div
                          key={`${i}_${j}category1`}
                          className={classNames.matrixCellPivot1Categories}
                        >
                          {value.category1}
                        </div>
                      );
                    }
                  } else if (i === matrixLength - 1) {
                    return (
                      <div
                        key={`${i}_${j}category2`}
                        className={classNames.matrixCellPivot2Categories}
                      >
                        {value.category2}
                      </div>
                    );
                  } else {
                    {
                      /* Value Cells */
                    }
                    var errorRatio = (value.falseCount / value.count) * 100;
                    var bkgcolor = this.colorLookup(errorRatio);
                    var color = this.textColorForBackground(bkgcolor);
                    var styledGradientMatrixCell: IStyle = mergeStyles([
                      classNames.styledMatrixCell,
                      {
                        background: bkgcolor,
                        color: color
                      }
                    ]);
                    if (
                      this.state.selectedCells != null &&
                      this.state.selectedCells[j + i * row.length]
                    ) {
                      styledGradientMatrixCell = mergeStyles([
                        styledGradientMatrixCell,
                        classNames.selectedMatrixCell
                      ]);
                    }
                    return (
                      <div
                        key={`${i}_${j}cell`}
                        className={classNames.matrixCell}
                        onClick={this.selectedCellHandler.bind(
                          this,
                          i,
                          j,
                          matrixLength,
                          row.length
                        )}
                      >
                        <div className={styledGradientMatrixCell}>
                          {`${errorRatio.toFixed(0)}%`}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            ))}
          </div>
          <div className={styledMatrixLabel}>{this.props.selectedFeature1}</div>
        </div>
      </>
    );
  }

  private selectedCellHandler(
    i: number,
    j: number,
    matrixLength: number,
    rowLength: number,
    event: React.MouseEvent<HTMLElement>
  ) {
    var selectedCells = this.state.selectedCells;
    if (selectedCells == null) {
      selectedCells = new Array<boolean>(matrixLength * rowLength);
    } else {
      // Need to make a copy so setState re-renders
      selectedCells = [...this.state.selectedCells];
    }
    var index = j + i * rowLength;
    selectedCells[index] = !selectedCells[index];
    this.setState({ selectedCells: selectedCells });
  }

  private mapRange(outputMin, outputMax, value) {
    return outputMin + (outputMax - outputMin) * value;
  }

  private colorgradRatio(value) {
    return d3scaleLinear<string>()
      .domain([0, 1])
      .interpolate(d3interpolateHcl)
      .range(["#F4D1D2", "#8d2323"])(value);
  }

  private colorLookup(ratio) {
    let result = "#eaeaea";

    if (!ratio) return result;

    const rate = ratio / 100;
    if (rate > 0.01 && rate <= 1) {
      result = this.colorgradRatio(this.mapRange(0, 1, rate));
    } else result = "#ffffff";

    return result;
  }

  private textColorForBackground(colorStr) {
    return this.isColorDark(colorStr) ? "white" : "rgba(0,0,0,0.8)";
  }

  private isColorDark(colorStr) {
    const val = Lab(colorStr).l;
    return val <= 65;
  }
}
