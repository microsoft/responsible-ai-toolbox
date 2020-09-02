import _ from "lodash";
import memoize from "memoize-one";
import { PartialRequired2 } from "@responsible-ai/core-ui";
import {
  AccessorMappingFunctionNames,
  ChartBuilder,
  IPlotlyProperty,
  PlotlyMode,
  SelectionContext
} from "@responsible-ai/mlchartlib";
import {
  IComboBoxOption,
  DropdownMenuItemType,
  IDropdownOption
} from "office-ui-fabric-react";

import { localization } from "../../../Localization/localization";
import { IDashboardContext } from "../../ExplanationDashboard";
import {
  IExplanationContext,
  IExplanationModelMetadata,
  ModelTypes
} from "../../IExplanationContext";
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
    },
    _.isEqual.bind(window)
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
          key: "Header0",
          text: localization.featureImportance,
          itemType: DropdownMenuItemType.Header
        });
        explanationContext.modelMetadata.featureNames.forEach(
          (featureName, index) => {
            result.push({
              key: `LocalExplanation[${index}]`,
              text: localization.formatString(
                localization.ExplanationScatter.importanceLabel,
                featureName
              ),
              data: { isCategorical: false, isFeatureImportance: true }
            });
          }
        );
      }
      result.push({
        key: "divider1",
        text: "-",
        itemType: DropdownMenuItemType.Divider
      });
      result.push({
        key: "Header1",
        text: localization.ExplanationScatter.dataGroupLabel,
        itemType: DropdownMenuItemType.Header
      });
      explanationContext.modelMetadata.featureNames.forEach(
        (featureName, index) => {
          result.push({
            key: `TrainingData[${index}]`,
            text: includeFeatureImportance
              ? localization.formatString(
                  localization.ExplanationScatter.dataLabel,
                  featureName
                )
              : featureName,
            data: {
              isCategorical:
                explanationContext.modelMetadata.featureIsCategorical?.[index]
            }
          });
        }
      );
      result.push({
        key: "Index",
        text: localization.ExplanationScatter.index,
        data: { isCategorical: false }
      });
      result.push({
        key: "divider2",
        text: "-",
        itemType: DropdownMenuItemType.Divider
      });
      result.push({
        key: "Header2",
        text: localization.ExplanationScatter.output,
        itemType: DropdownMenuItemType.Header
      });
      if (explanationContext.testDataset.predictedY) {
        result.push({
          key: "PredictedY",
          text: localization.ExplanationScatter.predictedY,
          data: {
            isCategorical:
              explanationContext.modelMetadata.modelType !==
              ModelTypes.regression,
            sortProperty:
              explanationContext.modelMetadata.modelType !==
              ModelTypes.regression
                ? "PredictedYClassIndex"
                : undefined
          }
        });
      }
      if (explanationContext.testDataset.probabilityY) {
        explanationContext.testDataset.probabilityY[0].forEach((_, index) => {
          let className = explanationContext.modelMetadata.classNames[index];
          if (!className) {
            className = `class ${index}`;
          }
          result.push({
            key: `ProbabilityY[${index}]`,
            text: localization.formatString(
              localization.ExplanationScatter.probabilityLabel,
              className
            ),
            data: { isCategorical: false }
          });
        });
      }
      if (explanationContext.testDataset.trueY) {
        result.push({
          key: "TrueY",
          text: localization.ExplanationScatter.trueY,
          data: {
            isCategorical:
              explanationContext.modelMetadata.modelType !==
              ModelTypes.regression,
            sortProperty:
              explanationContext.modelMetadata.modelType !==
              ModelTypes.regression
                ? "TrueYClassIndex"
                : undefined
          }
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
            TrainingData: featuresArray,
            Index: rowIndex.toString()
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
              ModelTypes.regression
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
              ModelTypes.regression
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
    },
    _.isEqual.bind(window)
  );
  private static baseScatterProperties: IPlotlyProperty = {
    config: { displaylogo: false, responsive: true, displayModeBar: false },
    data: [
      {
        datapointLevelAccessors: {
          customdata: {
            path: ["Index"],
            plotlyPath: "customdata"
          },
          text: {
            mapFunction: AccessorMappingFunctionNames.stringifyText,
            path: [],
            plotlyPath: "text"
          }
        },
        hoverinfo: "text",
        mode: PlotlyMode.markers,
        type: "scattergl"
      }
    ],
    layout: {
      dragmode: false,
      autosize: true,
      font: {
        size: 10
      },
      margin: {
        t: 10
      },
      hovermode: "closest",
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
      key: colorAccessor,
      text: hasPredictedY
        ? localization.ExplanationScatter.predictedY
        : localization.ExplanationScatter.index,
      data: {
        isCategorical:
          hasPredictedY &&
          exp.modelMetadata.modelType !== ModelTypes.regression,
        sortProperty:
          hasPredictedY && exp.modelMetadata.modelType !== ModelTypes.regression
            ? "PredictedYClassIndex"
            : undefined
      }
    };
    const modelData = exp.modelMetadata;
    const colorbarTitle = ScatterUtils.formatItemTextForAxis(
      colorOption,
      modelData
    );
    PlotlyUtils.setColorProperty(props, colorOption, modelData, colorbarTitle);
    props.data[0].yAccessor = yAccessor;
    props.data[0].xAccessor = xAccessor;
    props.data[0].datapointLevelAccessors!["text"].path = [
      xAccessor,
      yAccessor,
      colorAccessor
    ];
    props.data[0].datapointLevelAccessors!["text"].mapArgs = [
      localization.ExplanationScatter.index,
      modelData.featureNames[maxIndex],
      localization.ExplanationScatter.predictedY
    ];

    _.set(
      props,
      "layout.xaxis.title.text",
      localization.ExplanationScatter.index
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
      key: colorAccessor,
      text: exp.modelMetadata.featureNames[secondIndex],
      data: {
        isCategorical: exp.modelMetadata.featureIsCategorical?.[secondIndex]
      }
    };
    const modelData = exp.modelMetadata;
    const colorbarTitle = ScatterUtils.formatItemTextForAxis(
      colorOption,
      modelData
    );
    PlotlyUtils.setColorProperty(props, colorOption, modelData, colorbarTitle);
    props.data[0].xAccessor = xAccessor;
    props.data[0].yAccessor = yAccessor;
    props.data[0].datapointLevelAccessors!["text"].path = [
      xAccessor,
      yAccessor,
      colorAccessor
    ];
    props.data[0].datapointLevelAccessors!["text"].mapArgs = [
      localization.formatString(
        localization.ExplanationScatter.dataLabel,
        modelData.featureNames[maxIndex]
      ),
      localization.formatString(
        localization.ExplanationScatter.importanceLabel,
        modelData.featureNames[maxIndex]
      ),
      localization.formatString(
        localization.ExplanationScatter.dataLabel,
        modelData.featureNames[secondIndex]
      )
    ];

    const yAxisLabel =
      modelData.modelType === ModelTypes.binary
        ? localization.formatString(
            localization.ExplanationScatter.importanceLabel,
            modelData.featureNames[maxIndex]
          ) + ` : ${modelData.classNames[0]}`
        : localization.formatString(
            localization.ExplanationScatter.importanceLabel,
            modelData.featureNames[maxIndex]
          );
    _.set(props, "layout.yaxis.title.text", yAxisLabel);
    _.set(
      props,
      "layout.xaxis.title.text",
      localization.formatString(
        localization.ExplanationScatter.dataLabel,
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
    selectedRow: number
  ): IPlotlyProperty {
    if (selectedRow === undefined) {
      plotlyProps.data.forEach((trace) => {
        _.set(trace, "marker.line.width", [0]);
        _.set(trace, "selectedpoints", null);
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
    if (props.data[0]?.datapointLevelAccessors?.["text"]?.mapArgs) {
      props.data[0].datapointLevelAccessors["text"].mapArgs[index] = label;
      props.data[0].datapointLevelAccessors["text"].path[index] = accessor;
    }
  }

  private static formatItemTextForAxis(
    item: IDropdownOption,
    modelMetadata: IExplanationModelMetadata
  ): string {
    if (
      modelMetadata.modelType === ModelTypes.binary &&
      item.data.isFeatureImportance
    ) {
      // Add the first class's name to the text for binary case, to clarify
      const className = modelMetadata.classNames[0];
      return `${item.text}<br> ${localization.ExplanationScatter.class} : ${className}`;
    }
    return item.text;
  }
}
