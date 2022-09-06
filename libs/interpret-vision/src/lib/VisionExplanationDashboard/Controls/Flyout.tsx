// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Icon,
  Image,
  ImageFit,
  List,
  Panel,
  PanelType,
  FocusZone,
  Stack,
  Text,
  Spinner,
  Separator
} from "@fluentui/react";
import { IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { flyoutStyles } from "./Flyout.styles";

export interface IFlyoutProps {
  explanation: string;
  isOpen: boolean;
  item: IVisionListItem | undefined;
  loadingExplanation: boolean;
  callback: () => void;
}

const stackTokens = {
  childrenGap: "l1"
};

export class Flyout extends React.Component<IFlyoutProps> {
  public constructor(props: IFlyoutProps) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactNode {
    const { isOpen, item, callback } = this.props;

    const classNames = flyoutStyles();

    const list = [];

    for (let i = 0; i < 30; i++) {
      list.push({ title: "Feature 1", value: "value" });
    }

    return (
      <FocusZone>
        <Panel
          headerText={localization.InterpretVision.Dashboard.panelTitle}
          isOpen={isOpen}
          closeButtonAriaLabel="Close"
          onDismiss={callback}
          isLightDismiss
          type={PanelType.custom}
          customWidth="700px"
          className={classNames.mainContainer}
        >
          <Stack tokens={stackTokens}>
            <Stack.Item>
              <Separator className={classNames.separator} />
            </Stack.Item>
            <Stack.Item>
              <Stack
                horizontal
                tokens={stackTokens}
                horizontalAlign="space-around"
                verticalAlign="center"
              >
                <Stack.Item>
                  <Stack
                    horizontal
                    tokens={{ childrenGap: "s1" }}
                    horizontalAlign="center"
                    verticalAlign="center"
                  >
                    <Stack.Item className={classNames.iconContainer}>
                      <Icon
                        iconName={
                          item?.predictedY !== item?.trueY
                            ? "Cancel"
                            : "Checkmark"
                        }
                        className={
                          item?.predictedY !== item?.trueY
                            ? classNames.errorIcon
                            : classNames.successIcon
                        }
                      />
                    </Stack.Item>
                    <Stack.Item>
                      <Text variant="large" className={classNames.title}>
                        {item?.predictedY !== item?.trueY
                          ? localization.InterpretVision.Dashboard.titleBarError
                          : localization.InterpretVision.Dashboard
                              .titleBarSuccess}
                      </Text>
                    </Stack.Item>
                  </Stack>
                </Stack.Item>
                <Stack.Item className={classNames.imageContainer}>
                  <Image
                    src={`data:image/jpg;base64,${item?.image}`}
                    className={classNames.image}
                    imageFit={ImageFit.contain}
                  />
                  <Text variant="large" className={classNames.label}>
                    {item?.predictedY}
                  </Text>
                </Stack.Item>
              </Stack>
            </Stack.Item>
            <Stack.Item>
              <Separator className={classNames.separator} />
            </Stack.Item>
            <Stack.Item>
              <Text variant="large" className={classNames.title}>
                {localization.InterpretVision.Dashboard.panelExplanation}
              </Text>
            </Stack.Item>
            {!this.props.loadingExplanation ? (
              <Stack.Item>
                <Image
                  src={`data:image/jpg;base64,${this.props.explanation}`}
                  width="800px"
                  style={{ position: "relative", right: 85 }}
                />
              </Stack.Item>
            ) : (
              <Stack.Item>
                <Spinner
                  label={`${localization.InterpretVision.Dashboard.loading} ${item?.index}`}
                />
              </Stack.Item>
            )}
            <Stack.Item>
              <Separator className={classNames.separator} />
            </Stack.Item>
            <Stack.Item>
              <Text variant="large" className={classNames.title}>
                {localization.InterpretVision.Dashboard.panelInformation}
              </Text>
            </Stack.Item>
            <Stack.Item className={classNames.featureListContainer}>
              <List items={list} onRenderCell={this.onRenderCell} />
            </Stack.Item>
          </Stack>
        </Panel>
      </FocusZone>
    );
  }

  private onRenderCell = (
    item?: { title: string; value: string } | undefined
  ) => {
    const classNames = flyoutStyles();

    return (
      <Stack.Item>
        <Stack
          horizontal
          tokens={{ childrenGap: "l2" }}
          verticalAlign="center"
          className={classNames.cell}
        >
          <Stack.Item>
            <Text variant="large">{item?.title}</Text>
          </Stack.Item>
          <Stack.Item>
            <Text variant="large">{item?.value}</Text>
          </Stack.Item>
        </Stack>
      </Stack.Item>
    );
  };
}
