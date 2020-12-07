// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IColumn,
  IFocusTrapZoneProps,
  IPanelProps,
  IPanelStyles,
  IStyleFunctionOrObject,
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  Panel
} from "office-ui-fabric-react";
import React from "react";

import { ErrorCohort } from "../../ErrorCohort";

import { cohortListStyles } from "./CohortList.styles";

export interface ICohortListProps {
  isOpen: boolean;
  cohorts: ErrorCohort[];
  // hostId: string
  onDismiss: () => void;
}

export interface ICohortListState {
  items: ICohortListItem[];
}

export interface ICohortListItem {
  key: number;
  name: string;
  coverage: string;
  errorRate: string;
}

const focusTrapZoneProps: IFocusTrapZoneProps = {
  forceFocusInsideTrap: false,
  isClickableOutsideFocusTrap: true
};

const panelStyles: IStyleFunctionOrObject<IPanelProps, IPanelStyles> = {
  main: { zIndex: 1 }
};

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
        key: "column1",
        maxWidth: 200,
        minWidth: 50,
        name: "Name"
      },
      {
        fieldName: "coverage",
        isResizable: true,
        key: "column2",
        maxWidth: 100,
        minWidth: 75,
        name: "Coverage"
      },
      {
        fieldName: "errorRate",
        isResizable: true,
        key: "column3",
        maxWidth: 100,
        minWidth: 75,
        name: "Error rate"
      }
    ];
  }

  public componentDidUpdate(prevProps: ICohortListProps): void {
    if (this.props.cohorts !== prevProps.cohorts) {
      const cohortListItems = this.getCohortListItems();
      this.setState({ items: cohortListItems });
    }
  }

  public render(): React.ReactNode {
    const classNames = cohortListStyles();
    const items = this.state.items;
    return (
      <Panel
        headerText="Cohort List"
        isOpen={this.props.isOpen}
        focusTrapZoneProps={focusTrapZoneProps}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        // layerProps={{ hostId: this.props.hostId }}
        isBlocking={false}
        onDismiss={this.props.onDismiss}
        styles={panelStyles}
      >
        <div className={classNames.divider}></div>
        <div className={classNames.section}>
          <div className={classNames.subsection}>
            <div className={classNames.header}>Cohort List</div>
            <DetailsList
              items={items}
              columns={this.columns}
              setKey="set"
              layoutMode={DetailsListLayoutMode.justified}
              selectionPreservedOnEmptyClick={true}
              checkboxVisibility={CheckboxVisibility.hidden}
            />
          </div>
        </div>
      </Panel>
    );
  }

  private getCohortListItems(): ICohortListItem[] {
    const allItems = this.props.cohorts.map(
      (errorCohort: ErrorCohort, index: number) => {
        return {
          coverage: errorCohort.errorCoverage.toFixed(2),
          errorRate: errorCohort.errorRate.toFixed(2),
          key: index,
          name: errorCohort.cohort.name
        };
      }
    );
    return allItems;
  }
}
