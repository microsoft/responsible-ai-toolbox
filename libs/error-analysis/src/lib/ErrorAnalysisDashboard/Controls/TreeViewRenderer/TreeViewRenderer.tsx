// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICompositeFilter,
  IFilter,
  FilterMethods,
  CohortSource,
  CohortStats,
  ErrorCohort,
  ExpandableText,
  getRandomId,
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Property } from "csstype";
import { max as d3max } from "d3-array";
import {
  stratify as d3stratify,
  tree as d3tree,
  HierarchyPointNode
} from "d3-hierarchy";
import { interpolateHcl as d3interpolateHcl } from "d3-interpolate";
import { scaleLinear as d3scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { linkVertical as d3linkVertical } from "d3-shape";
import {
  IProcessedStyleSet,
  ITheme,
  mergeStyles,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { ColorPalette } from "../../ColorPalette";
import { FilterProps } from "../../FilterProps";
import { IRequestNode } from "../../Interfaces/IErrorAnalysisDashboardProps";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import {
  INodeDetail,
  ITreeNode,
  ITreeViewRendererState
} from "../../TreeViewState";
import { TreeLegend } from "../TreeLegend/TreeLegend";

import { TreeViewNode } from "./TreeViewNode";
import {
  ITreeViewRendererStyles,
  treeViewRendererStyles
} from "./TreeViewRenderer.styles";

// Importing this solely to set the selectedPanelId. This component is NOT a statefulContainer
// import StatefulContainer from '../../ap/mixins/statefulContainer.js'

const viewerHeight = 300;
const viewerWidth = 800;

export interface ITreeViewRendererProps {
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  selectedFeatures: string[];
  getTreeNodes?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<IRequestNode[]>;
  staticTreeNodes?: { data: IRequestNode[] };
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: CohortSource,
    cells: number,
    cohortStats: CohortStats | undefined
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
  state: ITreeViewRendererState;
  setTreeViewState: (treeViewState: ITreeViewRendererState) => void;
}

export interface ISVGDatum {
  width: number;
  height: number;
  filterBrushEvent: boolean;
}

const svgOuterFrame: React.RefObject<SVGSVGElement> = React.createRef();
const errorAvgColor = ColorPalette.ErrorAvgColor;
const errorRatioThreshold = 1;

export class TreeViewRenderer extends React.PureComponent<
  ITreeViewRendererProps,
  ITreeViewRendererState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  public constructor(props: ITreeViewRendererProps) {
    super(props);
    // Note: we take state from props in case
    this.state = this.props.state;
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
      this.props.state !== prevProps.state
    ) {
      this.fetchTreeNodes();
    }
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this.onResize);
    this.props.setTreeViewState(this.state);
  }

  public render(): React.ReactNode {
    if (!this.state.root) {
      return React.Fragment;
    }
    const classNames = treeViewRendererStyles();
    const labelPaddingX = 20;
    const labelPaddingY = 8;
    const labelYOffset = 3;

    const rootDescendants = this.state.root.descendants();
    const max = d3max(rootDescendants, (d) => d.data.error / d.data.size) || 0;

    if (svgOuterFrame.current) {
      const svg = select<SVGSVGElement, undefined>(svgOuterFrame.current).datum<
        ISVGDatum
      >({
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
    const links = rootDescendants
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
          id: id + getRandomId(),
          style: { fill: "white", stroke: lineColor, strokeWidth: thick }
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
            display: d.data.nodeState.onSelectedPath ? undefined : "none",
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
    const minX = Math.min(Math.min(...x) - 40, pathMin);
    //100:tooltip width
    const maxX = Math.max(Math.max(...x) + 40 + 100, pathMax);
    const minY = Math.min(...y) - 40;
    //40:tooltip height
    const maxY = Math.max(...y) + 40 + 40;
    console.log(minY, maxY);
    const containerStyles = mergeStyles({
      transform: `translate(${-minX}px, ${-minY}px)`
    });
    const nodeDetail = this.state.nodeDetail;
    const minPct = this.state.rootLocalError * errorRatioThreshold * 100;

    const svgWidth = maxX - minX;
    const svgHeight = maxY - minY;
    return (
      <Stack tokens={{ childrenGap: "l1", padding: "l1" }}>
        <Stack.Item>
          <ExpandableText
            expandedText={
              localization.ErrorAnalysis.TreeView.treeDescriptionExpanded
            }
            iconName="Info"
            variant={"smallPlus"}
          >
            {localization.ErrorAnalysis.TreeView.treeDescription}
          </ExpandableText>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal className={classNames.svgContainer}>
            <TreeLegend
              selectedCohort={this.props.selectedCohort}
              baseCohort={this.props.baseCohort}
              nodeDetail={nodeDetail}
              minPct={minPct}
              max={max}
            />
            <svg
              ref={svgOuterFrame}
              className={classNames.svgOuterFrame}
              id="svgOuterFrame"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{
                minWidth: svgWidth,
                width: svgWidth * 1.5
              }}
            >
              <g className={containerStyles}>
                <g>
                  {links.map((link) => (
                    <path
                      key={link.id}
                      id={link.id}
                      d={link.d}
                      style={link.style}
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
                      />
                    );
                  })}
                </g>
                <g>
                  {linkLabels.map((linkLabel) => (
                    <g
                      key={linkLabel.id}
                      style={linkLabel.style}
                      pointerEvents="none"
                    >
                      <rect
                        x={linkLabel.bbX}
                        y={linkLabel.bbY}
                        width={linkLabel.bbWidth}
                        height={linkLabel.bbHeight}
                        fill="white"
                        stroke={ColorPalette.LinkLabelOutline}
                        strokeWidth="1px"
                        rx="10"
                        ry="10"
                        pointerEvents="none"
                      />
                      <text
                        className={classNames.linkLabel}
                        pointerEvents="none"
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

  private calculateFilterProps(
    node: IRequestNode,
    rootErrorSize: number
  ): FilterProps {
    const errorRate = (node.error / node.size) * 100;
    const filterProps = new FilterProps(
      node.error,
      node.size,
      rootErrorSize,
      errorRate
    );
    return filterProps;
  }

  private calculateCohortStats(node: ITreeNode): CohortStats {
    const errorRate = (node.error / node.size) * 100;
    const cohortStats = new CohortStats(
      node.error,
      node.size,
      this.state.rootErrorSize,
      this.state.rootSize,
      errorRate
    );
    return cohortStats;
  }

  private onResize = (): void => {
    this.setState({});
  };

  private reloadData(requestTreeNodes: IRequestNode[]): void {
    const reloadDataFunc = (
      state: Readonly<ITreeViewRendererState>
    ): ITreeViewRendererState => {
      if (
        !requestTreeNodes ||
        requestTreeNodes.length === 0 ||
        !requestTreeNodes[0]
      ) {
        return state;
      }

      const rootSize = requestTreeNodes[0].size;
      const rootErrorSize = requestTreeNodes[0].error;
      const rootLocalError = rootErrorSize / rootSize;

      const min: number = rootErrorSize / rootSize;
      const max: number = Math.max(
        ...requestTreeNodes.map((node) => {
          if (node.size === 0) {
            return 0;
          }
          return node.error / node.size;
        })
      );

      const minColor = ColorPalette.MinColor;
      const maxColor = ColorPalette.MaxColor;

      const colorgrad = d3scaleLinear<Property.Color>()
        .domain([min, max])
        .interpolate(d3interpolateHcl)
        .range([minColor, maxColor]);

      // From the retrieved request, calculate additional properties
      // that won't change during UI updates
      const treeNodes = requestTreeNodes.map(
        (node): ITreeNode => {
          const globalErrorPerc = node.error / rootErrorSize;
          const localErrorPerc = node.error / node.size;
          const calcMaskShift = globalErrorPerc * 52;
          const filterProps = this.calculateFilterProps(node, rootErrorSize);

          let heatmapStyle: Property.Color = errorAvgColor;

          if (node.error / node.size > rootLocalError * errorRatioThreshold) {
            heatmapStyle = colorgrad(localErrorPerc) || errorAvgColor;
          }

          return {
            arg: node.arg,
            condition: node.condition,
            error: node.error,
            errorColor: heatmapStyle,
            filterProps,
            id: node.id,
            maskShift: calcMaskShift,
            method: node.method,
            nodeIndex: node.nodeIndex,
            nodeName: node.nodeName,
            nodeState: {
              isSelectedLeaf: false,
              onSelectedPath: false,
              style: undefined
            },
            parentId: node.parentId,
            parentNodeName: node.parentNodeName,
            pathFromRoot: node.pathFromRoot,
            r: 28,
            rootErrorSize,
            size: node.size,
            sourceRowKeyHash: node.sourceRowKeyHash,
            success: node.success
          };
        }
      );

      const tempRoot = d3stratify()(treeNodes);
      const treemap = d3tree().size([viewerWidth, viewerHeight]);
      const root = treemap(tempRoot) as HierarchyPointNode<ITreeNode>;

      const selectedNode = state.selectedNode;
      if (selectedNode) {
        this.unselectParentNodes(selectedNode);
      }
      this.selectParentNodes(root);
      let nodeDetail: INodeDetail;
      if (root === undefined) {
        nodeDetail = this.state.nodeDetail;
      } else {
        (root as any).data.isSelectedLeaf = true;
        nodeDetail = this.getNodeDetail(root, state);
      }

      return {
        nodeDetail,
        request: state.request,
        root,
        rootErrorSize,
        rootLocalError,
        rootSize,
        selectedNode: root,
        transform: state.transform,
        treeNodes
      };
    };
    this.setState(reloadDataFunc);
    // Clear filters
    const filters: IFilter[] = [];
    let cohortStats: CohortStats | undefined = undefined;
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
      this.props.updateSelectedCohort(
        filters,
        [],
        CohortSource.TreeMap,
        0,
        cohortStats
      );

      // APPLY TO NODEDETAIL OBJECT TO UPDATE DISPLAY PANEL
      const nodeDetail = this.getNodeDetail(node, state);
      return {
        nodeDetail,
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
  };

  private getNodeDetail(
    node: HierarchyPointNode<ITreeNode>,
    state: ITreeViewRendererState
  ): INodeDetail {
    const nodeDetail = {
      errorColor: node.data.errorColor,
      errorInfo: `${node.data.error} Error`,
      globalError: ((node.data.error / state.rootErrorSize) * 100).toFixed(2),
      instanceInfo: `${node.data.size} Instances`,
      localError: ((node.data.error / node.data.size) * 100).toFixed(2),
      maskDown: { transform: `translate(0px, -${node.data.maskShift}px)` },
      maskUp: { transform: `translate(0px, ${node.data.maskShift}px)` },
      showSelected: { opacity: 1 },
      successInfo: `${node.data.success} Success`
    };
    return nodeDetail;
  }

  private fetchTreeNodes(): void {
    if (this.state.request) {
      this.state.request.abort();
    }
    if (!this.props.getTreeNodes) {
      if (this.props.staticTreeNodes) {
        // Use set timeout as reloadData state update needs to be done outside constructor similar to fetch call
        this.onResize();
        this.forceUpdate();
        this.reloadData(this.props.staticTreeNodes.data);
      }
      return;
    }
    const filtersRelabeled = ErrorCohort.getLabeledFilters(
      this.props.baseCohort.cohort.filters,
      this.props.baseCohort.jointDataset
    );
    const compositeFiltersRelabeled = ErrorCohort.getLabeledCompositeFilters(
      this.props.baseCohort.cohort.compositeFilters,
      this.props.baseCohort.jointDataset
    );
    this.props
      .getTreeNodes(
        [
          this.props.selectedFeatures,
          filtersRelabeled,
          compositeFiltersRelabeled,
          this.context.errorAnalysisConfig?.maxDepth,
          this.context.errorAnalysisConfig?.numLeaves
        ],
        new AbortController().signal
      )
      .then((result) => {
        this.onResize();
        this.forceUpdate();
        this.reloadData(result);
      });
  }
}
