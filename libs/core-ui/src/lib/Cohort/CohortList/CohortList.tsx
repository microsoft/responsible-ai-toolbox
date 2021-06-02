// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  IColumn,
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  Link,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort } from "../ErrorCohort";

import { cohortListStyles } from "./CohortList.styles";

export interface ICohortListProps {
  errorCohorts: ErrorCohort[];
  onEditCohortClick: (editedCohort: ErrorCohort) => void;
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
  errorRate: string;
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
        name: "Coverage"
      },
      {
        fieldName: "errorRate",
        isResizable: true,
        key: "errorRateColumn",
        maxWidth: 100,
        minWidth: 75,
        name: "Error rate"
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
          <DetailsList
            items={items}
            columns={this.columns}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            selectionPreservedOnEmptyClick
            checkboxVisibility={CheckboxVisibility.hidden}
            onRenderItemColumn={this.renderItemColumn.bind(this)}
          />
        </div>
      </div>
    );
  }

  private renderItemColumn(
    item: ICohortListItem,
    index: number | undefined,
    column: IColumn | undefined
  ): React.ReactNode {
    if (column !== undefined && index !== undefined) {
      const fieldContent = item[
        column.fieldName as keyof ICohortListItem
      ] as string;

      switch (column.key) {
        case "nameColumn":
          if (this.props.enableEditing && item.name !== "All data") {
            return (
              <Link onClick={this.onEditCohortClick.bind(this, item.name)}>
                {fieldContent}
              </Link>
            );
          }
          return <span>{fieldContent}</span>;
        case "detailsColumn":
          if (item.details && item.details.length == 2) {
            return (
              <Stack>
                <Text variant={"xSmall"}>{item.details[0]}</Text>
                <Text variant={"xSmall"}>{item.details[1]}</Text>
              </Stack>
            );
          }
        default:
          return <span>{fieldContent}</span>;
      }
    }
    return React.Fragment;
  }

  private onEditCohortClick(name: string): void {
    const cohort = this.props.errorCohorts.find(
      (errorCohort) => errorCohort.cohort.name === name
    );
    if (cohort) {
      this.props.onEditCohortClick(cohort);
    }
  }

  private getCohortListItems(): ICohortListItem[] {
    const allItems = this.props.errorCohorts
      .filter((errorCohort: ErrorCohort) => !errorCohort.isTemporary)
      .map((errorCohort: ErrorCohort, index: number) => {
        let details = [
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
          errorRate: errorCohort.cohortStats.metricValue.toFixed(2),
          key: index,
          name: errorCohort.cohort.name,
          details: details
        };
      });
    return allItems;
  }
}
