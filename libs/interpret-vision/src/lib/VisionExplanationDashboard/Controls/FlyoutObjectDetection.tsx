// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
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
import { FluentUIStyles, IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import {
  generateSelectableObjectDetectionIndexes,
  onRenderCell,
  updateMetadata
} from "../utils/FlyoutUtils";
import { getJoinedLabelString } from "../utils/labelUtils";

import {
  flyoutStyles,
  explanationImage,
  explanationImageWidth
} from "./Flyout.styles";

export interface IFlyoutProps {
  explanations: Map<number, Map<number, string>>;
  isOpen: boolean;
  item: IVisionListItem | undefined;
  loadingExplanation: boolean[][];
  otherMetadataFieldNames: string[];
  callback: () => void;
  onChange: (item: IVisionListItem, index: number) => void;
}

export interface IFlyoutState {
  item: IVisionListItem | undefined;
  metadata: Array<Array<string | number | boolean>> | undefined;
  selectableObjectIndexes: IComboBoxOption[];
  odSelectedKey: string;
}

const stackTokens = {
  large: { childrenGap: "l2" },
  medium: { childrenGap: "l1" }
};
const ExcessLabelLen = localization.InterpretVision.Dashboard.prefix.length;
export class FlyoutObjectDetection extends React.Component<
  IFlyoutProps,
  IFlyoutState
> {
  public constructor(props: IFlyoutProps) {
    super(props);
    this.state = {
      item: undefined,
      metadata: undefined,
      odSelectedKey: "",
      selectableObjectIndexes: []
    };
  }
  public componentDidMount(): void {
    const item = this.props.item;
    if (!item) {
      return;
    }
    const fieldNames = this.props.otherMetadataFieldNames;
    const metadata = updateMetadata(item, fieldNames);
    const selectableObjectIndexes = generateSelectableObjectDetectionIndexes(
      localization.InterpretVision.Dashboard.prefix,
      item
    );
    this.setState({ item, metadata, selectableObjectIndexes });
  }
  public componentDidUpdate(prevProps: IFlyoutProps): void {
    if (prevProps !== this.props) {
      const item = this.props.item;
      if (!item) {
        return;
      }
      const metadata = updateMetadata(item, this.props.otherMetadataFieldNames);
      const selectableObjectIndexes = generateSelectableObjectDetectionIndexes(
        localization.InterpretVision.Dashboard.prefix,
        item
      );
      this.setState({
        item: this.props.item,
        metadata,
        selectableObjectIndexes
      });
    }
  }
  public callbackWrapper = (): void => {
    const { callback } = this.props;
    this.setState({ odSelectedKey: "" });
    callback();
  };
  public render(): React.ReactNode {
    const { isOpen } = this.props;
    const item = this.state.item;
    if (!item) {
      return <div />;
    }
    const classNames = flyoutStyles();
    const predictedY = getJoinedLabelString(item?.predictedY);
    const trueY = getJoinedLabelString(item?.trueY);
    return (
      <FocusZone>
        <Panel
          headerText={localization.InterpretVision.Dashboard.panelTitle}
          isOpen={isOpen}
          closeButtonAriaLabel="Close"
          onDismiss={this.callbackWrapper}
          isLightDismiss
          type={PanelType.large}
          className={classNames.mainContainer}
        >
          <Stack tokens={stackTokens.medium} horizontal>
            <Stack>
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
                              predictedY !== trueY ? "Cancel" : "Checkmark"
                            }
                            className={
                              predictedY !== trueY
                                ? classNames.errorIcon
                                : classNames.successIcon
                            }
                          />
                        </Stack.Item>
                        <Stack.Item>
                          {predictedY !== trueY ? (
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
                          {predictedY}
                        </Text>
                      </Stack.Item>
                      <Stack.Item>
                        <Text variant="large">
                          {localization.InterpretVision.Dashboard.trueY}
                          {trueY}
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
                    onRenderCell={onRenderCell}
                  />
                </Stack.Item>
              </Stack>
            </Stack>
            <Stack>
              <Stack.Item>
                <Separator className={classNames.separator} />
              </Stack.Item>
              <Stack.Item>
                <Text variant="large" className={classNames.title}>
                  {localization.InterpretVision.Dashboard.panelExplanation}
                </Text>
              </Stack.Item>
              <Stack>
                {
                  <ComboBox
                    id={localization.InterpretVision.Dashboard.objectSelect}
                    label={localization.InterpretVision.Dashboard.chooseObject}
                    onChange={this.selectODChoiceFromDropdown}
                    selectedKey={this.state.odSelectedKey}
                    options={this.state.selectableObjectIndexes}
                    className={"classNames.dropdown"}
                    styles={FluentUIStyles.smallDropdownStyle}
                  />
                }
                <Stack>
                  {!this.props.loadingExplanation[item.index][
                    +this.state.odSelectedKey.slice(ExcessLabelLen)
                  ] ? (
                    <Stack.Item>
                      <Image
                        src={`data:image/jpg;base64,${this.props.explanations
                          .get(item.index)
                          ?.get(
                            +this.state.odSelectedKey.slice(ExcessLabelLen)
                          )}`}
                        width={explanationImageWidth}
                        style={explanationImage}
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
              </Stack>
            </Stack>
          </Stack>
        </Panel>
      </FocusZone>
    );
  }
  private selectODChoiceFromDropdown = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      this.setState({ odSelectedKey: item?.key });
      if (this.state.item !== undefined) {
        // Remove "Object: " from labels. We only want index
        this.props.onChange(this.state.item, +item.key.slice(ExcessLabelLen));
      }
    }
  };
}
