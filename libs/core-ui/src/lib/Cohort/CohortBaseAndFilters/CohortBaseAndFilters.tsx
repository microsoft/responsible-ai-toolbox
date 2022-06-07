// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStackStyles, IStackTokens, Stack } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
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
          <div className={classNames.header}>
            {
              localization.ErrorAnalysis.CohortBaseAndFilters
                .globalCohortAndFilters
            }
          </div>
          <Stack horizontal>
            <Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>
                  {localization.ErrorAnalysis.CohortBaseAndFilters.globalCohort}
                </div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>
                  {
                    localization.ErrorAnalysis.CohortBaseAndFilters
                      .errorExplorer
                  }
                </div>
              </Stack>
              <Stack horizontal tokens={alignmentStackTokens}>
                <div className={classNames.tableData}>
                  {localization.ErrorAnalysis.CohortBaseAndFilters.filters}
                </div>
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
