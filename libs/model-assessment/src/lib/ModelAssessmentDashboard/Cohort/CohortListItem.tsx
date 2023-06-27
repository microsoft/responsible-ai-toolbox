// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumn, Stack, Text } from "@fluentui/react";
import {
  Cohort,
  CohortNameColumn,
  ErrorCohort,
  IModelAssessmentContext,
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ICohortListItem } from "./CohortList";
import { cohortListStyles } from "./CohortList.styles";
import { CohortListDeleteButton } from "./CohortListDeleteButton";

export interface ICohortListItemProps {
  item: ICohortListItem;
  index: number | undefined;
  column: IColumn | undefined;
  enableEditing: boolean;
  getAllCohort: () => ErrorCohort[];
  onEditCohortClick: (index: number) => void;
  onDeleteCohortClick: (index: number) => void;
}

export class CohortListItem extends React.Component<ICohortListItemProps> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const style = cohortListStyles();
    if (this.props.column !== undefined && this.props.index !== undefined) {
      const fieldContent = this.props.item[
        this.props.column.fieldName as keyof ICohortListItem
      ] as string;

      switch (this.props.column.key) {
        case "nameColumn":
          if (
            this.props.enableEditing &&
            this.props.item.name !==
              localization.ErrorAnalysis.Cohort.defaultLabel
          ) {
            return (
              <Stack className={style.link} horizontal={false}>
                <Stack.Item>
                  <span>{fieldContent}</span>
                </Stack.Item>
                <Stack.Item>
                  <Stack horizontal tokens={{ childrenGap: "10px" }}>
                    <Stack.Item>
                      <CohortNameColumn
                        disabled={this.isActiveCohort(this.props.item.key)}
                        fieldContent={localization.Interpret.CohortBanner.edit}
                        name={this.props.item.key}
                        onClick={this.props.onEditCohortClick}
                      />
                    </Stack.Item>
                    <Stack.Item>
                      <CohortNameColumn
                        fieldContent={
                          localization.Interpret.CohortBanner.duplicateCohort
                        }
                        name={this.props.item.key}
                        onClick={this.onDuplicateCohortClick}
                      />
                    </Stack.Item>
                  </Stack>
                </Stack.Item>
              </Stack>
            );
          }
          return <span className={style.link}>{fieldContent}</span>;
        case "detailsColumn":
          if (
            this.props.item.details &&
            this.props.item.details.length === 2 &&
            this.props.index !== 0
          ) {
            return (
              <Stack horizontal tokens={{ childrenGap: "15px" }}>
                <Stack.Item>
                  <Stack horizontal={false}>
                    <Stack.Item>
                      <Text variant={"xSmall"}>
                        {this.props.item.details[0]}
                      </Text>
                    </Stack.Item>
                    <Stack.Item>
                      <Text variant={"xSmall"}>
                        {this.props.item.details[1]}
                      </Text>
                    </Stack.Item>
                  </Stack>
                </Stack.Item>
                {this.props.enableEditing && (
                  <Stack.Item>
                    <CohortListDeleteButton
                      disabled={this.isActiveCohort(this.props.item.key)}
                      itemKey={this.props.item.key}
                      onDeleteCohortClick={this.props.onDeleteCohortClick}
                    />
                  </Stack.Item>
                )}
              </Stack>
            );
          }
          if (this.props.item.details && this.props.item.details.length === 2) {
            return (
              <Stack horizontal={false}>
                <Stack.Item>
                  <Text variant={"xSmall"}>{this.props.item.details[0]}</Text>
                </Stack.Item>
                <Stack.Item>
                  <Text variant={"xSmall"}>{this.props.item.details[1]}</Text>
                </Stack.Item>
              </Stack>
            );
          }
          return <span>{fieldContent}</span>;
        default:
          return <span>{fieldContent}</span>;
      }
    }
    return React.Fragment;
  }

  private isActiveCohort(index: number): boolean {
    const all = this.props.getAllCohort();
    if (index >= 0 && index < all.length) {
      const targetCohort = all[index];
      return !!(
        targetCohort.cohort.name === this.context.baseErrorCohort.cohort.name ||
        targetCohort.cohort.name ===
          this.context.selectedErrorCohort.cohort.name
      );
    }
    return false;
  }

  private onDuplicateCohortClick = (index: number): void => {
    const all = this.props.getAllCohort();
    if (index >= 0 && index < all.length) {
      const originCohort = all[index];
      const duplicatedCohortNameStub =
        originCohort.cohort.name + localization.Interpret.CohortBanner.copy;
      let duplicatedCohortName = duplicatedCohortNameStub;
      let cohortCopyIndex = 0;
      while (this.existsCohort(all, duplicatedCohortName)) {
        cohortCopyIndex++;
        duplicatedCohortName = `${duplicatedCohortNameStub}(${cohortCopyIndex})`;
      }
      const newCohort = new Cohort(
        duplicatedCohortName,
        this.context.jointDataset,
        originCohort.cohort.filters
      );
      this.context.addCohort(newCohort);
    }
  };

  private existsCohort(cohorts: ErrorCohort[], name: string): boolean {
    return cohorts.some((errorCohort) => {
      return errorCohort.cohort.name === name;
    });
  }
}
