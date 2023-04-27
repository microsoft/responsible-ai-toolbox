// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { ICompositeFilter, IFilter } from "../../Interfaces/IFilter";
import { getCompositeFilterString } from "../../util/getCompositeFilterString";
import { JointDataset } from "../../util/JointDataset";

import { CompositeFilterList } from "./CompositeFilterList";
import { FilterList } from "./FilterList";

export interface ICohortEditorFilterList {
  filters: IFilter[];
  compositeFilters: ICompositeFilter[];
  jointDataset: JointDataset;
  editFilter?(index: number): void;
  removeFilter?(index: number): void;
  removeCompositeFilter?(index: number): void;
}

export class CohortEditorFilterList extends React.Component<ICohortEditorFilterList> {
  public render(): React.ReactNode {
    const compositeStrings = getCompositeFilterString(
      this.props.compositeFilters,
      this.props.jointDataset
    );
    return (
      <>
        <Label>{localization.Interpret.CohortEditor.addedFilters}</Label>
        <FilterList
          filters={this.props.filters}
          editFilter={this.props.editFilter}
          removeFilter={this.props.removeFilter}
        />
        <CompositeFilterList
          compositeStrings={compositeStrings}
          jointDataset={this.props.jointDataset}
          removeFilter={this.props.removeCompositeFilter}
        />
        {this.props.filters.length + this.props.compositeFilters.length ===
          0 && (
          <div>
            <Text variant={"smallPlus"}>
              {localization.Interpret.CohortEditor.noAddedFilters}
            </Text>
          </div>
        )}
      </>
    );
  }
}
