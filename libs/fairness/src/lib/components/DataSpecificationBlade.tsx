// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Text } from "office-ui-fabric-react";
import React from "react";

import { DataSpecificationBladeStyles } from "./DataSpecificationBlade.styles";

export interface IDataSpecProps {
  numberRows: number;
  featureNames: string[];
}

export class DataSpecificationBlade extends React.PureComponent<
  IDataSpecProps
> {
  public render(): React.ReactNode {
    const styles = DataSpecificationBladeStyles();
    return (
      <div className={styles.frame}>
        <Text variant={"small"} className={styles.title} block>
          {localization.dataSpecifications}
        </Text>
        <Text variant={"small"} className={styles.text} block>
          {this.props.featureNames.length === 1
            ? localization.Fairness.singleAttributeCount
            : localization.Fairness.formatString(
                localization.Fairness.attributesCount,
                this.props.featureNames.length
              )}
        </Text>
        <Text variant={"small"} className={styles.text} block>
          {localization.formatString(
            localization.Fairness.instanceCount,
            this.props.numberRows
          )}
        </Text>
      </div>
    );
  }
}
