// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Dropdown,
  IDropdownOption,
  PrimaryButton,
  Stack,
  Text
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ForecastComparison } from "./Controls/ForecastComparison";
import { TransformationCreator } from "./Controls/TransformationCreator";
import { TransformationsTable } from "./Controls/TransformationsTable";
import { forecastingDashboardStyles } from "./ForecastingDashboard.styles";
import { Transformation } from "./Interfaces/Transformation";

export interface IForecastingDashboardProps {}

export interface IForecastingDashboardState {
  transformations?: Map<number, Map<string, Transformation>>;
  isTransformationCreatorVisible: boolean;
}

export class ForecastingDashboard extends React.Component<
  IForecastingDashboardProps,
  IForecastingDashboardState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IForecastingDashboardProps) {
    super(props);

    this.state = {
      isTransformationCreatorVisible: false
    };
  }

  public componentDidMount(): void {
    const transformations = new Map<number, Map<string, Transformation>>();
    transformations.set(
      this.context.baseErrorCohort.cohort.getCohortID(),
      new Map<string, Transformation>()
    );
  }

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    if (
      this.context === undefined ||
      this.context.baseErrorCohort === undefined
    ) {
      return <React.Fragment />;
    }

    // "All data" cohort selected, so no particular time series selected yet.
    // special case: only 1 time series in dataset, needs to be handled! TODO
    let noCohortSelected =
      this.context.baseErrorCohort.cohort.name ===
      localization.ErrorAnalysis.Cohort.defaultLabel;

    const cohortTransformations =
      this.state.transformations?.get(
        this.context.baseErrorCohort.cohort.getCohortID()
      ) ?? new Map<string, Transformation>();

    return (
      <>
        <Stack
          className={classNames.sectionStack}
          tokens={{ childrenGap: "24px", padding: "0 0 100px 0" }}
          id="ForecastingDashboard"
        >
          <Stack.Item className={classNames.topLevelDescriptionText}>
            <Text>
              What-if allows you to perturb features for any input and observe
              how the model's prediction changes. You can perturb features
              manually or simply specify the desired prediction (e.g., class
              label for a classifier) to see a list of closest data points to
              the original input that would lead to the desired prediction. Also
              known as prediction counterfactuals, you can use them for
              exploring the relationships learnt by the model; understanding
              important, necessary features for the model's predictions; or
              debug edge-cases for the model. To start, choose a time series
              whose features you wish to perturb and create a what-if scenario.
            </Text>
          </Stack.Item>
          <Stack.Item>
            <Dropdown
              options={this.context.errorCohorts
                .filter(
                  (cohort) =>
                    cohort.cohort.name !==
                    localization.ErrorAnalysis.Cohort.defaultLabel
                )
                .map((cohort) => {
                  return {
                    key: cohort.cohort.getCohortID(),
                    text: cohort.cohort.name
                  } as IDropdownOption;
                })}
              onChange={this.onChangeCohort}
              selectedKey={
                this.context.baseErrorCohort.cohort.name ===
                localization.ErrorAnalysis.Cohort.defaultLabel
                  ? undefined
                  : this.context.baseErrorCohort.cohort.getCohortID()
              }
              placeholder={"Select a time series."}
            />
          </Stack.Item>
          {!noCohortSelected && (
            <>
              <Stack.Item>
                <PrimaryButton
                  disabled={false}
                  onClick={() => {
                    this.setState({ isTransformationCreatorVisible: true });
                  }}
                  text="Create what-if scenario"
                />
              </Stack.Item>

              <Stack tokens={{ childrenGap: "20pt" }}>
                {cohortTransformations.size > 0 && (
                  <Stack.Item>
                    <TransformationsTable
                      transformations={cohortTransformations}
                    />
                  </Stack.Item>
                )}
                <Stack.Item>
                  <ForecastComparison transformations={cohortTransformations} />
                </Stack.Item>
              </Stack>
            </>
          )}
        </Stack>
        <TransformationCreator
          addTransformation={this.addTransformation}
          transformations={cohortTransformations}
          isVisible={this.state.isTransformationCreatorVisible}
        />
      </>
    );
  }

  private addTransformation = (
    name: string,
    transformation: Transformation
  ): void => {
    const currentCohortID = this.context.baseErrorCohort.cohort.getCohortID();
    let newMap =
      this.state.transformations ??
      new Map<number, Map<string, Transformation>>();
    const cohortMap =
      this.state.transformations?.get(currentCohortID) ??
      new Map<string, Transformation>();
    cohortMap.set(name, transformation);
    newMap.set(currentCohortID, cohortMap);
    this.setState({
      transformations: newMap,
      isTransformationCreatorVisible: false
    });
  };

  private onChangeCohort = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption<string> | undefined
  ): void => {
    if (option) {
      const newCohortId = option.key as number;
      const newCohort = this.context.errorCohorts.find(
        (cohort) => cohort.cohort.getCohortID() === newCohortId
      );
      if (newCohort) {
        this.context.shiftErrorCohort(newCohort);
      }
    }
  };
}
