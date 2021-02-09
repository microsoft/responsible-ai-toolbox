// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JointDataset } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { roundDecimal } from "@responsible-ai/mlchartlib";
import {
  IconButton,
  Label,
  Text,
  TooltipHost,
  TooltipOverflowMode
} from "office-ui-fabric-react";
import React from "react";

import { FilterMethods, IFilter } from "../../Interfaces/IFilter";

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
    [FilterMethods.Equal]: localization.Interpret.FilterOperations.equals,
    [FilterMethods.GreaterThan]:
      localization.Interpret.FilterOperations.greaterThan,
    [FilterMethods.GreaterThanEqualTo]:
      localization.Interpret.FilterOperations.greaterThanEquals,
    [FilterMethods.LessThan]: localization.Interpret.FilterOperations.lessThan,
    [FilterMethods.LessThanEqualTo]:
      localization.Interpret.FilterOperations.lessThanEquals,
    [FilterMethods.Includes]: localization.Interpret.FilterOperations.includes,
    [FilterMethods.Excludes]: localization.Interpret.FilterOperations.excludes,
    [FilterMethods.InTheRangeOf]:
      localization.Interpret.FilterOperations.inTheRangeOf
  };
  public render(): React.ReactNode {
    return (
      <>
        <Label>{localization.Interpret.CohortEditor.addedFilters}</Label>
        {this.props.filters.length > 0 ? (
          this.props.filters.map((filter, index) => {
            return (
              <div key={index}>
                {this.setFilterLabel(filter)}
                <IconButton
                  id={`editFilerBtn-${index}`}
                  iconProps={{ iconName: "Edit" }}
                  onClick={(): void => this.props.editFilter(index)}
                />
                <IconButton
                  id={`removeFilterBtn-${index}`}
                  iconProps={{ iconName: "Clear" }}
                  onClick={(): void => this.props.removeFilter(index)}
                />
              </div>
            );
          })
        ) : (
          <div>
            <Text variant={"smallPlus"}>
              {localization.Interpret.CohortEditor.noAddedFilters}
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
          localization.Interpret.FilterOperations.overflowFilterArgs,
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
        localization.Interpret.FilterOperations.inTheRangeOf,
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
