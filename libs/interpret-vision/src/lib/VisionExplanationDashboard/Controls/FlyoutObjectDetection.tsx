// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComboBox,
  getTheme,
  IComboBox,
  IComboBoxOption,
  Icon,
  Image as ImageTag,
  List,
  Panel,
  PanelType,
  FocusZone,
  Stack,
  Text,
  Spinner,
  Separator
} from "@fluentui/react";
import { FluentUIStyles, IDataset, IVisionListItem } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import * as React from "react";
import { CanvasTools } from "vott-ct";
import { Editor } from "vott-ct/lib/js/CanvasTools/CanvasTools.Editor";
import { RegionData } from "vott-ct/lib/js/CanvasTools/Core/RegionData";

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
  dataset: IDataset;
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
  imageCallback?: HTMLImageElement;
  editorCallback?: HTMLDivElement;
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

  private readonly callbackRef = (editorCallback: HTMLDivElement) => (this.setState({ editorCallback: editorCallback }));

  public loadImageFromBase64(base64String: string, editor: Editor) { // onReady is a function/callable
    const image = new Image();
    image.addEventListener("load", (e) => {
        editor.addContentSource(e.target as HTMLImageElement);
        editor.AS.setSelectionMode(2);
    });
    image.src = `data:image/jpg;base64,${base64String}`;
  }

  public drawBoundingBoxes(item: IVisionListItem): void {

    // Stops if the div container for the canvastools editor doesn't exist
    if (!this.state.editorCallback) {
      return;
    }
    // Removes any pre-existimg images due to previous render calls
    this.state.editorCallback.innerHTML = "";

    // Initializes CanvasTools-vott editor
    var editor = new CanvasTools.Editor(this.state.editorCallback);

    // Adds image to editor
    this.loadImageFromBase64(item.image, editor);

    // Initialize color constants
    const Color = CanvasTools.Core.Colors.Color;
    const theme = getTheme();

    // Ensuring object detection labels are populated
    if (!this.props.dataset.object_detection_predicted_y
        || !this.props.dataset.object_detection_true_y
        || !this.props.dataset.class_names) {
      return;
    }

    // Retrieving labels for the image in the Flyout
    const predictedY : number[][] = this.props.dataset.object_detection_predicted_y[item.index];
    const trueY : number[][]  = this.props.dataset.object_detection_true_y[item.index];

    // Draws bounding boxes for each predicted object
    for (let oidx = 0; oidx < predictedY.length; oidx++) {

      // Creating box region
      let predObject = predictedY[oidx]
      let predBox = RegionData.BuildRectRegionData(
        predObject[1],
        predObject[2],
        predObject[3]-predObject[1],
        predObject[4]-predObject[2]
      );

      // Retrieving label for annotation above the box
      let className = this.props.dataset.class_names[predObject[0]-1];
      let confidenceScore = (predObject[5] * 100).toFixed(2);

      // Initializing bounding box tag
      const predTag = new CanvasTools.Core.Tag(className + "(" + confidenceScore + "%)", // Object(95%)
                                               new Color(theme.palette.magenta));
      const predTagDesc = new CanvasTools.Core.TagsDescriptor([predTag]);

      // Drawing bounding box with vott
      editor.RM.addRegion(oidx.toString(), predBox, predTagDesc);
    }

    // Drawing bounding boxes for each ground truth object
    for (let oidx = 0; oidx < trueY.length; oidx++) {

      // Creating box region
      let gtObject = trueY[oidx] as number[]
      let gtBox = RegionData.BuildRectRegionData(
        gtObject[1],
        gtObject[2],
        gtObject[3]-gtObject[1],
        gtObject[4]-gtObject[2]
      );

      // Retrieving label for annotation above the box
      let className = this.props.dataset.class_names[gtObject[0]-1]

      // Initializing bounding box tag
      const gtTag = new CanvasTools.Core.Tag(className, new Color(theme.palette.magentaDark)) // Object(95%)
      const gtTagDesc = new CanvasTools.Core.TagsDescriptor([gtTag]);

      // Drawing bounding box with vott
      editor.RM.addRegion(oidx.toString(), gtBox, gtTagDesc);
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

    this.drawBoundingBoxes(item);

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
                    <Stack.Item id="canvasToolsDiv">
                      <Stack.Item id="selectionDiv">
                          <div ref={this.callbackRef} id="editorDiv"/>
                      </Stack.Item>
                    </Stack.Item>
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
                      <ImageTag
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
        // Remove "Object: " from labels. We only want index
        this.props.onChange(this.state.item, +item.key.slice(ExcessLabelLen));
      }
    }
  };
}
