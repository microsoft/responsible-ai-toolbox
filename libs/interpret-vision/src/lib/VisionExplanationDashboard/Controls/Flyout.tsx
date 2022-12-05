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
  explanations: Map<number, string>;
  isOpen: boolean;
  item: IVisionListItem | undefined;
  loadingExplanation: boolean[];
  otherMetadataFieldNames: string[];
  callback: () => void;
}

export interface IFlyoutState {
  item: IVisionListItem | undefined;
  metadata: Array<Array<string | number | boolean>> | undefined;
}

const stackTokens = {
  large: { childrenGap: "l2" },
  medium: { childrenGap: "l1" }
};

export class Flyout extends React.Component<IFlyoutProps, IFlyoutState> {
  public constructor(props: IFlyoutProps) {
    super(props);
    this.state = {
      item: undefined,
      metadata: undefined
    };
  }

  public componentDidMount(): void {
    const item = this.props.item;
    if (!item) {
      return;
    }
    const fieldNames = this.props.otherMetadataFieldNames;
    const metadata: Array<Array<string | number | boolean>> = [];
    fieldNames.forEach((fieldName) => {
      const itemField = item[fieldName];
      const itemValue = Array.isArray(itemField)
        ? itemField.join(",")
        : itemField;
      if (item[fieldName]) {
        metadata.push([fieldName, itemValue]);
      }
    });
    this.setState({ item, metadata });
  }

  public componentDidUpdate(prevProps: IFlyoutProps): void {
    if (prevProps !== this.props) {
      const item = this.props.item;
      if (!item) {
        return;
      }
      const fieldNames = this.props.otherMetadataFieldNames;
      const metadata: Array<Array<string | number | boolean>> = [];
      fieldNames.forEach((fieldName) => {
        const itemField = item[fieldName];
        const itemValue = Array.isArray(itemField)
          ? itemField.join(",")
          : itemField;
        if (item[fieldName]) {
          metadata.push([fieldName, itemValue]);
        }
      });
      this.setState({
        item: this.props.item,
        metadata
      });
    }
  }

  public render(): React.ReactNode {
    const { isOpen, callback } = this.props;
    const item = this.state.item;
    if (!item) {
      return <div />;
    }
    const index = item.index;
    const classNames = flyoutStyles();
    return (
      <FocusZone>
        <Panel
          headerText={localization.InterpretVision.Dashboard.panelTitle}
          isOpen={isOpen}
          closeButtonAriaLabel="Close"
          onDismiss={callback}
          isLightDismiss
          type={PanelType.medium}
          className={classNames.mainContainer}
        >
          <Stack tokens={stackTokens.medium}>
            <Stack.Item>
              <Separator className={classNames.separator} />
            </Stack.Item>
            <Stack.Item>
              <Stack
                horizontal
                tokens={stackTokens.medium}
                horizontalAlign="space-around"
                verticalAlign="center"
              >
                <Stack.Item>
                  <Stack
                    tokens={stackTokens.large}
                    horizontalAlign="start"
                    verticalAlign="start"
                  >
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
                        {item?.predictedY !== item?.trueY ? (
                          <Text
                            variant="large"
                            className={classNames.errorTitle}
                          >
                            {
                              localization.InterpretVision.Dashboard
                                .titleBarError
                            }
                          </Text>
                        ) : (
                          <Text
                            variant="large"
                            className={classNames.successTitle}
                          >
                            {
                              localization.InterpretVision.Dashboard
                                .titleBarSuccess
                            }
                          </Text>
                        )}
                      </Stack.Item>
                    </Stack>
                    <Stack.Item>
                      <Text variant="large">
                        {localization.InterpretVision.Dashboard.indexLabel}
                        {item?.index}
                      </Text>
                    </Stack.Item>
                    <Stack.Item>
                      <Text variant="large">
                        {localization.InterpretVision.Dashboard.predictedY}
                        {item?.predictedY}
                      </Text>
                    </Stack.Item>
                    <Stack.Item>
                      <Text variant="large">
                        {localization.InterpretVision.Dashboard.trueY}
                        {item?.trueY}
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
                </Stack.Item>
              </Stack>
            </Stack.Item>
            <Stack.Item>
              <Separator className={classNames.separator} />
            </Stack.Item>
            <Stack
              tokens={stackTokens.medium}
              className={classNames.sectionIndent}
            >
              <Stack.Item>
                <Text variant="large" className={classNames.title}>
                  {localization.InterpretVision.Dashboard.panelExplanation}
                </Text>
              </Stack.Item>
              {!this.props.loadingExplanation[index] ? (
                <Stack.Item>
                  <Image
                    src={`data:image/jpg;base64,${this.props.explanations.get(
                      index
                    )}`}
                    width="700px"
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
            </Stack>
            <Stack.Item>
              <Separator className={classNames.separator} />
            </Stack.Item>
            <Stack
              tokens={{ childrenGap: "l2" }}
              className={classNames.sectionIndent}
            >
              <Stack.Item>
                <Text variant="large" className={classNames.title}>
                  {localization.InterpretVision.Dashboard.panelInformation}
                </Text>
              </Stack.Item>
              <Stack.Item className={classNames.featureListContainer}>
                <List
                  items={this.state.metadata}
                  onRenderCell={this.onRenderCell}
                />
              </Stack.Item>
            </Stack>
          </Stack>
        </Panel>
      </FocusZone>
    );
  }

  private onRenderCell = (
    item?: Array<string | number | boolean> | undefined
  ): React.ReactNode => {
    if (!item) {
      return;
    }
    const classNames = flyoutStyles();
    return (
      <Stack.Item>
        <Stack
          horizontal
          tokens={{ childrenGap: "l2" }}
          verticalAlign="center"
          className={classNames.cell}
        >
          {item.map((val) => (
            <Stack.Item key={val.toString()}>
              <Text variant="large">{val}</Text>
            </Stack.Item>
          ))}
        </Stack>
        <Separator className={classNames.separator} />
      </Stack.Item>
    );
  };
}
