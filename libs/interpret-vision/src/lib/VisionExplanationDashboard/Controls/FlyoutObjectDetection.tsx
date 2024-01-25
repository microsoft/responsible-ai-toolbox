// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComboBox,
  FocusZone,
  IComboBox,
  IComboBoxOption,
  Image,
  Label,
  List,
  Panel,
  PanelType,
  Separator,
  Spinner,
  Stack,
  Text
} from "@fluentui/react";
import { FluentUIStyles } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import * as React from "react";
import { CanvasTools } from "vott-ct";

import * as FlyoutStyles from "../utils/FlyoutUtils";
import { getObjectDetectionImageAltText } from "../utils/getAltTextUtils";
import { getJoinedLabelString } from "../utils/labelUtils";

import { DetectionDetails } from "./DetectionDetails";
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
        item,
        this.props.dataset.class_names
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
          item,
          this.props.dataset.class_names
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
    const odCorrect = item.odCorrect;
    const odIncorrect = item.odIncorrect;
    const correctDetections = getJoinedLabelString(odCorrect);
    const incorrectDetections = getJoinedLabelString(odIncorrect);
    const alt = getObjectDetectionImageAltText(
      odCorrect,
      odIncorrect,
      item.index
    );
    return (
      <FocusZone>
        <Panel
          headerText={localization.InterpretVision.Dashboard.panelTitle}
          isOpen={isOpen}
          closeButtonAriaLabel="Close"
          onDismiss={this.callbackWrapper}
          isLightDismiss
          type={PanelType.large}
          className={classNames.odFlyoutContainer}
        >
          <Stack tokens={FlyoutODUtils.stackTokens.medium}>
            <Stack tokens={FlyoutODUtils.stackTokens.medium}>
              <Stack.Item>
                <Separator className={classNames.separator} />
              </Stack.Item>
              <Stack.Item>
                <Stack
                  tokens={FlyoutODUtils.stackTokens.medium}
                  horizontalAlign="space-around"
                  verticalAlign="center"
                >
                  <Stack.Item>
                    <DetectionDetails
                      item={item}
                      correctDetections={correctDetections}
                      incorrectDetections={incorrectDetections}
                    />
                  </Stack.Item>
                </Stack>
              </Stack.Item>
              <Stack.Item>
                <Separator className={classNames.separator} />
              </Stack.Item>
              <Stack
                tokens={FlyoutODUtils.stackTokens.large}
                className={classNames.sectionIndent}
              >
                <Stack.Item>
                  <Text variant="large" className={classNames.title}>
                    {localization.InterpretVision.Dashboard.panelInformation}
                  </Text>
                </Stack.Item>
                <Stack.Item
                  className={classNames.featureListContainer}
                  tabIndex={0}
                >
                  <List
                    items={this.state.metadata}
                    onRenderCell={FlyoutStyles.onRenderCell}
                  />
                </Stack.Item>
              </Stack>
              <FlyoutODUtils.ColorLegend />
              <Stack>
                <Stack.Item className={classNames.imageContainer}>
                  <Stack.Item id="canvasToolsDiv">
                    <Stack.Item id="selectionDiv">
                      <div ref={this.callbackRef} id="editorDiv" />
                    </Stack.Item>
                  </Stack.Item>
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
                <Label
                  id={
                    localization.InterpretVision.Dashboard.objectSelectionLabel
                  }
                >
                  {localization.InterpretVision.Dashboard.chooseObject}
                </Label>
                <ComboBox
                  id={localization.InterpretVision.Dashboard.objectSelect}
                  onChange={this.selectODChoiceFromDropdown}
                  selectedKey={this.state.odSelectedKey}
                  options={this.state.selectableObjectIndexes}
                  className="classNames.dropdown"
                  styles={FluentUIStyles.smallDropdownStyle}
                  ariaLabel={
                    localization.InterpretVision.Dashboard.chooseObject
                  }
                  aria-labelledby={
                    localization.InterpretVision.Dashboard.objectSelectionLabel
                  }
                />
                <Stack>
                  {!this.props.loadingExplanation[item.index][
                    +this.state.odSelectedKey.slice(
                      FlyoutODUtils.ExcessLabelLen
                    )
                  ] && (
                    <Stack.Item className={classNames.imageContainer}>
                      <Image
                        alt={alt}
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
                    </Stack.Item>
                  )}
                  {this.state.odSelectedKey !== "" &&
                    this.props.loadingExplanation[item.index][
                      +this.state.odSelectedKey.slice(
                        FlyoutODUtils.ExcessLabelLen
                      )
                    ] && (
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
  private callbackWrapper = (): void => {
    const { callback } = this.props;
    this.setState({ odSelectedKey: "" });
    callback();
  };
  private selectODChoiceFromDropdown = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
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
        const item = this.state.item;
        const altText = getObjectDetectionImageAltText(
          item.odCorrect,
          item.odIncorrect,
          item.index
        );
        // this.state.item.image is base64 encoded string
        await FlyoutODUtils.loadImageFromBase64(item.image, editor, altText);
        FlyoutODUtils.drawBoundingBoxes(
          item,
          editorCallback,
          editor,
          this.props.dataset
        );
      }
    };
    loadImage();
  };
}
