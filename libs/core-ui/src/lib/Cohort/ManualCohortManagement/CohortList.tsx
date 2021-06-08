// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  DefaultButton,
  PrimaryButton,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import {
  IExplanationModelMetadata,
  ModelTypes
} from "../../Interfaces/IExplanationContext";
import { JointDataset } from "../../util/JointDataset";
import { limitStringLength } from "../../util/string";
import { Cohort } from "../Cohort";

export interface ICohortListProps {
  cohorts: Cohort[];
  metadata: IExplanationModelMetadata;
  jointDataset: JointDataset;
  addCohort: () => void;
  showEditList: () => void;
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
          <Stack tokens={{ childrenGap: "s1" }}>
            <PrimaryButton
              disabled={!this.props.jointDataset.dataDict?.length}
              onClick={this.props.addCohort}
              text={localization.Interpret.CohortBanner.addCohort}
              iconProps={{ iconName: "Add" }}
              styles={{ label: { whiteSpace: "nowrap" } }}
            />
            <DefaultButton
              disabled={!this.props.jointDataset.dataDict?.length}
              onClick={this.props.showEditList}
              text={localization.Interpret.CohortBanner.editCohort}
              iconProps={{ iconName: "Edit" }}
              styles={{ label: { whiteSpace: "nowrap" } }}
            />
          </Stack>
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
          {this.props.cohorts.map((cohort, idx) => {
            return (
              <Stack.Item tokens={{ padding: "l1" }} key={idx}>
                <Stack>
                  <Text variant={"mediumPlus"} title={cohort.name}>
                    {limitStringLength(cohort.name, 15)}
                  </Text>
                  <Text variant={"xSmall"}>
                    {localization.formatString(
                      localization.Interpret.CohortBanner.datapoints,
                      cohort.filteredData.length
                    )}
                  </Text>
                  <Text variant={"xSmall"}>
                    {localization.formatString(
                      localization.Interpret.CohortBanner.filters,
                      cohort.filters.length
                    )}
                  </Text>
                </Stack>
              </Stack.Item>
            );
          })}
        </Stack>
      </Stack>
    );
  }
}
