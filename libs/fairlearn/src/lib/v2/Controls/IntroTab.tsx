// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PrimaryButton, Stack, Text } from "office-ui-fabric-react";
import React from "react";
import { localization } from "../../Localization/localization";

import { ReactComponent } from "./IntroTabIcon.svg";
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
          <Stack
            wrap
            horizontalAlign={"start"}
            className={styles.firstSectionContainer}
          >
            <Text className={styles.firstSectionTitle} block>
              {localization.Intro.welcome}
            </Text>
            <Text className={styles.firstSectionSubtitle} block>
              {localization.Intro.fairlearnDashboard}
            </Text>
            <Text className={styles.firstSectionBody} variant={"large"} block>
              {localization.Intro.introBody}
            </Text>
            <div className={styles.firstSectionGraphics}>
              <ReactComponent />
            </div>
          </Stack>
        </div>
        <div className={styles.lowerSection}>
          <div className={styles.stepsContainer}>
            <Text variant={"large"} className={styles.boldStep}>
              {localization.Intro.explanatoryStep}
            </Text>
            <div className={styles.explanatoryStep}>
              <div>
                <Text variant={"large"} className={styles.numericLabel}>
                  01
                </Text>
                <Text variant={"large"}>{localization.Intro.features}</Text>
              </div>
              <Text className={styles.explanatoryText} block>
                {localization.Intro.featuresInfo}
              </Text>
            </div>
            <div className={styles.explanatoryStep}>
              <div>
                <Text variant={"large"} className={styles.numericLabel}>
                  02
                </Text>
                <Text variant={"large"}>{localization.Intro.accuracy}</Text>
              </div>
              <Text className={styles.explanatoryText} block>
                {localization.Intro.accuracyInfo}
              </Text>
            </div>
            <div className={styles.explanatoryStep}>
              <div>
                <Text variant={"large"} className={styles.numericLabel}>
                  03
                </Text>
                <Text variant={"large"}>{localization.Intro.parity}</Text>
              </div>
              <Text className={styles.explanatoryText} block>
                {localization.Intro.parityInfo}
              </Text>
            </div>
          </div>
          <Stack horizontalAlign={"end"} style={{ marginTop: "20px" }}>
            <PrimaryButton
              id="nextButton"
              className={styles.getStarted}
              onClick={this.props.onNext}
            >
              {localization.Intro.getStarted}
            </PrimaryButton>
          </Stack>
        </div>
      </Stack>
    );
  }
}
