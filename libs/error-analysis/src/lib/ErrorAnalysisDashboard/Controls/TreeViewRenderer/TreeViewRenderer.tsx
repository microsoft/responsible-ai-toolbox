// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  mergeStyles,
  MessageBar,
  MessageBarType,
  Stack,
  Text
} from "@fluentui/react";
import {
  IFilter,
  FilterMethods,
  CohortSource,
  Cohort,
  ErrorCohortStats,
  getRandomId,
  Metrics,
  MetricCohortStats,
  ModelAssessmentContext,
  defaultModelAssessmentContext,
  IErrorAnalysisTreeNode,
  IModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Property } from "csstype";
import { max as d3max } from "d3-array";
import { stratify as d3stratify, tree as d3tree } from "d3-hierarchy";
import { interpolateHcl as d3interpolateHcl } from "d3-interpolate";
import { scaleLinear as d3scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { linkVertical as d3linkVertical } from "d3-shape";
import _ from "lodash";
import React from "react";

import { ColorPalette } from "../../ColorPalette";
import { FilterProps } from "../../FilterProps";
import { IHierarchyPointNode as HierarchyPointNode } from "../../Interfaces/IHierarchyPointNode";
import { TreeLegend } from "../TreeLegend/TreeLegend";

import { TreeViewNode } from "./TreeViewNode";
import { ITreeViewLink, TreeViewPath } from "./TreeViewPath";
import { ITreeViewRendererProps } from "./TreeViewProps";
import {
  ITreeViewRendererStyles,
  treeViewRendererStyles
} from "./TreeViewRenderer.styles";
import {
  createInitialTreeViewState,
  INodeDetail,
  ITreeNode,
  ITreeViewRendererState
} from "./TreeViewState";

// Importing this solely to set the selectedPanelId. This component is NOT a statefulContainer
// import StatefulContainer from '../../ap/mixins/statefulContainer.js'

const viewerHeight = 300;
const viewerWidth = 800;

export interface ISVGDatum {
  width: number;
  height: number;
  filterBrushEvent: boolean;
}

const svgOuterFrame: React.RefObject<SVGSVGElement> = React.createRef();
const disabledColor = ColorPalette.DisabledColor;
const errorAvgColor = ColorPalette.ErrorAvgColor;
const errorRatioThreshold = 1;

export class TreeViewRenderer extends React.PureComponent<
  ITreeViewRendererProps,
  ITreeViewRendererState
> {
  public static contextType = ModelAssessmentContext;
  private static savedState: ITreeViewRendererState | undefined;
  private static saveStateOnUnmount = true;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public constructor(
    props: ITreeViewRendererProps,
    context: IModelAssessmentContext
  ) {
    super(props);
    if (
      this.props.selectedCohort !== this.props.baseCohort &&
      TreeViewRenderer.savedState
    ) {
      this.state = TreeViewRenderer.savedState;
    } else {
      this.state = createInitialTreeViewState(context.errorAnalysisData);
    }
    TreeViewRenderer.saveStateOnUnmount = true;
  }

  public static resetState(): void {
    TreeViewRenderer.saveStateOnUnmount = false;
  }

  public componentDidMount(): void {
    window.addEventListener("resize", this.onResize);
    if (!this.state.treeNodes?.[0]) {
      this.fetchTreeNodes();
    } else {
      this.onResize();
      this.forceUpdate();
    }
  }

  public componentDidUpdate(prevProps: ITreeViewRendererProps): void {
    if (
      this.props.selectedFeatures !== prevProps.selectedFeatures ||
      this.props.baseCohort !== prevProps.baseCohort ||
      (this.context.errorAnalysisData &&
        (this.context.errorAnalysisData.maxDepth !== this.state.maxDepth ||
          this.context.errorAnalysisData.numLeaves !== this.state.numLeaves ||
          this.context.errorAnalysisData.minChildSamples !==
            this.state.minChildSamples ||
          this.context.errorAnalysisData.metric !== this.state.metric))
    ) {
      this.fetchTreeNodes();
    } else if (
      this.props.selectedCohort.isTemporary === false &&
      prevProps.selectedCohort.isTemporary === true &&
      this.state.root !== undefined
    ) {
      // This is for the clear selection button
      // We don't necessarily want to re-fetch all tree nodes in this case
      this.selectNode(this.state.root, false);
    }
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this.onResize);
    if (TreeViewRenderer.saveStateOnUnmount) {
      TreeViewRenderer.savedState = this.state;
    } else {
      TreeViewRenderer.savedState = undefined;
    }
  }

  public render(): React.ReactNode {
    if (!this.state.root) {
      return React.Fragment;
    }
    const classNames = treeViewRendererStyles();
    const labelPaddingX = 20;
    const labelPaddingY = 8;
    const labelYOffset = 3;
    const theme = getTheme();

    const rootDescendants = this.state.root.descendants();
    let max = 0;
    if (rootDescendants[0].data.metricName !== Metrics.ErrorRate) {
      max = d3max(rootDescendants, (d) => d.data.metricValue) || 0;
    } else {
      max = d3max(rootDescendants, (d) => d.data.error / d.data.size) || 0;
    }

    if (svgOuterFrame.current) {
      const svg = select<SVGSVGElement, undefined>(
        svgOuterFrame.current
      ).datum<ISVGDatum>({
        filterBrushEvent: true,
        height: viewerHeight,
        width: viewerWidth
      });

      svg.style("pointer-events", "all");
    }
    let pathMin = viewerWidth;
    let pathMax = 0;

    const linkVertical = d3linkVertical<
      unknown,
      HierarchyPointNode<ITreeNode>
    >()
      .x((d: HierarchyPointNode<ITreeNode>) => d.x)
      .y((d: HierarchyPointNode<ITreeNode>) => d.y);
    // GENERATES LINK DATA BETWEEN NODES
    // -------------------------------------------------------------------
    // The links between the nodes in the tree view are generated below.
    // We go through each of the nodes other than the root and generate a link
    // to the parent.  Depending on whether the node is on the selected path
    // or not we highlight it.  We use the d3 linkVertical which is a curved
    // spline to draw the link.  The thickness of the links depends on the
    // ratio of data going through the path versus overall data in the tree.
    const links: ITreeViewLink[] = rootDescendants
      .slice(1)
      .map((d: HierarchyPointNode<ITreeNode>) => {
        const thick = 1 + Math.floor(30 * (d.data.size / this.state.rootSize));
        const lineColor = d.data.nodeState.onSelectedPath
          ? ColorPalette.SelectedLineColor
          : ColorPalette.UnselectedLineColor;
        const id = d.id || "";
        const linkVerticalD = linkVertical({ source: d.parent, target: d });
        return {
          d: linkVerticalD || "",
          id,
          key: id + getRandomId(),
          style: {
            cursor: "pointer",
            fill: theme.semanticColors.bodyBackground,
            stroke: lineColor,
            strokeWidth: thick
          }
        };
      });

    // GENERATES THE LINK LABEL DATA FOR THE SELECTED PATH
    // -------------------------------------------------------------------
    // Generates the labels on the links.  This initially writes the text,
    // calculates the bounding box using getTextBB, and then returns the
    // properties (x, y, height, width and the text) of the link label.
    const linkLabels = rootDescendants
      .slice(1)
      .map((d: HierarchyPointNode<ITreeNode>) => {
        const labelX = d.x + (d.parent?.x ? (d.parent.x - d.x) * 0.5 : 0);
        const labelY = 4 + d.y + (d.parent?.x ? (d.parent.y - d.y) * 0.5 : 0);
        const bb: DOMRect =
          this.getTextBB(d.data.condition, classNames) ||
          new DOMRect(1, 1, 1, 1);
        const element = {
          bbHeight: bb.height + labelPaddingY,
          bbWidth: bb.width + labelPaddingX,
          bbX: -0.5 * (bb.width + labelPaddingX),
          bbY: -0.5 * (bb.height + labelPaddingY) - labelYOffset,
          id: `linkLabel${d.id}`,
          style: {
            display:
              d.data.nodeState.onSelectedPath || this.state.hoverPathId === d.id
                ? undefined
                : "none",
            transform: `translate(${labelX}px, ${labelY}px)`
          },
          text: d.data.condition
        };
        if (labelX + element.bbX < pathMin) {
          pathMin = labelX + element.bbX;
        }
        if (labelX + element.bbX + element.bbWidth > pathMax) {
          pathMax = labelX + element.bbX + element.bbWidth;
        }
        return element;
      });

    // GENERATES THE ACTUAL NODE COMPONENTS AND THEIR INTERACTIONS
    // -------------------------------------------------------------------
    // The code below generates the circular nodes in the tree view.
    const nodeData: Array<HierarchyPointNode<ITreeNode>> = rootDescendants.map(
      (d: HierarchyPointNode<ITreeNode>): HierarchyPointNode<ITreeNode> => {
        // Update node state based on new user actions
        d.data.nodeState = {
          isSelectedLeaf: d.data.nodeState.isSelectedLeaf,
          onSelectedPath: d.data.nodeState.onSelectedPath,
          style: {
            transform: `translate(${d.x}px, ${d.y}px)`
          }
        };
        return d;
      }
    );
    const x = rootDescendants.map((d) => d.x);
    const y = rootDescendants.map((d) => d.y);
    const minX = Math.min((_.min(x) || 0) - 40, pathMin);
    //100:tooltip width
    const maxX = Math.max((_.max(x) || 0) + 40 + 100, pathMax);
    const minY = (_.min(y) || 0) - 40;
    //40:tooltip height
    const maxY = (_.max(y) || 0) + 40 + 40;
    const containerStyles = mergeStyles({
      transform: `translate(${-minX}px, ${-minY}px)`
    });
    const nodeDetail = this.state.nodeDetail;
    const minPct = this.state.rootLocalError * errorRatioThreshold;

    const svgWidth = maxX - minX;
    const svgHeight = maxY - minY;
    const chartAriaLabel = this.props.disabledView
      ? localization.ErrorAnalysis.TreeView.disabledArialLabel
      : localization.ErrorAnalysis.TreeView.ariaLabel;
    return (
      <Stack tokens={{ childrenGap: "l1", padding: "l1" }}>
        <Stack.Item className={classNames.infoWithText}>
          <Text variant="medium">
            {this.props.getTreeNodes
              ? localization.ErrorAnalysis.TreeView.treeDescription
              : localization.ErrorAnalysis.TreeView.treeStaticDescription}
          </Text>
        </Stack.Item>
        {this.props.disabledView && (
          <Stack.Item>
            <MessageBar messageBarType={MessageBarType.warning}>
              <Text>{localization.ErrorAnalysis.TreeView.disabledWarning}</Text>
            </MessageBar>
          </Stack.Item>
        )}
        <Stack.Item>
          <Stack horizontal className={classNames.svgContainer}>
            <TreeLegend
              selectedCohort={this.props.selectedCohort}
              baseCohort={this.props.baseCohort}
              nodeDetail={nodeDetail}
              minPct={minPct}
              max={max}
              showCohortName={this.props.showCohortName}
              isErrorMetric={this.state.isErrorMetric}
              isEnabled={this.props.getTreeNodes !== undefined}
              setMetric={this.setMetric}
              onClearCohortSelectionClick={
                this.props.onClearCohortSelectionClick
              }
              disabledView={this.props.disabledView}
              telemetryHook={this.props.telemetryHook}
            />
            <svg
              aria-label={chartAriaLabel}
              ref={svgOuterFrame}
              className={classNames.svgOuterFrame}
              id="svgOuterFrame"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{
                minWidth: svgWidth,
                width: svgWidth * 1.5
              }}
            >
              <g className={containerStyles} tabIndex={0}>
                <g>
                  {links.map((link) => (
                    <TreeViewPath
                      key={link.key}
                      link={link}
                      onMouseOver={this.onMouseOver}
                      onMouseOut={this.onMouseOut}
                    />
                  ))}
                </g>
                <g>
                  {nodeData.map((node, index) => {
                    return (
                      <TreeViewNode
                        key={index}
                        node={node}
                        onSelect={this.onSelectNode}
                        fillOffset={node.data.error / node.data.rootErrorSize}
                        disabledView={this.props.disabledView}
                      />
                    );
                  })}
                </g>
                <g>
                  {linkLabels.map((linkLabel) => (
                    <g
                      key={linkLabel.id}
                      style={linkLabel.style}
                      pointerEvents="all"
                    >
                      <rect
                        x={linkLabel.bbX}
                        y={linkLabel.bbY}
                        width={linkLabel.bbWidth}
                        height={linkLabel.bbHeight}
                        fill={theme.semanticColors.bodyBackground}
                        stroke={theme.semanticColors.link}
                        strokeWidth="3px"
                        rx="15"
                        ry="15"
                        pointerEvents="none"
                      />
                      <text
                        className={classNames.linkLabel}
                        pointerEvents="none"
                        fontFamily="Segoe UI Semibold"
                      >
                        {linkLabel.text}
                      </text>
                    </g>
                  ))}
                </g>
              </g>
            </svg>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }

  private onMouseOver = (linkId: string | undefined): void => {
    this.setState({ hoverPathId: linkId });
  };

  private onMouseOut = (): void => {
    this.setState({ hoverPathId: undefined });
  };

  private calculateFilterProps(
    node: IErrorAnalysisTreeNode,
    rootErrorSize: number
  ): FilterProps {
    let metricValue: number;
    if (node.metricName === Metrics.ErrorRate) {
      metricValue = (node.error / node.size) * 100;
    } else {
      metricValue = node.metricValue;
    }
    const filterProps = new FilterProps(
      node.error,
      node.size,
      rootErrorSize,
      node.metricName,
      metricValue
    );
    return filterProps;
  }

  private calculateCohortStats(node: ITreeNode): MetricCohortStats {
    let cohortStats: MetricCohortStats;
    if (node.metricName !== Metrics.ErrorRate) {
      cohortStats = new MetricCohortStats(
        node.size,
        this.state.rootSize,
        node.metricValue,
        node.metricName,
        (node.error / node.rootErrorSize) * 100
      );
    } else {
      const errorRate = (node.error / node.size) * 100;
      cohortStats = new ErrorCohortStats(
        node.error,
        node.size,
        this.state.rootErrorSize,
        this.state.rootSize,
        errorRate,
        Metrics.ErrorRate
      );
    }
    return cohortStats;
  }

  private onResize = (): void => {
    this.setState({});
  };

  private reloadData(requestTreeNodes: IErrorAnalysisTreeNode[]): void {
    const reloadDataFunc = (
      state: Readonly<ITreeViewRendererState>
    ): ITreeViewRendererState => {
      if (
        !requestTreeNodes ||
        requestTreeNodes.length === 0 ||
        !requestTreeNodes[0] ||
        !this.context.errorAnalysisData
      ) {
        return state;
      }

      const maxDepth = this.context.errorAnalysisData.maxDepth;
      const numLeaves = this.context.errorAnalysisData.numLeaves;
      const minChildSamples = this.context.errorAnalysisData.minChildSamples;
      const metric = this.context.errorAnalysisData.metric;

      const rootSize = requestTreeNodes[0].size;
      const rootErrorSize = requestTreeNodes[0].error;
      const isErrorRate = requestTreeNodes[0].metricName === Metrics.ErrorRate;
      const rootLocalMetric = isErrorRate
        ? rootErrorSize / rootSize
        : requestTreeNodes[0].metricValue;

      const isErrorMetric = requestTreeNodes[0].isErrorMetric;
      const min: number = rootLocalMetric;
      const max: number = Math.max(
        ...requestTreeNodes.map((node) => {
          if (node.size === 0) {
            return 0;
          }
          if (node.metricName !== Metrics.ErrorRate) {
            return node.metricValue;
          }
          return node.error / node.size;
        })
      );

      const minColor = ColorPalette.white;
      const maxColor = isErrorMetric
        ? ColorPalette.ErrorColor100
        : ColorPalette.MetricColor100;

      const colorgrad = d3scaleLinear<Property.Color>()
        .domain([min, max])
        .interpolate(d3interpolateHcl)
        .range([minColor, maxColor]);

      // From the retrieved request, calculate additional properties
      // that won't change during UI updates
      const treeNodes = requestTreeNodes.map((node): ITreeNode => {
        const globalErrorPerc = node.error / rootErrorSize;
        let errorPerc: number;
        if (node.metricName !== Metrics.ErrorRate) {
          errorPerc = node.metricValue;
        } else {
          errorPerc = node.error / node.size;
        }
        const calcMaskShift = globalErrorPerc * 52;
        const filterProps = this.calculateFilterProps(node, rootErrorSize);

        let heatmapStyle: Property.Color = errorAvgColor;

        if (errorPerc > rootLocalMetric * errorRatioThreshold) {
          heatmapStyle = colorgrad(errorPerc) || errorAvgColor;
        }

        if (this.props.disabledView) {
          heatmapStyle = disabledColor;
        }

        return {
          ...node,
          errorColor: heatmapStyle,
          filterProps,
          isErrorMetric,
          maskShift: calcMaskShift,
          nodeState: {
            isSelectedLeaf: false,
            onSelectedPath: false,
            style: undefined
          },
          r: 28,
          rootErrorSize
        };
      });

      const tempRoot = d3stratify()(treeNodes);
      const treemap = d3tree().size([viewerWidth, viewerHeight]);
      const root = treemap(tempRoot) as HierarchyPointNode<ITreeNode>;

      const selectedNode = state.selectedNode;
      if (selectedNode) {
        this.unselectParentNodes(selectedNode);
      }
      if (!this.props.disabledView) {
        this.selectParentNodes(root);
      }
      let nodeDetail: INodeDetail;
      if (root === undefined) {
        nodeDetail = this.state.nodeDetail;
      } else {
        (root as any).data.isSelectedLeaf = true;
        nodeDetail = this.getNodeDetail(root);
      }

      return {
        hoverPathId: undefined,
        isErrorMetric,
        maxDepth,
        metric,
        minChildSamples,
        nodeDetail,
        numLeaves,
        request: state.request,
        root,
        rootErrorSize,
        rootLocalError: rootLocalMetric,
        rootSize,
        selectedNode: root,
        transform: state.transform,
        treeNodes
      };
    };
    this.setState(reloadDataFunc, () => {
      // Clear filters
      const filters: IFilter[] = [];
      let cohortStats: MetricCohortStats | undefined = undefined;
      if (this.state.root) {
        cohortStats = this.calculateCohortStats(this.state.root.data);
      }
      this.props.updateSelectedCohort(
        filters,
        [],
        CohortSource.None,
        0,
        cohortStats
      );
    });
  }

  private getTextBB(
    labelText: string,
    classNames: IProcessedStyleSet<ITreeViewRendererStyles>
  ): DOMRect | undefined {
    const temp = select(svgOuterFrame.current).append("g");
    temp.selectAll("*").remove();
    temp
      .append("text")
      .attr("className", classNames.linkLabel)
      .text(`${labelText}`);

    const bb = temp.node()?.getBBox();
    temp.selectAll("*").remove();
    return bb;
  }

  private selectParentNodes(d: HierarchyPointNode<ITreeNode> | null): void {
    if (!d) {
      return;
    }
    d.data.nodeState.onSelectedPath = true;
    this.selectParentNodes(d.parent);
  }

  private unselectParentNodes(d: HierarchyPointNode<ITreeNode> | null): void {
    if (!d) {
      return;
    }
    d.data.nodeState.onSelectedPath = false;
    d.data.nodeState.isSelectedLeaf = false;
    this.unselectParentNodes(d.parent);
  }

  private getFilters(d: HierarchyPointNode<ITreeNode>): IFilter[] {
    if (!d || !d.parent) {
      return [];
    }
    let filterArg: number[];
    if (Array.isArray(d.data.arg)) {
      filterArg = d.data.arg;
    } else if (d.data.arg === undefined) {
      filterArg = [];
    } else {
      filterArg = [d.data.arg];
    }
    const filter = {
      arg: filterArg,
      column: d.parent.data.nodeName,
      method: d.data.method as FilterMethods
    };
    return [filter, ...this.getFilters(d.parent)];
  }

  private onSelectNode = (node: HierarchyPointNode<ITreeNode>): void => {
    if (this.props.disabledView) {
      return;
    }
    this.selectNode(node, true);
  };

  private selectNode(
    node: HierarchyPointNode<ITreeNode>,
    createTemporaryCohort: boolean
  ): void {
    const updateSelectedFunc = (
      state: Readonly<ITreeViewRendererState>
    ): ITreeViewRendererState => {
      if (state.selectedNode) {
        this.unselectParentNodes(state.selectedNode);
      }
      this.selectParentNodes(node);
      node.data.nodeState.isSelectedLeaf = true;

      // Get filters and update
      const filters = this.getFilters(node);
      const cohortStats = this.calculateCohortStats(node.data);

      const source = createTemporaryCohort
        ? CohortSource.TreeMap
        : CohortSource.None;
      this.props.updateSelectedCohort(filters, [], source, 0, cohortStats);

      // APPLY TO NODEDETAIL OBJECT TO UPDATE DISPLAY PANEL
      const nodeDetail = this.getNodeDetail(node);
      return {
        hoverPathId: undefined,
        isErrorMetric: state.isErrorMetric,
        maxDepth: state.maxDepth,
        metric: state.metric,
        minChildSamples: state.minChildSamples,
        nodeDetail,
        numLeaves: state.numLeaves,
        request: state.request,
        root: state.root,
        rootErrorSize: state.rootErrorSize,
        rootLocalError: state.rootLocalError,
        rootSize: state.rootSize,
        selectedNode: node,
        transform: state.transform,
        treeNodes: state.treeNodes
      };
    };

    this.setState(updateSelectedFunc);
  }

  private getNodeDetail(node: HierarchyPointNode<ITreeNode>): INodeDetail {
    const nodeDetail = {
      errorColor: node.data.errorColor,
      maskDown: { transform: `translate(0px, -${node.data.maskShift}px)` },
      maskUp: { transform: `translate(0px, ${node.data.maskShift}px)` }
    };
    return nodeDetail;
  }

  private setMetric = (metric: string): void => {
    if (this.context.errorAnalysisData) {
      this.context.errorAnalysisData.metric = metric;
    }
    this.fetchTreeNodes();
  };

  private fetchTreeNodes(): void {
    if (this.state.request) {
      this.state.request.abort();
    }
    if (!this.props.getTreeNodes) {
      if (this.props.tree) {
        this.reloadData(this.props.tree);
        // Use set timeout as reloadData state update needs to be done outside constructor similar to fetch call
        this.onResize();
        this.forceUpdate();
      }
      return;
    }
    const filtersRelabeled = Cohort.getLabeledFilters(
      this.props.baseCohort.cohort.filters,
      this.props.baseCohort.jointDataset
    );
    const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
      this.props.baseCohort.cohort.compositeFilters,
      this.props.baseCohort.jointDataset
    );
    const errorAnalysisData = this.context.errorAnalysisData;
    if (!errorAnalysisData) {
      return;
    }
    this.props
      .getTreeNodes(
        [
          this.props.selectedFeatures,
          filtersRelabeled,
          compositeFiltersRelabeled,
          errorAnalysisData.maxDepth,
          errorAnalysisData.numLeaves,
          errorAnalysisData.minChildSamples,
          errorAnalysisData.metric
        ],
        new AbortController().signal
      )
      .then((result) => {
        this.reloadData(result);
        this.onResize();
        this.forceUpdate();
      });
  }
}
