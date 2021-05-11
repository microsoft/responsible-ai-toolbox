// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  Callout,
  FontWeights,
  getTheme,
  IconButton,
  Link,
  mergeStyleSets,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

interface ICasualCalloutState {
  showCallout: boolean;
  selectedDataIndex?: number;
}

export class CasualCallout extends React.Component<
  Record<string, unknown>,
  ICasualCalloutState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = {
      showCallout: false
    };
  }

  public render(): React.ReactNode {
    const theme = getTheme();
    const styles = mergeStyleSets({
      callout: {
        padding: "20px 24px",
        width: 320
      },
      description: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px"
      },
      infoButton: {
        borderRadius: "50%",
        color: theme.semanticColors.bodyText,
        float: "left",
        fontSize: "12px",
        fontWeight: "600",
        height: "15px",
        lineHeight: "14px",
        marginRight: "3px",
        marginTop: "3px",
        textAlign: "center",
        width: "15px"
      },
      label: {
        display: "inline-block",
        flex: "1",
        fontSize: 14,
        textAlign: "left"
      },
      link: {
        display: "block",
        marginTop: 20
      },
      title: {
        fontWeight: FontWeights.semilight,
        marginBottom: 12
      }
    });
    const buttonId = "casualCalloutBtn";
    const labelId = "casualCalloutLabel";
    const descriptionId = "casualCalloutDesp";
    return (
      <>
        <Stack horizontal>
          <IconButton
            iconProps={{ iconName: "Info" }}
            id={buttonId}
            onClick={this.toggleInfo}
            className={styles.infoButton}
          />
          <Text variant={"medium"} className={styles.label}>
            {localization.CasualAnalysis.MainMenu.why}
          </Text>
        </Stack>
        {this.state.showCallout && (
          <Callout
            className={styles.callout}
            ariaLabelledBy={labelId}
            ariaDescribedBy={descriptionId}
            role="alertdialog"
            gapSpace={0}
            target={`#${buttonId}`}
            onDismiss={this.toggleInfo}
            setInitialFocus
          >
            <Text block variant="xLarge" className={styles.title} id={labelId}>
              {localization.CasualAnalysis.AggregateView.unconfounding}
            </Text>
            <Text block variant="small" id={descriptionId}>
              {localization.CasualAnalysis.AggregateView.confoundingFeature}
            </Text>
            <Link
              href="http://microsoft.com"
              target="_blank"
              className={styles.link}
            >
              {localization.CasualAnalysis.MainMenu.learnMore}
            </Link>
          </Callout>
        )}
      </>
    );
  }
  private readonly toggleInfo = (): void => {
    this.setState((prevState) => {
      return { showCallout: !prevState.showCallout };
    });
  };
}
