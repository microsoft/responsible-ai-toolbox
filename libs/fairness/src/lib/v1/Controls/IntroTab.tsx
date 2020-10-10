// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { ActionButton, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { IntroTabStyles } from "./IntroTab.styles";

export interface IIntroTabProps {
  onNext: () => void;
}

export class IntroTab extends React.PureComponent<IIntroTabProps> {
  public render(): React.ReactNode {
    const styles = IntroTabStyles();
    return (
      <Stack style={{ height: "100%" }}>
        <div className={styles.firstSection}>
          <Text className={styles.firstSectionTitle} block>
            {localization.Fairness.Intro.welcome}
          </Text>
          <Text className={styles.firstSectionSubtitle} block>
            {localization.Fairness.Intro.fairnessDashboard}
          </Text>
          <Text variant={"large"} block>
            {localization.Fairness.Intro.introBody}
          </Text>
        </div>
        <div className={styles.lowerSection}>
          <div className={styles.stepsContainer}>
            <Text variant={"large"} className={styles.boldStep}>
              {localization.Fairness.Intro.explanatoryStep}
            </Text>
            <div className={styles.explanatoryStep}>
              <div>
                <Text variant={"large"} className={styles.numericLabel}>
                  01
                </Text>
                <Text variant={"large"}>
                  {localization.Fairness.Intro.features}
                </Text>
              </div>
              <Text className={styles.explanatoryText} block>
                {localization.Fairness.Intro.featuresInfo}
              </Text>
            </div>
            <div className={styles.explanatoryStep}>
              <div>
                <Text variant={"large"} className={styles.numericLabel}>
                  02
                </Text>
                <Text variant={"large"}>
                  {localization.Fairness.Intro.performance}
                </Text>
              </div>
              <Text className={styles.explanatoryText} block>
                {localization.Fairness.Intro.performanceInfo}
              </Text>
            </div>
          </div>
          <Stack horizontalAlign={"center"}>
            <ActionButton
              iconProps={{ iconName: "Forward" }}
              className={styles.getStarted}
              onClick={this.props.onNext}
            >
              {localization.Fairness.Intro.getStarted}
            </ActionButton>
          </Stack>
        </div>
      </Stack>
    );
  }
}
