// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStackStyles, IStackTokens, Stack } from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort } from "../ErrorCohort";

import { cohortBaseAndFiltersStyles } from "./CohortBaseAndFilters.styles";

export interface ICohortBaseAndFiltersProps {
  cohort: ErrorCohort;
  baseCohort: ErrorCohort;
}

const alignmentStackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 5
};

const maxWidthStackStyle: IStackStyles = {
  root: {
    width: "500px"
  }
};

export class CohortBaseAndFilters extends React.Component<ICohortBaseAndFiltersProps> {
  public render(): React.ReactNode {
    const classNames = cohortBaseAndFiltersStyles();
    const filters = this.props.cohort.filtersToString().join(", ");
    return (
      <div>
        <div className={classNames.section} />
        <div className={classNames.subsection}>
          <div className={classNames.header}>Base cohort and filters</div>
          <Stack horizontal>
            <Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Base cohort</div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Error explorer</div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>Filters</div>
              </Stack>
            </Stack>
            <Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>
                  {this.props.baseCohort.cohort.name}
                </div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>
                  {this.props.cohort.source}
                </div>
              </Stack>
              <Stack
                horizontal
                tokens={alignmentStackTokens}
                styles={maxWidthStackStyle}
              >
                <div className={classNames.tableData}>{filters}</div>
              </Stack>
            </Stack>
          </Stack>
        </div>
      </div>
    );
  }
}
