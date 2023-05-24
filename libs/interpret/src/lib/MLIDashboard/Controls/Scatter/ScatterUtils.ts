// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  DropdownMenuItemType,
  IDropdownOption
} from "@fluentui/react";
import {
  PartialRequired2,
  IExplanationContext,
  IExplanationModelMetadata,
  IsBinary,
  ModelTypes
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  AccessorMappingFunctionNames,
  ChartBuilder,
  IPlotlyProperty,
  PlotlyMode,
  SelectionContext
} from "@responsible-ai/mlchartlib";
import _ from "lodash";
import memoize from "memoize-one";

import { IDashboardContext } from "../../ExplanationDashboard";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import { PlotlyUtils } from "../../SharedComponents/PlotlyUtils";

export interface IScatterProps {
  plotlyProps: IPlotlyProperty;
  selectionContext: SelectionContext;
  selectedRow?: number;
  theme?: string;
  messages?: HelpMessageDict;
  dashboardContext: IDashboardContext;
  onChange: (props: IPlotlyProperty, id: string) => void;
}

export interface IProjectedData {
  TrainingData: any[];
  LocalExplanation?: number[];
  ProbabilityY?: number[];
  Index: string;
  PredictedY?: string | number;
  TrueY?: string | number;
  PredictedYClassIndex?: number;
  TrueYClassIndex?: number;
}

export class ScatterUtils {
  public static populatePlotlyProps: (
    data: IProjectedData[],
    plotlyProps: IPlotlyProperty
  ) => IPlotlyProperty = memoize(
    (data: IProjectedData[], plotlyProps: IPlotlyProperty): IPlotlyProperty => {
      const result = _.cloneDeep(plotlyProps);
      result.data = result.data
        .map((series) => ChartBuilder.buildPlotlySeries(series, data) as any)
        .reduce((prev, curr) => {
          prev.push(...curr);
          return prev;
        }, []);
      return result as any;
    }
  );

  public static buildOptions: (
    explanationContext: IExplanationContext,
    includeFeatureImportance: boolean
  ) => IDropdownOption[] = memoize(
    (
      explanationContext: IExplanationContext,
      includeFeatureImportance: boolean
    ): IDropdownOption[] => {
      const result: IDropdownOption[] = [];
      if (includeFeatureImportance) {
        result.push({
          itemType: DropdownMenuItemType.Header,
          key: "Header0",
          text: localization.Interpret.featureImportance
        });
        explanationContext.modelMetadata.featureNames.forEach(
          (featureName, index) => {
            result.push({
              data: { isCategorical: false, isFeatureImportance: true },
              key: `LocalExplanation[${index}]`,
              text: localization.formatString(
                localization.Interpret.ExplanationScatter.importanceLabel,
                featureName
              )
            });
          }
        );
      }
      result.push({
        itemType: DropdownMenuItemType.Divider,
        key: "divider1",
        text: "-"
      });
      result.push({
        itemType: DropdownMenuItemType.Header,
        key: "Header1",
        text: localization.Interpret.ExplanationScatter.dataGroupLabel
      });
      explanationContext.modelMetadata.featureNames.forEach(
        (featureName, index) => {
          result.push({
            data: {
              isCategorical:
                explanationContext.modelMetadata.featureIsCategorical?.[index]
            },
            key: `TrainingData[${index}]`,
            text: includeFeatureImportance
              ? localization.formatString(
                  localization.Interpret.ExplanationScatter.dataLabel,
                  featureName
                )
              : featureName
          });
        }
      );
      result.push({
        data: { isCategorical: false },
        key: "Index",
        text: localization.Interpret.ExplanationScatter.index
      });
      result.push({
        itemType: DropdownMenuItemType.Divider,
        key: "divider2",
        text: "-"
      });
      result.push({
        itemType: DropdownMenuItemType.Header,
        key: "Header2",
        text: localization.Interpret.ExplanationScatter.output
      });
      if (explanationContext.testDataset.predictedY) {
        result.push({
          data: {
            isCategorical:
              explanationContext.modelMetadata.modelType !==
              ModelTypes.Regression,
            sortProperty:
              explanationContext.modelMetadata.modelType !==
              ModelTypes.Regression
                ? "PredictedYClassIndex"
                : undefined
          },
          key: "PredictedY",
          text: localization.Interpret.ExplanationScatter.predictedY
        });
      }
      if (explanationContext.testDataset.probabilityY) {
        explanationContext.testDataset.probabilityY[0].forEach((_, index) => {
          let className = explanationContext.modelMetadata.classNames[index];
          if (!className) {
            className = `class ${index}`;
          }
          result.push({
            data: { isCategorical: false },
            key: `ProbabilityY[${index}]`,
            text: localization.formatString(
              localization.Interpret.ExplanationScatter.probabilityLabel,
              className
            )
          });
        });
      }
      if (explanationContext.testDataset.trueY) {
        result.push({
          data: {
            isCategorical:
              explanationContext.modelMetadata.modelType !==
              ModelTypes.Regression,
            sortProperty:
              explanationContext.modelMetadata.modelType !==
              ModelTypes.Regression
                ? "TrueYClassIndex"
                : undefined
          },
          key: "TrueY",
          text: localization.Interpret.ExplanationScatter.trueY
        });
      }
      return result;
    }
  );

  // The chartBuilder util works best with arrays of objects, rather than an object with array props.
  // Just re-zipper to form;
  public static projectData: (
    explanationContext: PartialRequired2<
      IExplanationContext,
      "testDataset",
      "dataset"
    >
  ) => IProjectedData[] = memoize(
    (
      explanationContext: PartialRequired2<
        IExplanationContext,
        "testDataset",
        "dataset"
      >
    ): IProjectedData[] => {
      return explanationContext.testDataset.dataset.map(
        (featuresArray, rowIndex) => {
          const result: IProjectedData = {
            Index: rowIndex.toString(),
            TrainingData: featuresArray
          };
          if (
            explanationContext.localExplanation &&
            explanationContext.localExplanation.flattenedValues
          ) {
            result.LocalExplanation =
              explanationContext.localExplanation.flattenedValues[rowIndex];
          }
          if (explanationContext.testDataset.probabilityY) {
            result.ProbabilityY =
              explanationContext.testDataset.probabilityY[rowIndex];
          }
          if (explanationContext.testDataset.predictedY) {
            const rawPrediction =
              explanationContext.testDataset.predictedY[rowIndex];
            if (
              explanationContext.modelMetadata.modelType ===
              ModelTypes.Regression
            ) {
              result.PredictedY = rawPrediction;
            } else {
              result.PredictedYClassIndex = rawPrediction;
              result.PredictedY =
                explanationContext.modelMetadata.classNames[rawPrediction];
            }
          }
          if (explanationContext.testDataset.trueY) {
            const rawTruth = explanationContext.testDataset.trueY[rowIndex];
            if (
              explanationContext.modelMetadata.modelType ===
              ModelTypes.Regression
            ) {
              result.TrueY = rawTruth;
            } else {
              result.TrueY =
                explanationContext.modelMetadata.classNames[rawTruth];
              result.TrueYClassIndex = rawTruth;
            }
          }
          return result;
        }
      );
    }
  );
  private static baseScatterProperties: IPlotlyProperty = {
    config: { displaylogo: false, displayModeBar: false, responsive: true },
    data: [
      {
        datapointLevelAccessors: {
          customdata: {
            path: ["Index"],
            plotlyPath: "customdata"
          },
          text: {
            mapFunction: AccessorMappingFunctionNames.StringifyText,
            path: [],
            plotlyPath: "text"
          }
        },
        hoverinfo: "text",
        mode: PlotlyMode.Markers,
        type: "scattergl"
      }
    ],
    layout: {
      autosize: true,
      dragmode: false,
      font: {
        size: 10
      },
      hovermode: "closest",
      margin: {
        t: 10
      },
      showlegend: false,
      yaxis: {
        automargin: true
      }
    } as any
  };

  public static defaultDataExpPlotlyProps(
    exp: IExplanationContext
  ): IPlotlyProperty {
    let maxIndex = 0;
    let maxVal: number = Number.MIN_SAFE_INTEGER;

    if (
      exp.globalExplanation &&
      exp.globalExplanation.perClassFeatureImportances
    ) {
      // Find the top metric
      exp.globalExplanation.perClassFeatureImportances
        .map((classArray) => classArray.reduce((a, b) => a + b), 0)
        .forEach((val, index) => {
          if (val >= maxVal) {
            maxIndex = index;
            maxVal = val;
          }
        });
    }

    if (
      exp.globalExplanation &&
      exp.globalExplanation.flattenedFeatureImportances
    ) {
      exp.globalExplanation.flattenedFeatureImportances.forEach(
        (val, index) => {
          if (val >= maxVal) {
            maxIndex = index;
            maxVal = val;
          }
        }
      );
    }

    const props = _.cloneDeep(ScatterUtils.baseScatterProperties);
    const hasPredictedY = exp.testDataset.predictedY !== undefined;
    const xAccessor = "Index";
    const yAccessor = `TrainingData[${maxIndex}]`;
    const colorAccessor = hasPredictedY ? "PredictedY" : "Index";
    const colorOption = {
      data: {
        isCategorical:
          hasPredictedY &&
          exp.modelMetadata.modelType !== ModelTypes.Regression,
        sortProperty:
          hasPredictedY && exp.modelMetadata.modelType !== ModelTypes.Regression
            ? "PredictedYClassIndex"
            : undefined
      },
      key: colorAccessor,
      text: hasPredictedY
        ? localization.Interpret.ExplanationScatter.predictedY
        : localization.Interpret.ExplanationScatter.index
    };
    const modelData = exp.modelMetadata;
    const colorbarTitle = ScatterUtils.formatItemTextForAxis(
      colorOption,
      modelData
    );
    PlotlyUtils.setColorProperty(props, colorOption, modelData, colorbarTitle);
    props.data[0].yAccessor = yAccessor;
    props.data[0].xAccessor = xAccessor;
    if (props.data[0].datapointLevelAccessors) {
      props.data[0].datapointLevelAccessors.text.path = [
        xAccessor,
        yAccessor,
        colorAccessor
      ];
      props.data[0].datapointLevelAccessors.text.mapArgs = [
        localization.Interpret.ExplanationScatter.index,
        modelData.featureNames[maxIndex],
        localization.Interpret.ExplanationScatter.predictedY
      ];
    }

    _.set(
      props,
      "layout.xaxis.title.text",
      localization.Interpret.ExplanationScatter.index
    );
    _.set(props, "layout.yaxis.title.text", modelData.featureNames[maxIndex]);

    return props;
  }

  public static defaultExplanationPlotlyProps(
    exp: IExplanationContext
  ): IPlotlyProperty {
    let maxIndex = 0;
    let secondIndex = 0;
    let maxVal: number = Number.MIN_SAFE_INTEGER;

    // Find the top two metrics
    if (
      exp.globalExplanation &&
      exp.globalExplanation.flattenedFeatureImportances
    ) {
      exp.globalExplanation.flattenedFeatureImportances.forEach(
        (val, index) => {
          if (val >= maxVal) {
            secondIndex = maxIndex;
            maxIndex = index;
            maxVal = val;
          }
        }
      );
    }

    const props = _.cloneDeep(ScatterUtils.baseScatterProperties);
    const yAccessor = `LocalExplanation[${maxIndex}]`;
    const xAccessor = `TrainingData[${maxIndex}]`;
    const colorAccessor = `TrainingData[${secondIndex}]`;
    const colorOption = {
      data: {
        isCategorical: exp.modelMetadata.featureIsCategorical?.[secondIndex]
      },
      key: colorAccessor,
      text: exp.modelMetadata.featureNames[secondIndex]
    };
    const modelData = exp.modelMetadata;
    const colorbarTitle = ScatterUtils.formatItemTextForAxis(
      colorOption,
      modelData
    );
    PlotlyUtils.setColorProperty(props, colorOption, modelData, colorbarTitle);
    props.data[0].xAccessor = xAccessor;
    props.data[0].yAccessor = yAccessor;
    if (props.data[0].datapointLevelAccessors) {
      props.data[0].datapointLevelAccessors.text.path = [
        xAccessor,
        yAccessor,
        colorAccessor
      ];
      props.data[0].datapointLevelAccessors.text.mapArgs = [
        localization.formatString(
          localization.Interpret.ExplanationScatter.dataLabel,
          modelData.featureNames[maxIndex]
        ),
        localization.formatString(
          localization.Interpret.ExplanationScatter.importanceLabel,
          modelData.featureNames[maxIndex]
        ),
        localization.formatString(
          localization.Interpret.ExplanationScatter.dataLabel,
          modelData.featureNames[secondIndex]
        )
      ];
    }

    const yAxisLabel = IsBinary(modelData.modelType)
      ? `${localization.formatString(
          localization.Interpret.ExplanationScatter.importanceLabel,
          modelData.featureNames[maxIndex]
        )} : ${modelData.classNames[0]}`
      : localization.formatString(
          localization.Interpret.ExplanationScatter.importanceLabel,
          modelData.featureNames[maxIndex]
        );
    _.set(props, "layout.yaxis.title.text", yAxisLabel);
    _.set(
      props,
      "layout.xaxis.title.text",
      localization.formatString(
        localization.Interpret.ExplanationScatter.dataLabel,
        modelData.featureNames[maxIndex]
      )
    );

    return props;
  }

  public static updateNewXAccessor(
    props: IScatterProps,
    plotlyProps: IPlotlyProperty,
    item: IComboBoxOption,
    id: string
  ): void {
    if (item.key !== plotlyProps.data[0].xAccessor) {
      plotlyProps.data[0].xAccessor = item.key.toString();
      ScatterUtils.updateTooltipArgs(
        plotlyProps,
        item.key.toString(),
        item.text,
        0
      );
      _.set(
        plotlyProps,
        "layout.xaxis.title.text",
        ScatterUtils.formatItemTextForAxis(
          item,
          props.dashboardContext.explanationContext.modelMetadata
        )
      );
      props.onChange(plotlyProps, id);
    }
  }

  public static updateNewYAccessor(
    props: IScatterProps,
    plotlyProps: IPlotlyProperty,
    item: IComboBoxOption,
    id: string
  ): void {
    if (item.key !== plotlyProps.data[0].yAccessor) {
      plotlyProps.data[0].yAccessor = item.key.toString();
      ScatterUtils.updateTooltipArgs(
        plotlyProps,
        item.key.toString(),
        item.text,
        1
      );
      _.set(
        plotlyProps,
        "layout.yaxis.title.text",
        ScatterUtils.formatItemTextForAxis(
          item,
          props.dashboardContext.explanationContext.modelMetadata
        )
      );
      props.onChange(plotlyProps, id);
    }
  }

  public static updateColorAccessor(
    props: IScatterProps,
    plotlyProps: IPlotlyProperty,
    item: IComboBoxOption,
    id: string
  ): void {
    const colorbarTitle = ScatterUtils.formatItemTextForAxis(
      item,
      props.dashboardContext.explanationContext.modelMetadata
    );
    PlotlyUtils.setColorProperty(
      plotlyProps,
      item,
      props.dashboardContext.explanationContext.modelMetadata,
      colorbarTitle
    );
    ScatterUtils.updateTooltipArgs(
      plotlyProps,
      item.key.toString(),
      item.text,
      2
    );
    props.onChange(plotlyProps, id);
  }

  public static getselectedColorOption(
    plotlyProps: IPlotlyProperty,
    options: IDropdownOption[]
  ): string | undefined {
    let foundOption = options.find((option) =>
      _.isEqual(
        [option.key],
        _.get(plotlyProps.data[0], "datapointLevelAccessors.color.path")
      )
    );
    if (foundOption !== undefined) {
      return foundOption.key.toString();
    }
    if (
      plotlyProps.data[0].groupBy === undefined ||
      plotlyProps.data[0].groupBy?.length < 1
    ) {
      return undefined;
    }
    foundOption = options.find(
      (option) => option.key === plotlyProps.data[0].groupBy?.[0]
    );
    return foundOption ? foundOption.key.toString() : undefined;
  }

  public static updatePropsForSelections(
    plotlyProps: IPlotlyProperty,
    selectedRow: number | undefined
  ): IPlotlyProperty {
    if (selectedRow === undefined) {
      plotlyProps.data.forEach((trace) => {
        _.set(trace, "marker.line.width", [0]);
        _.set(trace, "selectedpoints", undefined);
      });
      return _.cloneDeep(plotlyProps);
    }
    const selection =
      selectedRow !== undefined ? selectedRow.toString() : undefined;
    plotlyProps.data.forEach((trace) => {
      const selectedIndexes: number[] = [];
      let newWidths: number[] = [0];
      if (trace.customdata) {
        const customData = trace.customdata;
        newWidths = new Array(customData.length).fill(0);

        customData.forEach((id, index) => {
          if (selection === id) {
            selectedIndexes.push(index);
            newWidths[index] = 2;
          }
        });
      }

      (trace as any).selectedpoints = selectedIndexes;
      _.set(trace, "marker.line.width", newWidths);
    });
    return _.cloneDeep(plotlyProps);
  }

  private static updateTooltipArgs(
    props: IPlotlyProperty,
    accessor: string,
    label: string,
    index: number
  ): void {
    if (props.data[0]?.datapointLevelAccessors?.text?.mapArgs) {
      props.data[0].datapointLevelAccessors.text.mapArgs[index] = label;
      props.data[0].datapointLevelAccessors.text.path[index] = accessor;
    }
  }

  private static formatItemTextForAxis(
    item: IComboBoxOption,
    modelMetadata: IExplanationModelMetadata
  ): string {
    if (IsBinary(modelMetadata.modelType) && item.data.isFeatureImportance) {
      // Add the first class's name to the text for binary case, to clarify
      const className = modelMetadata.classNames[0];
      return `${item.text}<br> ${localization.Interpret.ExplanationScatter.class} : ${className}`;
    }
    return item.text;
  }
}
