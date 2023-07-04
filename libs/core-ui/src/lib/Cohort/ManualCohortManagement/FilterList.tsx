// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton, TooltipHost, TooltipOverflowMode } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { RangeTypes, roundDecimal } from "@responsible-ai/mlchartlib";
import React from "react";

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "../../Context/ModelAssessmentContext";
import { FilterMethods, IFilter } from "../../Interfaces/IFilter";

import { getColumnLabel } from "./FilterListUtils";

export interface IFilterListProps {
  filters: IFilter[];
  editFilter?(index: number): void;
  removeFilter?(index: number): void;
}
export class FilterList extends React.Component<IFilterListProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
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
    return this.props.filters
      .filter((item) => item)
      .map((filter, index) => {
        return (
          <div key={index}>
            {this.setFilterLabel(filter)}
            {this.props.editFilter && (
              <IconButton
                id={`editFilerBtn-${index}`}
                iconProps={{ iconName: "Edit" }}
                onClick={(): void => this.props.editFilter?.(index)}
                ariaLabel={localization.Common.editButton}
              />
            )}
            {this.props.removeFilter && (
              <IconButton
                id={`removeFilterBtn-${index}`}
                iconProps={{ iconName: "Clear" }}
                onClick={(): void => this.props.removeFilter?.(index)}
                ariaLabel={localization.Common.close}
              />
            )}
          </div>
        );
      });
  }

  private setFilterLabel(filter: IFilter): React.ReactNode {
    const abbridgedLabel = getColumnLabel(
      filter.column,
      this.context.columnRanges
    );
    let isCategorical;
    let sortedCategoricalValues: string[] | undefined;

    const range = this.context.columnRanges
      ? this.context.columnRanges[filter.column]
      : undefined;
    if (
      range?.rangeType === RangeTypes.Categorical ||
      range?.treatAsCategorical
    ) {
      isCategorical = true;
      sortedCategoricalValues = range.sortedUniqueValues.map((v) => String(v));
    }

    let stringArgs;
    let label = "";
    if (isCategorical) {
      const selectedValues: string[] = [];
      const filterArgs = filter.arg;
      filterArgs.forEach((element) => {
        const value = sortedCategoricalValues?.[element];
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
      label = `${abbridgedLabel} ${localization.formatString(
        localization.Interpret.FilterOperations.inTheRangeOf,
        stringArgs
      )}`;
    } else {
      // example: Age < 30
      label = `${abbridgedLabel} ${localization.formatString(
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
