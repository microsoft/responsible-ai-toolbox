// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IExplanationContext } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { ICategoricalRange } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import React from "react";

import { HelpMessageDict } from "../Interfaces/IStringsParam";
import { FeatureEditingTile } from "../SharedComponents/FeatureEditingTile";
import { NoDataMessage } from "../SharedComponents/NoDataMessage";
import { PredictionLabel } from "../SharedComponents/PredictionLabel";

import { perturbationExplorationStyles } from "./PerturbationExploration.styles";

export interface IPerturbationExplorationProps {
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  datapointIndex: number;
  explanationContext: IExplanationContext;
  messages?: HelpMessageDict;
  theme?: string;
}

export interface IPerturbationExplorationState {
  // the dictionary of edited values, keyed on the feature inedex
  perturbedDictionary: { [key: number]: any };
  // the dictionary of validation errors
  featureErrors: boolean[];
  prediction?: number;
  predictionProbabilities?: number[];
  abortController: AbortController | undefined;
  errorMessage?: string;
}

export class PerturbationExploration extends React.Component<
  IPerturbationExplorationProps,
  IPerturbationExplorationState
> {
  public constructor(props: IPerturbationExplorationProps) {
    super(props);
    this.state = {
      abortController: undefined,
      featureErrors: new Array(
        props.explanationContext.modelMetadata.featureNames.length
      ),
      perturbedDictionary: {}
    };

    this.fetchData = _.debounce(this.fetchData, 500);
  }

  public componentDidUpdate(prevProps: IPerturbationExplorationProps): void {
    if (this.props.datapointIndex !== prevProps.datapointIndex) {
      if (this.state.abortController) {
        this.state.abortController.abort();
      }
      this.setState({
        abortController: undefined,
        featureErrors: new Array(
          this.props.explanationContext.modelMetadata.featureNames.length
        ),
        perturbedDictionary: {},
        prediction: undefined,
        predictionProbabilities: undefined
      });
    }
  }

  public render(): React.ReactNode {
    if (this.props.invokeModel === undefined) {
      const explanationStrings = this.props.messages
        ? this.props.messages.PredictorReq
        : undefined;
      return <NoDataMessage explanationStrings={explanationStrings} />;
    }
    const hasErrors = this.state.featureErrors.some((val) => val);
    return (
      <div className={perturbationExplorationStyles.flexWrapper}>
        {this.props.explanationContext.testDataset.predictedY !== undefined && (
          <div className={perturbationExplorationStyles.labelGroup}>
            <div className={perturbationExplorationStyles.labelGroupLabel}>
              Base:
            </div>
            <div className={perturbationExplorationStyles.flexFull}>
              <PredictionLabel
                prediction={
                  this.props.explanationContext.testDataset.predictedY[
                    this.props.datapointIndex
                  ]
                }
                classNames={
                  this.props.explanationContext.modelMetadata.classNames
                }
                modelType={
                  this.props.explanationContext.modelMetadata.modelType
                }
                predictedProbabilities={
                  this.props.explanationContext.testDataset.probabilityY
                    ? this.props.explanationContext.testDataset.probabilityY[
                        this.props.datapointIndex
                      ]
                    : undefined
                }
              />
            </div>
          </div>
        )}
        {this.state.abortController && !hasErrors && (
          <div className={perturbationExplorationStyles.loadingMessage}>
            {localization.Interpret.PerturbationExploration.loadingMessage}
          </div>
        )}
        {this.state.errorMessage && (
          <div className={perturbationExplorationStyles.loadingMessage}>
            {" "}
            {this.state.errorMessage}
          </div>
        )}
        {hasErrors && (
          <div className={perturbationExplorationStyles.loadingMessage}>
            {localization.Interpret.IcePlot.topLevelErrorMessage}
          </div>
        )}
        {!hasErrors &&
          this.state.prediction !== undefined &&
          this.state.abortController === undefined && (
            <div className={perturbationExplorationStyles.labelGroup}>
              <div className={perturbationExplorationStyles.labelGroupLabel}>
                {
                  localization.Interpret.PerturbationExploration
                    .perturbationLabel
                }
              </div>
              <div className={perturbationExplorationStyles.flexFull}>
                <PredictionLabel
                  prediction={this.state.prediction}
                  classNames={
                    this.props.explanationContext.modelMetadata.classNames
                  }
                  modelType={
                    this.props.explanationContext.modelMetadata.modelType
                  }
                  predictedProbabilities={this.state.predictionProbabilities}
                />
              </div>
            </div>
          )}
        <div className={perturbationExplorationStyles.tileScroller}>
          {_.cloneDeep(
            this.props.explanationContext.testDataset.dataset?.[
              this.props.datapointIndex
            ]
          )?.map((featureValue, featureIndex) => {
            return (
              <FeatureEditingTile
                key={featureIndex}
                index={featureIndex}
                featureName={
                  this.props.explanationContext.modelMetadata.featureNames[
                    featureIndex
                  ]
                }
                defaultValue={featureValue}
                onEdit={this.onValueEdit}
                enumeratedValues={
                  (
                    this.props.explanationContext.modelMetadata.featureRanges[
                      featureIndex
                    ] as ICategoricalRange
                  ).uniqueValues
                }
                rangeType={
                  this.props.explanationContext.modelMetadata.featureRanges[
                    featureIndex
                  ].rangeType
                }
              />
            );
          })}
        </div>
      </div>
    );
  }

  private onValueEdit = (
    featureIndex: number,
    val: string | number,
    error?: string
  ): void => {
    const perturbedDictionary = _.cloneDeep(this.state.perturbedDictionary);
    const featureErrors = _.cloneDeep(this.state.featureErrors);
    featureErrors[featureIndex] = error !== undefined;
    // unset in the case that the user reverts.
    if (
      val ===
      this.props.explanationContext.testDataset.dataset?.[
        this.props.datapointIndex
      ][featureIndex]
    ) {
      perturbedDictionary[featureIndex] = undefined;
    } else {
      perturbedDictionary[featureIndex] = val;
    }
    this.setState({ featureErrors, perturbedDictionary }, () => {
      this.fetchData();
    });
  };

  private fetchData = (): void => {
    if (
      !this.props.explanationContext.testDataset.dataset ||
      !this.props.invokeModel
    ) {
      return;
    }
    if (this.state.abortController !== undefined) {
      this.state.abortController.abort();
    }
    // skip if there are any errors.
    if (this.state.featureErrors.some((val) => val)) {
      return;
    }
    const data = _.cloneDeep(
      this.props.explanationContext.testDataset.dataset[
        this.props.datapointIndex
      ]
    );
    for (const key of Object.keys(this.state.perturbedDictionary)) {
      const index = +key;
      if (this.state.perturbedDictionary[index] !== undefined) {
        data[index] = this.state.perturbedDictionary[index];
      }
    }
    const abortController = new AbortController();
    const promise = this.props.invokeModel([data], abortController.signal);
    this.setState({ abortController, errorMessage: undefined }, async () => {
      try {
        const fetchedData = await promise;
        if (abortController.signal.aborted) {
          return;
        }
        if (Array.isArray(fetchedData[0])) {
          const predictionVector = fetchedData[0];
          let predictedClass = 0;
          let maxProb = predictionVector[0];
          for (let i = 1; i < predictionVector.length; i++) {
            if (predictionVector[i] > maxProb) {
              predictedClass = i;
              maxProb = predictionVector[i];
            }
          }
          this.setState({
            abortController: undefined,
            prediction: predictedClass,
            predictionProbabilities: predictionVector
          });
        } else {
          this.setState({
            abortController: undefined,
            prediction: fetchedData[0]
          });
        }
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        if (error.name === "PythonError") {
          this.setState({
            errorMessage: localization.formatString(
              localization.Interpret.IcePlot.errorPrefix,
              error.message
            ) as string
          });
        }
      }
    });
  };
}
