// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStackStyles, IStackTokens, Stack } from "@fluentui/react";
import React from "react";

import { ErrorCohort } from "../ErrorCohort";

import { cohortFiltersStyles } from "./CohortFilters.styles";

export interface ICohortFiltersProps {
  cohort: ErrorCohort;
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

export class CohortFilters extends React.Component<ICohortFiltersProps> {
  public render(): React.ReactNode {
    const classNames = cohortFiltersStyles();
    const filters = this.props.cohort.filtersToString().join(", ");
    return (
      <div>
        <div className={classNames.section} />
        <div className={classNames.subsection}>
          <div className={classNames.header}>Filters</div>
          <Stack>
            <Stack
              horizontal
              tokens={alignmentStackTokens}
              styles={maxWidthStackStyle}
            >
              <div className={classNames.tableData}>{filters}</div>
            </Stack>
          </Stack>
        </div>
      </div>
    );
  }
}
