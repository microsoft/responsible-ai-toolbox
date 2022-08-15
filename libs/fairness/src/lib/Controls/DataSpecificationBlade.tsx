// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { DataSpecificationBladeStyles } from "./DataSpecificationBlade.styles";

export interface IDataSpecProps {
  numberRows: number;
  featureNames: string[];
}

export class DataSpecificationBlade extends React.PureComponent<IDataSpecProps> {
  public render(): React.ReactNode {
    const styles = DataSpecificationBladeStyles();
    return (
      <Stack className={styles.frame}>
        <Text variant={"small"} nowrap className={styles.title} block>
          {localization.Fairness.dataSpecifications}
        </Text>
        <Text variant={"small"} nowrap className={styles.text} block>
          {this.props.featureNames.length === 1
            ? localization.Fairness.singleAttributeCount
            : localization.formatString(
                localization.Fairness.attributesCount,
                this.props.featureNames.length
              )}
        </Text>
        <Text variant={"small"} nowrap className={styles.text} block>
          {localization.formatString(
            localization.Fairness.instanceCount,
            this.props.numberRows
          )}
        </Text>
      </Stack>
    );
  }
}
