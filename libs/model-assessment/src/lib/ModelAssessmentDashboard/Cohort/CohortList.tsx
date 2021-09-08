// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  IColumn,
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  Link,
  Stack,
  Text,
  Label,
  SelectionMode
} from "office-ui-fabric-react";
import React from "react";

export interface ICohortListProps {
  errorCohorts: ErrorCohort[];
  onEditCohortClick?: (editedCohort: ErrorCohort) => void;
  onRemoveCohortClick?: (editedCohort: ErrorCohort) => void;
  enableEditing: boolean;
}

export interface ICohortListItem {
  key: number;
  name: string;
  coverage: string;
  metricName: string;
  metricValue: string;
  details?: string[];
}

export class CohortList extends React.Component<ICohortListProps> {
  public render(): React.ReactNode {
    const columns = [
      {
        fieldName: "name",
        isResizable: true,
        key: "nameColumn",
        maxWidth: 200,
        minWidth: 50,
        name: "Name"
      },
      {
        fieldName: "details",
        isResizable: true,
        key: "detailsColumn",
        maxWidth: 100,
        minWidth: 75,
        name: "Details"
      }
    ];
    const items = this.getCohortListItems();
    return (
      <Stack>
        <Label>{localization.ModelAssessment.Cohort.cohortList}</Label>
        <DetailsList
          items={items}
          columns={columns}
          setKey="set"
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          checkboxVisibility={CheckboxVisibility.hidden}
          onRenderItemColumn={this.renderItemColumn.bind(this)}
        />
      </Stack>
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
  }

  private onEditCohortClick(name: string): void {
    const cohort = this.props.errorCohorts.find(
      (errorCohort) => errorCohort.cohort.name === name
    );
    if (cohort && this.props.onEditCohortClick) {
      this.props.onEditCohortClick(cohort);
    }
  }

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
