// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as FluentUI from "@fluentui/react";
import { FluentUIStyles } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import * as React from "react";
import { CanvasTools } from "vott-ct";

import * as FlyoutStyles from "../utils/FlyoutUtils";
import { getJoinedLabelString } from "../utils/labelUtils";

import {
  flyoutStyles,
  explanationImage,
  explanationImageWidth
} from "./Flyout.styles";
import * as FlyoutODUtils from "./FlyoutObjectDetectionUtils";

export class FlyoutObjectDetection extends React.Component<
  FlyoutODUtils.IFlyoutProps,
  FlyoutODUtils.IFlyoutState
> {
  public constructor(props: FlyoutODUtils.IFlyoutProps) {
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
    const metadata = FlyoutStyles.updateMetadata(item, fieldNames);
    const selectableObjectIndexes =
      FlyoutStyles.generateSelectableObjectDetectionIndexes(
        localization.InterpretVision.Dashboard.prefix,
        item
      );
    this.setState({ item, metadata, selectableObjectIndexes });
  }

  public componentDidUpdate(prevProps: FlyoutODUtils.IFlyoutProps): void {
    if (prevProps !== this.props) {
      const item = this.props.item;
      if (!item) {
        return;
      }
      const metadata = FlyoutStyles.updateMetadata(
        item,
        this.props.otherMetadataFieldNames
      );
      const selectableObjectIndexes =
        FlyoutStyles.generateSelectableObjectDetectionIndexes(
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
      <FluentUI.FocusZone>
        <FluentUI.Panel
          headerText={localization.InterpretVision.Dashboard.panelTitle}
          isOpen={isOpen}
          closeButtonAriaLabel="Close"
          onDismiss={this.callbackWrapper}
          isLightDismiss
          type={FluentUI.PanelType.large}
          className={classNames.mainContainer}
        >
          <FluentUI.Stack tokens={FlyoutODUtils.stackTokens.medium} horizontal>
            <FluentUI.Stack>
              <FluentUI.Stack.Item>
                <FluentUI.Separator className={classNames.separator} />
              </FluentUI.Stack.Item>
              <FluentUI.Stack.Item>
                <FluentUI.Stack
                  horizontal
                  tokens={FlyoutODUtils.stackTokens.medium}
                  horizontalAlign="space-around"
                  verticalAlign="center"
                >
                  <FluentUI.Stack.Item>
                    <FluentUI.Stack
                      tokens={FlyoutODUtils.stackTokens.large}
                      horizontalAlign="start"
                      verticalAlign="start"
                    >
                      <FluentUI.Stack
                        horizontal
                        tokens={{ childrenGap: "s1" }}
                        horizontalAlign="center"
                        verticalAlign="center"
                      >
                        <FluentUI.Stack.Item
                          className={classNames.iconContainer}
                        >
                          <FluentUI.Icon
                            iconName={
                              predictedY !== trueY ? "Cancel" : "Checkmark"
                            }
                            className={
                              predictedY !== trueY
                                ? classNames.errorIcon
                                : classNames.successIcon
                            }
                          />
                        </FluentUI.Stack.Item>
                        <FluentUI.Stack.Item>
                          {predictedY !== trueY ? (
                            <FluentUI.Text
                              variant="large"
                              className={classNames.errorTitle}
                            >
                              {
                                localization.InterpretVision.Dashboard
                                  .titleBarError
                              }
                            </FluentUI.Text>
                          ) : (
                            <FluentUI.Text
                              variant="large"
                              className={classNames.successTitle}
                            >
                              {
                                localization.InterpretVision.Dashboard
                                  .titleBarSuccess
                              }
                            </FluentUI.Text>
                          )}
                        </FluentUI.Stack.Item>
                      </FluentUI.Stack>
                      <FluentUI.Stack.Item>
                        <FluentUI.Text variant="large">
                          {localization.InterpretVision.Dashboard.indexLabel}
                          {item?.index}
                        </FluentUI.Text>
                      </FluentUI.Stack.Item>
                      <FluentUI.Stack.Item>
                        <FluentUI.Text variant="large">
                          {localization.InterpretVision.Dashboard.predictedY}
                          {predictedY}
                        </FluentUI.Text>
                      </FluentUI.Stack.Item>
                      <FluentUI.Stack.Item>
                        <FluentUI.Text variant="large">
                          {localization.InterpretVision.Dashboard.trueY}
                          {trueY}
                        </FluentUI.Text>
                      </FluentUI.Stack.Item>
                    </FluentUI.Stack>
                  </FluentUI.Stack.Item>
                  <FluentUI.Stack.Item className={classNames.imageContainer}>
                    <FluentUI.Stack.Item id="canvasToolsDiv">
                      <FluentUI.Stack.Item id="selectionDiv">
                        <div ref={this.callbackRef} id="editorDiv" />
                      </FluentUI.Stack.Item>
                    </FluentUI.Stack.Item>
                  </FluentUI.Stack.Item>
                </FluentUI.Stack>
              </FluentUI.Stack.Item>
              <FluentUI.Stack.Item>
                <FluentUI.Separator className={classNames.separator} />
              </FluentUI.Stack.Item>
              <FluentUI.Stack
                tokens={{ childrenGap: "l2" }}
                className={classNames.sectionIndent}
              >
                <FluentUI.Stack.Item>
                  <FluentUI.Text variant="large" className={classNames.title}>
                    {localization.InterpretVision.Dashboard.panelInformation}
                  </FluentUI.Text>
                </FluentUI.Stack.Item>
                <FluentUI.Stack.Item
                  className={classNames.featureListContainer}
                >
                  <FluentUI.List
                    items={this.state.metadata}
                    onRenderCell={FlyoutStyles.onRenderCell}
                  />
                </FluentUI.Stack.Item>
              </FluentUI.Stack>
            </FluentUI.Stack>
            <FluentUI.Stack>
              <FluentUI.Stack.Item>
                <FluentUI.Separator className={classNames.separator} />
              </FluentUI.Stack.Item>
              <FluentUI.Stack.Item>
                <FluentUI.Text variant="large" className={classNames.title}>
                  {localization.InterpretVision.Dashboard.panelExplanation}
                </FluentUI.Text>
              </FluentUI.Stack.Item>
              <FluentUI.Stack>
                {
                  <FluentUI.ComboBox
                    id={localization.InterpretVision.Dashboard.objectSelect}
                    label={localization.InterpretVision.Dashboard.chooseObject}
                    onChange={this.selectODChoiceFromDropdown}
                    selectedKey={this.state.odSelectedKey}
                    options={this.state.selectableObjectIndexes}
                    className={"classNames.dropdown"}
                    styles={FluentUIStyles.smallDropdownStyle}
                  />
                }
                <FluentUI.Stack>
                  {!this.props.loadingExplanation[item.index][
                    +this.state.odSelectedKey.slice(
                      FlyoutODUtils.ExcessLabelLen
                    )
                  ] ? (
                    <FluentUI.Stack.Item>
                      <FluentUI.Image
                        src={`data:image/jpg;base64,${this.props.explanations
                          .get(item.index)
                          ?.get(
                            +this.state.odSelectedKey.slice(
                              FlyoutODUtils.ExcessLabelLen
                            )
                          )}`}
                        width={explanationImageWidth}
                        style={explanationImage}
                      />
                    </FluentUI.Stack.Item>
                  ) : (
                    <FluentUI.Stack.Item>
                      <FluentUI.Spinner
                        label={`${localization.InterpretVision.Dashboard.loading} ${item?.index}`}
                      />
                    </FluentUI.Stack.Item>
                  )}
                </FluentUI.Stack>
              </FluentUI.Stack>
            </FluentUI.Stack>
          </FluentUI.Stack>
        </FluentUI.Panel>
      </FluentUI.FocusZone>
    );
  }
  private callbackWrapper = (): void => {
    const { callback } = this.props;
    this.setState({ odSelectedKey: "" });
    callback();
  };
  private selectODChoiceFromDropdown = (
    _event: React.FormEvent<FluentUI.IComboBox>,
    item?: FluentUI.IComboBoxOption
  ): void => {
    if (typeof item?.key === "string") {
      this.setState({ odSelectedKey: item?.key });
      if (this.state.item !== undefined) {
        this.props.onChange(
          this.state.item,
          +item.key.slice(FlyoutODUtils.ExcessLabelLen)
        );
      }
    }
  };
  private readonly callbackRef = (editorCallback: HTMLDivElement): void => {
    if (!editorCallback) {
      return;
    }
    const editor = new CanvasTools.Editor(editorCallback);
    const loadImage = async (): Promise<void> => {
      if (this.state.item) {
        // this.state.item.image is base64 encoded string
        await FlyoutODUtils.loadImageFromBase64(this.state.item.image, editor);
        FlyoutODUtils.drawBoundingBoxes(
          this.state.item,
          editorCallback,
          editor,
          this.props.dataset
        );
      }
    };
    loadImage();
  };
}
