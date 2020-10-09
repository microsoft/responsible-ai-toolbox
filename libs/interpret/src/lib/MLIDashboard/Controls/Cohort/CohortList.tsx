// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  CommandBarButton,
  PrimaryButton,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { Cohort } from "../../Cohort";
import {
  IExplanationModelMetadata,
  ModelTypes
} from "../../IExplanationContext";
import { JointDataset } from "../../JointDataset";

export interface ICohortListProps {
  cohorts: Cohort[];
  metadata: IExplanationModelMetadata;
  jointDataset: JointDataset;
  editCohort: (index: number) => void;
  cloneAndEdit: (index: number) => void;
}

export class CohortList extends React.PureComponent<ICohortListProps> {
  public render(): React.ReactNode {
    let modelType: string;
    if (this.props.metadata.modelType === ModelTypes.Binary) {
      modelType = localization.Interpret.CohortBanner.binaryClassifier;
    } else if (this.props.metadata.modelType === ModelTypes.Multiclass) {
      modelType = localization.Interpret.CohortBanner.multiclassClassifier;
    } else {
      modelType = localization.Interpret.CohortBanner.regressor;
    }
    return (
      <Stack tokens={{ childrenGap: "l1", padding: "l1" }}>
        <Stack.Item>
          <PrimaryButton
            disabled={!this.props.jointDataset.dataDict?.length}
            onClick={this.props.editCohort.bind(
              this,
              this.props.cohorts.length
            )}
            text={localization.Interpret.CohortBanner.addCohort}
            iconProps={{ iconName: "Add" }}
            styles={{ label: { whiteSpace: "nowrap" } }}
          />
        </Stack.Item>
        <Stack>
          <Stack.Item>
            <Text variant={"small"}>
              {localization.Interpret.CohortBanner.dataStatistics.toUpperCase()}
            </Text>
          </Stack.Item>
          <Stack.Item>
            <Text>{modelType}</Text>
          </Stack.Item>
          <Stack.Item>
            <Text variant={"xSmall"}>
              {localization.formatString(
                localization.Interpret.CohortBanner.datapoints,
                this.props.jointDataset.datasetRowCount
              )}
            </Text>
          </Stack.Item>
          <Stack.Item>
            <Text variant={"xSmall"}>
              {localization.formatString(
                localization.Interpret.CohortBanner.features,
                this.props.jointDataset.datasetFeatureCount
              )}
            </Text>
          </Stack.Item>
        </Stack>
        <Stack>
          <Stack.Item>
            <Text variant={"small"}>
              {localization.Interpret.CohortBanner.datasetCohorts.toUpperCase()}
            </Text>
          </Stack.Item>
          {this.props.cohorts.map((cohort, index) => {
            return (
              <Stack.Item tokens={{ padding: "l1" }}>
                <Stack>
                  <Stack.Item>
                    <CommandBarButton
                      ariaLabel="More items"
                      role="menuitem"
                      disabled={!this.props.jointDataset.dataDict?.length}
                      menuIconProps={{
                        iconName: "More",
                        style: { fontSize: "x-large" }
                      }}
                      menuProps={{
                        items: [
                          {
                            key: "item4",
                            name:
                              localization.Interpret.CohortBanner.editCohort,
                            onClick: (): void => this.props.editCohort(index)
                          },
                          {
                            key: "item5",
                            name:
                              localization.Interpret.CohortBanner
                                .duplicateCohort,
                            onClick: (): void => this.props.cloneAndEdit(index)
                          }
                        ]
                      }}
                    >
                      <Text variant={"mediumPlus"}>{cohort.name}</Text>
                    </CommandBarButton>
                  </Stack.Item>
                  <Stack.Item>
                    <Text variant={"xSmall"}>
                      {localization.formatString(
                        localization.Interpret.CohortBanner.datapoints,
                        cohort.filteredData.length
                      )}
                    </Text>
                  </Stack.Item>
                  <Stack.Item>
                    <Text variant={"xSmall"}>
                      {localization.formatString(
                        localization.Interpret.CohortBanner.filters,
                        cohort.filters.length
                      )}
                    </Text>
                  </Stack.Item>
                </Stack>
              </Stack.Item>
            );
          })}
        </Stack>
      </Stack>
    );
  }
}
