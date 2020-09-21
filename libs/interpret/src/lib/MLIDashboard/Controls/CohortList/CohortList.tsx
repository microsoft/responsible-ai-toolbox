// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CommandBarButton, PrimaryButton, Text } from "office-ui-fabric-react";
import React from "react";

import { localization } from "../../../Localization/localization";
import { Cohort } from "../../Cohort";
import {
  IExplanationModelMetadata,
  ModelTypes
} from "../../IExplanationContext";
import { JointDataset } from "../../JointDataset";

import { cohortListStyles } from "./CohortList.styles";

export interface ICohortListProps {
  cohorts: Cohort[];
  metadata: IExplanationModelMetadata;
  jointDataset: JointDataset;
  editCohort: (index: number) => void;
  cloneAndEdit: (index: number) => void;
}

export class CohortList extends React.PureComponent<ICohortListProps> {
  public static bannerId = "cohortBannerId";
  public render(): React.ReactNode {
    const classNames = cohortListStyles();

    let modelType: string;
    if (this.props.metadata.modelType === ModelTypes.Binary) {
      modelType = localization.CohortBanner.binaryClassifier;
    } else if (this.props.metadata.modelType === ModelTypes.Multiclass) {
      modelType = localization.CohortBanner.multiclassClassifier;
    } else {
      modelType = localization.CohortBanner.regressor;
    }
    return (
      <div className={classNames.banner} id={CohortList.bannerId}>
        <div className={classNames.summaryBox}>
          <Text variant={"xSmall"} block className={classNames.summaryLabel}>
            {localization.CohortBanner.dataStatistics.toUpperCase()}
          </Text>
          <Text block className={classNames.summaryItemText}>
            {modelType}
          </Text>
          {this.props.jointDataset.hasDataset && (
            <div>
              <Text block className={classNames.summaryItemText}>
                {localization.formatString(
                  localization.CohortBanner.datapoints,
                  this.props.jointDataset.datasetRowCount
                )}
              </Text>
              <Text block className={classNames.summaryItemText}>
                {localization.formatString(
                  localization.CohortBanner.features,
                  this.props.jointDataset.datasetFeatureCount
                )}
              </Text>
            </div>
          )}
        </div>
        <div className={classNames.cohortList}>
          <Text variant={"xSmall"} block className={classNames.summaryLabel}>
            {localization.CohortBanner.datasetCohorts.toUpperCase()}
          </Text>
          {this.props.cohorts.map((cohort, index) => {
            return (
              <div className={classNames.cohortBox} key={index}>
                <div className={classNames.cohortLabelWrapper}>
                  <Text
                    variant={"mediumPlus"}
                    nowrap
                    className={classNames.cohortLabel}
                  >
                    {cohort.name}
                  </Text>

                  <CommandBarButton
                    ariaLabel="More items"
                    role="menuitem"
                    styles={{
                      menuIcon: classNames.menuIcon,
                      root: classNames.commandButton
                    }}
                    disabled={!this.props.jointDataset.dataDict?.length}
                    menuIconProps={{ iconName: "More" }}
                    menuProps={{
                      items: [
                        {
                          key: "item4",
                          name: localization.CohortBanner.editCohort,
                          onClick: this.props.editCohort.bind(this, index)
                        },
                        {
                          key: "item5",
                          name: localization.CohortBanner.duplicateCohort,
                          onClick: this.props.cloneAndEdit.bind(this, index)
                        }
                      ]
                    }}
                  />
                </div>
                <Text
                  block
                  variant={"xSmall"}
                  className={classNames.summaryItemText}
                >
                  {localization.formatString(
                    localization.CohortBanner.datapoints,
                    cohort.filteredData.length
                  )}
                </Text>
                <Text
                  block
                  variant={"xSmall"}
                  className={classNames.summaryItemText}
                >
                  {localization.formatString(
                    localization.CohortBanner.filters,
                    cohort.filters.length
                  )}
                </Text>
              </div>
            );
          })}
          <PrimaryButton
            disabled={!this.props.jointDataset.dataDict?.length}
            onClick={this.props.editCohort.bind(
              this,
              this.props.cohorts.length
            )}
            text={localization.CohortBanner.addCohort}
          />
        </div>
      </div>
    );
  }
}
