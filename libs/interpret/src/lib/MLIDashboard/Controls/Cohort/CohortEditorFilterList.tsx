// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { roundDecimal } from "@responsible-ai/mlchartlib";
import {
  IconButton,
  Label,
  Text,
  TooltipHost,
  TooltipOverflowMode
} from "office-ui-fabric-react";
import React from "react";

import { localization } from "../../../Localization/localization";
import { FilterMethods, IFilter } from "../../Interfaces/IFilter";
import { JointDataset } from "../../JointDataset";

export interface ICohortEditorFilterList {
  filters: IFilter[];
  jointDataset: JointDataset;
  editFilter(index: number): void;
  removeFilter(index: number): void;
}

export class CohortEditorFilterList extends React.Component<
  ICohortEditorFilterList
> {
  private filterMethodLabels: { [key in FilterMethods]: string } = {
    [FilterMethods.Equal]: localization.FilterOperations.equals,
    [FilterMethods.GreaterThan]: localization.FilterOperations.greaterThan,
    [FilterMethods.GreaterThanEqualTo]:
      localization.FilterOperations.greaterThanEquals,
    [FilterMethods.LessThan]: localization.FilterOperations.lessThan,
    [FilterMethods.LessThanEqualTo]:
      localization.FilterOperations.lessThanEquals,
    [FilterMethods.Includes]: localization.FilterOperations.includes,
    [FilterMethods.InTheRangeOf]: localization.FilterOperations.inTheRangeOf
  };
  public render(): React.ReactNode {
    return (
      <>
        <Label>{localization.CohortEditor.addedFilters}</Label>
        {this.props.filters.length > 0 ? (
          this.props.filters.map((filter, index) => {
            return (
              <div key={index}>
                {this.setFilterLabel(filter)}
                <IconButton
                  iconProps={{ iconName: "Edit" }}
                  onClick={(): void => this.props.editFilter(index)}
                />
                <IconButton
                  iconProps={{ iconName: "Clear" }}
                  onClick={(): void => this.props.removeFilter(index)}
                />
              </div>
            );
          })
        ) : (
          <div>
            <Text variant={"smallPlus"}>
              {localization.CohortEditor.noAddedFilters}
            </Text>
          </div>
        )}
      </>
    );
  }

  private setFilterLabel(filter: IFilter): React.ReactNode {
    const selectedFilter = this.props.jointDataset.metaDict[filter.column];
    let stringArgs;
    let label = "";

    if (
      selectedFilter.isCategorical ||
      this.props.jointDataset.metaDict[filter.column].treatAsCategorical
    ) {
      const selectedValues: string[] = [];
      const filterArgs = filter.arg;
      filterArgs.forEach((element) => {
        const value = selectedFilter.sortedCategoricalValues?.[element];
        if (value) {
          selectedValues.push(value);
        }
      });
      stringArgs = selectedValues.toString();
      if (selectedValues.length > 3) {
        const otherValues = selectedValues.slice(0, 3).toString();
        const countOtherValues = selectedValues.length - 3;
        stringArgs = localization.formatString(
          localization.FilterOperations.overflowFilterArgs,
          otherValues,
          countOtherValues.toString()
        );
      }
    } else {
      for (let i = 0; i < filter.arg.length; i++) {
        filter.arg[i] = roundDecimal(filter.arg[i]);
      }
      stringArgs = filter.arg.toString();
    }

    if (filter.method === FilterMethods.InTheRangeOf) {
      // example: Age [30,40]
      label = `${selectedFilter.abbridgedLabel} ${localization.formatString(
        localization.FilterOperations.inTheRangeOf,
        stringArgs
      )}`;
    } else {
      // example: Age < 30
      label = `${selectedFilter.abbridgedLabel} ${localization.formatString(
        this.filterMethodLabels[filter.method],
        stringArgs
      )}`;
    }

    return (
      <TooltipHost
        overflowMode={TooltipOverflowMode.Self}
        content={label}
        onTooltipToggle={(): boolean => false}
      >
        {label}
      </TooltipHost>
    );
  }
}
