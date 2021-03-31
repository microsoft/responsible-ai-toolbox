// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICompositeFilter,
  IFilter,
  FilterMethods,
  CohortSource,
  CohortStats,
  ErrorCohort
} from "@responsible-ai/core-ui";
import { max as d3max } from "d3-array";
import {
  stratify as d3stratify,
  tree as d3tree,
  HierarchyPointNode
} from "d3-hierarchy";
import { interpolateHcl as d3interpolateHcl } from "d3-interpolate";
import { scaleLinear as d3scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { linkHorizontal as d3linkHorizontal } from "d3-shape";
import { D3ZoomEvent, zoom as d3zoom } from "d3-zoom";
import { IProcessedStyleSet, ITheme } from "office-ui-fabric-react";
import React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { ColorPalette } from "../../ColorPalette";
import { FilterProps } from "../../FilterProps";
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

export interface ICollapsedTreeViewRendererProps {
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  selectedFeatures: string[];
  getTreeNodes?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  staticTreeNodes?: any;
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

// Represents the data retrieved from the backend
export interface IRequestNode {
  arg: number;
  condition: string;
  error: number;
  id: string;
  method: string;
  nodeIndex: number;
  nodeName: string;
  parentId: string;
  parentNodeName: string;
  pathFromRoot: string;
  size: number;
  sourceRowKeyHash: string;
  success: number;
}

export interface ISVGDatum {
  width: number;
  height: number;
  filterBrushEvent: boolean;
}

const svgOuterFrame: React.RefObject<SVGSVGElement> = React.createRef();
const treeZoomPane: React.RefObject<SVGSVGElement> = React.createRef();
const errorAvgColor = ColorPalette.ErrorAvgColor;
const errorRatioThreshold = 1;

export class CollapsedTreeViewRenderer extends React.PureComponent<
  ICollapsedTreeViewRendererProps,
  ITreeViewRendererState
> {
  public constructor(props: ICollapsedTreeViewRendererProps) {
    super(props);
    // Note: we take state from props in case
    this.state = this.props.state;
  }

  public componentDidUpdate(prevProps: ICollapsedTreeViewRendererProps): void {
    if (
      this.props.selectedFeatures !== prevProps.selectedFeatures ||
      this.props.baseCohort !== prevProps.baseCohort ||
      this.props.state !== prevProps.state
    ) {
      this.fetchTreeNodes();
    }
  }

  public render(): React.ReactNode {
    if (!this.state.root) {
      return <div></div>;
    }
    const classNames = treeViewRendererStyles();
    const labelPaddingX = 20;
    const labelPaddingY = 8;
    const labelYOffset = 3;

    const rootDescendents = this.state.root.descendants().filter((d) => {
      return d.data.nodeState.onSelectedPath;
    });
    const max: number = d3max(
      rootDescendents,
      (d) => d.data.error / d.data.size
    )!;

    const zoom = d3zoom<SVGSVGElement, ISVGDatum>()
      .scaleExtent([1 / 3, 4])
      .on("zoom", this.zoomed.bind(this));

    if (svgOuterFrame.current) {
      const svg = select<SVGSVGElement, undefined>(
        svgOuterFrame.current!
      ).datum<ISVGDatum>({
        filterBrushEvent: true,
        height: this.state.viewerHeight,
        width: this.state.viewerWidth
      });

      svg.style("pointer-events", "all").call(zoom as any);
    }

    const linkHorizontal = d3linkHorizontal<
      any,
      HierarchyPointNode<ITreeNode>
    >()
      .x((d: HierarchyPointNode<ITreeNode>) => d!.x!)
      .y((d: HierarchyPointNode<ITreeNode>) => d!.y!);
    // GENERATES LINK DATA BETWEEN NODES
    // -------------------------------------------------------------------
    // The links between the nodes in the tree view are generated below.
    // We go through each of the nodes other than the root and generate a link
    // to the parent.  Depending on whether the node is on the selected path
    // or not we highlight it.  We use the d3 linkHorizontal which is a curved
    // spline to draw the link.  The thickness of the links depends on the
    // ratio of data going through the path versus overall data in the tree.
    const links = rootDescendents
      .slice(1)
      .map((d: HierarchyPointNode<ITreeNode>) => {
        const thick = 1 + Math.floor(30 * (d.data.size / this.state.rootSize));
        const lineColor = d.data.nodeState.onSelectedPath
          ? ColorPalette.SelectedLineColor
          : ColorPalette.UnselectedLineColor;
        const id: string = d.id!;
        const linkHorizontalD = linkHorizontal({ source: d.parent, target: d });
        return {
          d: linkHorizontalD!,
          id: id + Math.random(),
          style: { fill: "white", stroke: lineColor, strokeWidth: thick }
        };
      });

    // GENERATES THE LINK LABEL DATA FOR THE SELECTED PATH
    // -------------------------------------------------------------------
    // Generates the labels on the links.  This initially writes the text,
    // calculates the bounding box using getTextBB, and then returns the
    // properties (x, y, height, width and the text) of the link label.
    const linkLabels = rootDescendents
      .slice(1)
      //.filter(
      //  (d: HierarchyPointNode<ITreeNode>) => d.data.nodeState.onSelectedPath
      //)
      .map((d: HierarchyPointNode<ITreeNode>) => {
        const labelX = d!.x! + (d!.parent!.x! - d!.x!) * 0.5;
        const labelY = 4 + d!.y! + (d!.parent!.y! - d!.y!) * 0.5;
        let bb: DOMRect;
        try {
          bb = this.getTextBB(d!.data!.condition!, classNames);
        } catch {
          bb = new DOMRect(1, 1, 1, 1);
        }
        return {
          bbHeight: bb.height + labelPaddingY,
          bbWidth: bb.width + labelPaddingX,
          bbX: 0.5 * (bb.width + labelPaddingX),
          bbY: 0.5 * (bb.height + labelPaddingY) + labelYOffset,
          id: `linkLabel${d!.id!}`,
          style: {
            transform: `translate(${labelX}px, ${labelY}px)`
          },
          text: `${d!.data!.condition!}`
        };
      });

    // GENERATES THE ACTUAL NODE COMPONENTS AND THEIR INTERACTIONS
    // -------------------------------------------------------------------
    // The code below generates the circular nodes in the tree view.
    const nodeData: Array<HierarchyPointNode<ITreeNode>> = rootDescendents.map(
      (d: HierarchyPointNode<ITreeNode>): HierarchyPointNode<ITreeNode> => {
        let selectedStyle: Record<string, number | string> = {
          fill: d.data.errorColor.fill
        };

        if (d.data.nodeState.onSelectedPath!) {
          selectedStyle = { fill: d.data.errorColor.fill, strokeWidth: 3 };
        }

        // Update node state based on new user actions
        d.data.nodeState = {
          errorStyle: selectedStyle,
          isSelectedLeaf: d.data.nodeState.isSelectedLeaf,
          onSelectedPath: d.data.nodeState.onSelectedPath,
          style: {
            transform: `translate(${d!.x!}px, ${d!.y!}px)`
          }
        };
        return d;
      }
    );
    const nodeDetail = this.state.nodeDetail;
    const minPct = this.state.rootLocalError * errorRatioThreshold * 100;

    return (
      <div className={classNames.mainFrame} id="mainFrame">
        <div className={classNames.innerFrame}>
          <div className={classNames.legend}>
            <TreeLegend
              selectedCohort={this.props.selectedCohort}
              baseCohort={this.props.baseCohort}
              nodeDetail={nodeDetail}
              minPct={minPct}
              max={max}
            />
          </div>
          <svg
            ref={svgOuterFrame}
            className={classNames.svgOuterFrame}
            id="svgOuterFrame"
            viewBox="0 0 952 1100"
          >
            <mask id="Mask">
              <rect
                className="nodeMask"
                x="-26"
                y="-26"
                width="52"
                height="52"
                fill="white"
              />
            </mask>

            <g ref={treeZoomPane} className="treeZoomPane">
              {/* Tree */}
              <TransitionGroup
                component="g"
                className={classNames.linksTransitionGroup}
              >
                {links.map((link) => (
                  <CSSTransition
                    key={link.id}
                    in={true}
                    timeout={200}
                    className="links"
                  >
                    <path
                      key={link.id}
                      id={link.id}
                      d={link.d}
                      style={link.style}
                    />
                  </CSSTransition>
                ))}
              </TransitionGroup>
              <TransitionGroup
                component="g"
                className={classNames.nodesTransitionGroup}
              >
                {nodeData.map((node, index) => {
                  return (
                    <TreeViewNode
                      key={index}
                      node={node}
                      onSelect={this.onSelectNode}
                    />
                  );
                })}
              </TransitionGroup>
              <TransitionGroup
                component="g"
                className={classNames.linkLabelsTransitionGroup}
              >
                {linkLabels.map((linkLabel) => (
                  <CSSTransition
                    key={linkLabel.id}
                    in={true}
                    timeout={200}
                    className="linkLabels"
                  >
                    <g
                      key={linkLabel.id}
                      style={linkLabel.style}
                      pointerEvents="none"
                    >
                      <rect
                        x={-linkLabel.bbX}
                        y={-linkLabel.bbY}
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
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </g>
          </svg>
        </div>
      </div>
    );
  }

  public componentDidMount(): void {
    window.addEventListener("resize", this.onResize.bind(this));
    if (
      !this.state.treeNodes ||
      this.state.treeNodes.length === 0 ||
      !this.state.treeNodes[0]
    ) {
      this.fetchTreeNodes();
    } else {
      this.onResize();
      this.forceUpdate();
    }
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this.onResize.bind(this));
    this.props.setTreeViewState(this.state);
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

  private resizeFunc = (
    state: Readonly<ITreeViewRendererState>
  ): ITreeViewRendererState => {
    const height = 300;
    const width = 800;
    //   if (document.querySelector("#mainFrame")) {
    //     height = document.querySelector("#mainFrame")!.clientHeight;
    //     width = document.querySelector("#mainFrame")!.clientWidth;
    //   }
    return {
      nodeDetail: state.nodeDetail,
      request: state.request,
      root: state.root,
      rootErrorSize: state.rootErrorSize,
      rootLocalError: state.rootLocalError,
      rootSize: state.rootSize,
      selectedNode: state.selectedNode,
      transform: state.transform,
      treeNodes: state.treeNodes,
      viewerHeight: height,
      viewerWidth: width
    };
  };

  private onResize(): void {
    this.setState(this.resizeFunc);
  }

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

      const colorgrad = d3scaleLinear<string>()
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

          let heatmapStyle: { fill: string } = { fill: errorAvgColor };

          if (node.error / node.size > rootLocalError * errorRatioThreshold) {
            heatmapStyle = { fill: colorgrad(localErrorPerc)! };
          }

          return {
            arg: node.arg,
            condition: node.condition,
            error: node.error,
            errorColor: heatmapStyle,
            fillstyleDown: {
              transform: `translate(0px, -${calcMaskShift}px)`
            },
            fillstyleUp: {
              fill: ColorPalette.FillStyle,
              transform: `translate(0px, ${calcMaskShift}px)`
            },
            filterProps,
            id: node.id,
            maskShift: calcMaskShift,
            method: node.method,
            nodeIndex: node.nodeIndex,
            nodeName: node.nodeName,
            nodeState: {
              errorStyle: undefined,
              isSelectedLeaf: false,
              onSelectedPath: false,
              style: undefined
            },
            parentId: node.parentId,
            parentNodeName: node.parentNodeName,
            pathFromRoot: node.pathFromRoot,
            r: 28,
            size: node.size,
            sourceRowKeyHash: node.sourceRowKeyHash,
            success: node.success
          };
        }
      );

      const tempRoot = d3stratify()(treeNodes);
      const treemap = d3tree().size([state.viewerWidth, state.viewerHeight]);
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
        treeNodes,
        viewerHeight: state.viewerHeight,
        viewerWidth: state.viewerWidth
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
  ): DOMRect {
    const temp = select(svgOuterFrame.current).append("g");
    temp.selectAll("*").remove();
    temp
      .append("text")
      .attr("className", classNames.linkLabel)
      .text(`${labelText}`);

    const bb = temp!.node()!.getBBox();
    temp.selectAll("*").remove();
    return bb;
  }

  private selectParentNodes(d: HierarchyPointNode<ITreeNode> | null): void {
    if (!d) {
      return;
    }
    d.data.nodeState!.onSelectedPath = true;
    this.selectParentNodes(d.parent);
  }

  private unselectParentNodes(d: HierarchyPointNode<ITreeNode> | null): void {
    if (!d) {
      return;
    }
    d.data.nodeState!.onSelectedPath = false;
    d.data.nodeState!.isSelectedLeaf = false;
    this.unselectParentNodes(d.parent!);
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
    return [filter, ...this.getFilters(d.parent!)];
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
        treeNodes: state.treeNodes,
        viewerHeight: state.viewerHeight,
        viewerWidth: state.viewerWidth
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
        this.reloadData(this.props.staticTreeNodes.data as IRequestNode[]);
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
          compositeFiltersRelabeled
        ],
        new AbortController().signal
      )
      .then((result) => {
        this.onResize();
        this.forceUpdate();
        this.reloadData(result as IRequestNode[]);
      });
  }

  private zoomed(zoomEvent: D3ZoomEvent<any, ISVGDatum>): void {
    const newTransform: any = zoomEvent.transform;
    select(treeZoomPane.current).attr("transform", newTransform);
    if (
      this.state.transform === undefined ||
      newTransform.x !== this.state.transform.x ||
      newTransform.y !== this.state.transform.y ||
      newTransform.r !== this.state.transform.r
    ) {
      this.setState({ transform: newTransform });
    }
  }
}
