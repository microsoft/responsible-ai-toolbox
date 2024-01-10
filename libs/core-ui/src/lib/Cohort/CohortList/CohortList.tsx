// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CheckboxVisibility,
  IColumn,
  DetailsListLayoutMode,
  Stack,
  Text
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { AccessibleDetailsList } from "../../components/AccessibleDetailsList";
import { ErrorCohort } from "../ErrorCohort";

import { cohortListStyles } from "./CohortList.styles";
import { CohortNameColumn } from "./CohortNameColumn";

export interface ICohortListProps {
  errorCohorts: ErrorCohort[];
  onEditCohortClick?: (editedCohort: ErrorCohort) => void;
  includeDetails: boolean;
  enableEditing: boolean;
}

export interface ICohortListState {
  items: ICohortListItem[];
}

export interface ICohortListItem {
  key: number;
  name: string;
  coverage: string;
  metricName: string;
  metricValue: string;
  details?: string[];
}

export class CohortList extends React.Component<
  ICohortListProps,
  ICohortListState
> {
  private columns: IColumn[];
  public constructor(props: ICohortListProps) {
    super(props);
    const cohortListItems = this.getCohortListItems();
    this.state = {
      items: cohortListItems
    };
    this.columns = [
      {
        fieldName: "name",
        isResizable: true,
        key: "nameColumn",
        maxWidth: 200,
        minWidth: 50,
        name: "Name"
      }
    ];

    if (this.props.includeDetails) {
      this.columns.push({
        fieldName: "details",
        isResizable: true,
        key: "detailsColumn",
        maxWidth: 100,
        minWidth: 75,
        name: "Details"
      });
    }

    this.columns.push(
      {
        fieldName: "coverage",
        isResizable: true,
        key: "coverageColumn",
        maxWidth: 100,
        minWidth: 75,
        name: localization.ErrorAnalysis.CohortList.coverage
      },
      {
        fieldName: "metricName",
        isResizable: true,
        key: "metricNameColumn",
        maxWidth: 100,
        minWidth: 75,
        name: localization.ErrorAnalysis.Metrics.metricName
      },
      {
        fieldName: "metricValue",
        isResizable: true,
        key: "metricValueColumn",
        maxWidth: 100,
        minWidth: 75,
        name: localization.ErrorAnalysis.Metrics.metricValue
      }
    );
  }

  public componentDidUpdate(prevProps: ICohortListProps): void {
    if (this.props.errorCohorts !== prevProps.errorCohorts) {
      const cohortListItems = this.getCohortListItems();
      this.setState({ items: cohortListItems });
    }
  }

  public render(): React.ReactNode {
    const classNames = cohortListStyles();
    const items = this.state.items;
    return (
      <div className={classNames.section}>
        <div className={classNames.subsection}>
          <div className={classNames.header}>Cohort List</div>
          <AccessibleDetailsList
            items={items}
            columns={this.columns}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            selectionPreservedOnEmptyClick
            checkboxVisibility={CheckboxVisibility.hidden}
            onRenderItemColumn={this.renderItemColumn}
            ariaLabel={localization.Core.ShiftCohort.cohortList}
          />
        </div>
      </div>
    );
  }

  private renderItemColumn = (
    item: ICohortListItem,
    index: number | undefined,
    column: IColumn | undefined
  ): React.ReactNode => {
    if (column !== undefined && index !== undefined) {
      const fieldContent = item[
        column.fieldName as keyof ICohortListItem
      ] as string;

      switch (column.key) {
        case "nameColumn":
          if (
            this.props.enableEditing &&
            item.name !== localization.ErrorAnalysis.Cohort.defaultLabel
          ) {
            return (
              <CohortNameColumn
                fieldContent={fieldContent}
                name={item.name}
                onClick={this.onEditCohortClick}
              />
            );
          }
          return <span>{fieldContent}</span>;
        case "detailsColumn":
          if (item.details && item.details.length === 2) {
            return (
              <Stack>
                <Text variant={"xSmall"}>{item.details[0]}</Text>
                <Text variant={"xSmall"}>{item.details[1]}</Text>
              </Stack>
            );
          }
          return <span>{fieldContent}</span>;
        default:
          return <span>{fieldContent}</span>;
      }
    }
    return React.Fragment;
  };

  private onEditCohortClick = (name: string): void => {
    const cohort = this.props.errorCohorts.find(
      (errorCohort) => errorCohort.cohort.name === name
    );
    if (cohort && this.props.onEditCohortClick) {
      this.props.onEditCohortClick(cohort);
    }
  };

  private getCohortListItems(): ICohortListItem[] {
    const allItems = this.props.errorCohorts
      .filter((errorCohort: ErrorCohort) => !errorCohort.isTemporary)
      .map((errorCohort: ErrorCohort, index: number) => {
        const details = [
          localization.formatString(
            localization.Interpret.CohortBanner.datapoints,
            errorCohort.cohort.filteredData.length
          ),
          localization.formatString(
            localization.Interpret.CohortBanner.filters,
            errorCohort.cohort.filters.length
          )
        ];
        return {
          coverage: errorCohort.cohortStats.errorCoverage.toFixed(2),
          details,
          key: index,
          metricName: errorCohort.cohortStats.metricName,
          metricValue: errorCohort.cohortStats.metricValue.toFixed(2),
          name: errorCohort.cohort.name
        };
      });
    return allItems;
  }
}
