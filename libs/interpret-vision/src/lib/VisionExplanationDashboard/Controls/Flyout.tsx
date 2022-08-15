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
  Separator
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { IDatasetSummary } from "../Interfaces/IExplanationDashboardProps";

import { flyoutStyles } from "./Flyout.styles";
import { IListItem } from "./ImageList";

export interface IFlyoutProps {
  data: IDatasetSummary;
  isOpen: boolean;
  item: IListItem | undefined;
  callback: () => void;
}

const stackTokens = {
  childrenGap: "l1"
};

export class Flyout extends React.Component<IFlyoutProps> {
  public render(): React.ReactNode {
    const { data, isOpen, item, callback } = this.props;

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
              <Separator styles={{ root: { width: "100%" } }} />
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
                    src={item?.image}
                    className={classNames.image}
                    imageFit={ImageFit.contain}
                  />
                  <Text variant="large" className={classNames.label}>
                    {item?.title}
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
            <Stack.Item>
              <Image
                src={`data:image/jpg;base64,${data.localExplanations[0]}`}
                width="800px"
                className={classNames.explanation}
              />
            </Stack.Item>
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
