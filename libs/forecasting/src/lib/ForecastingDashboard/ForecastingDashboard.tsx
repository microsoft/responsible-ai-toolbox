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
import { TransformationCreationDialog } from "./Controls/TransformationCreationDialog";
import { TransformationsTable } from "./Controls/TransformationsTable";
import { forecastingDashboardStyles } from "./ForecastingDashboard.styles";
import { Transformation } from "./Interfaces/Transformation";

export class IForecastingDashboardProps {}

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
      return;
    }

    // "All data" cohort selected, so no particular time series selected yet.
    // special case: only 1 time series in dataset, needs to be handled! TODO
    const noCohortSelected =
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
            <Text>{localization.Forecasting.whatIfDescription}</Text>
          </Stack.Item>
          <Stack.Item>
            <Dropdown
              className={classNames.dropdown}
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
              placeholder={localization.Forecasting.selectTimeSeries}
            />
          </Stack.Item>
          {!noCohortSelected && (
            <>
              <Stack.Item>
                <PrimaryButton
                  disabled={false}
                  onClick={(): void => {
                    this.setState({ isTransformationCreatorVisible: true });
                  }}
                  text={localization.Forecasting.TransformationCreation.title}
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
        <TransformationCreationDialog
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
    const newMap =
      this.state.transformations ??
      new Map<number, Map<string, Transformation>>();
    const cohortMap =
      this.state.transformations?.get(currentCohortID) ??
      new Map<string, Transformation>();
    cohortMap.set(name, transformation);
    newMap.set(currentCohortID, cohortMap);
    this.setState({
      isTransformationCreatorVisible: false,
      transformations: newMap
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
