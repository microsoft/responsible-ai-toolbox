// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICompositeFilter, IFilter } from "@responsible-ai/interpret";
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
import { D3ZoomEvent, zoom as d3zoom } from "d3-zoom";
import { IProcessedStyleSet, ITheme } from "office-ui-fabric-react";
import React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { ErrorCohort, ErrorDetectorCohortSource } from "../../ErrorCohort";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import { TreeLegend } from "../TreeLegend/TreeLegend";

import {
  ITreeViewRendererStyles,
  treeViewRendererStyles
} from "./TreeViewRenderer.styles";

// Importing this solely to set the selectedPanelId. This component is NOT a statefulContainer
// import StatefulContainer from '../../ap/mixins/statefulContainer.js'

export interface ITreeViewRendererProps {
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  selectedFeatures: string[];
  getTreeNodes?: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
  updateSelectedCohort: (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    source: ErrorDetectorCohortSource,
    cells: number
  ) => void;
  selectedCohort: ErrorCohort;
  baseCohort: ErrorCohort;
}

export interface ITreeViewRendererState {
  request?: AbortController;
  nodeDetail: NodeDetail;
  viewerWidth: number;
  viewerHeight: number;
  selectedNode: any;
  transform: any;
  treeNodes: any[];
  root?: HierarchyPointNode<any>;
  rootSize: any;
  rootErrorSize: any;
  rootLocalError: any;
}

export interface ErrorColorStyle {
  fill: string;
}

export interface Transform {
  transform: string;
}

export interface FillStyleUp {
  transform: string;
  fill: string;
}

export interface ShowSelectedStyle {
  opacity: number;
}

export interface NodeDetail {
  showSelected: ShowSelectedStyle;
  globalError: string;
  localError: string;
  instanceInfo: string;
  errorInfo: string;
  successInfo: string;
  errorColor: ErrorColorStyle;
  maskDown: Transform;
  maskUp: Transform;
}

export interface TreeNode {
  data: TreeNodeData;
  error: number;
  errorColor: ErrorColorStyle;
  errorStyle: Record<string, number | string>;
  fillstyleUp: FillStyleUp;
  fillstyleDown: Transform;
  highlight: boolean;
  hoverText: string;
  id: string;
  maskShift: number;
  parent: HierarchyPointNode<any>;
  r: number;
  style: Transform;
}

export interface TreeNodeData {
  error: number;
  isSelected: boolean;
  nodeName: string;
  pathFromRoot: string;
  size: number;
  success: number;
}

export interface SVGDatum {
  width: number;
  height: number;
  filterBrushEvent: boolean;
}

const svgOuterFrame: React.RefObject<SVGSVGElement> = React.createRef();
const treeZoomPane: React.RefObject<SVGSVGElement> = React.createRef();
const errorAvgColor = "#b2b7bd";
const errorRatioThreshold = 1;

export class TreeViewRenderer extends React.PureComponent<
  ITreeViewRendererProps,
  ITreeViewRendererState
> {
  public constructor(props: ITreeViewRendererProps) {
    super(props);
    this.state = {
      nodeDetail: {
        errorColor: {
          fill: "#eaeaea"
        },
        errorInfo: "0 Errors",
        globalError: "0",
        instanceInfo: "0 Instances",
        localError: "0",
        maskDown: {
          transform: "translate(0px, -13px)"
        },
        maskUp: {
          transform: "translate(0px, 13px)"
        },
        showSelected: { opacity: 0 },
        successInfo: "0 Success"
      },
      request: undefined,
      root: undefined,
      rootErrorSize: 0,
      rootLocalError: 0,
      rootSize: 0,
      selectedNode: undefined,
      transform: undefined,
      treeNodes: [],
      viewerHeight: 0,
      viewerWidth: 0
    };
    this.fetchTreeNodes();
  }

  public componentDidUpdate(prevProps: ITreeViewRendererProps): void {
    if (
      this.props.selectedFeatures !== prevProps.selectedFeatures ||
      this.props.baseCohort !== prevProps.baseCohort
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

    const min: number = this.state.rootErrorSize / this.state.rootSize;
    const rootDescendents = this.state.root.descendants();
    const max: number = d3max(
      rootDescendents,
      (d) => d.data.error / d.data.size
    )!;

    const zoom = d3zoom<SVGSVGElement, SVGDatum>()
      .scaleExtent([1 / 3, 4])
      .on("zoom", this.zoomed.bind(this));

    if (svgOuterFrame.current) {
      const svg = select<SVGSVGElement, undefined>(
        svgOuterFrame.current!
      ).datum<SVGDatum>({
        filterBrushEvent: true,
        height: this.state.viewerHeight,
        width: this.state.viewerWidth
      });

      svg.style("pointer-events", "all").call(zoom as any);

      //   if (this.state.transform) {
      //     var x = this.state.transform.x;
      //     var y = this.state.transform.y;
      //     var k = this.state.transform.k;
      //     select(svgOuterFrame.current).call(
      //       zoom.transform as any,
      //       d3zoomIdentity.translate(x, y).scale(k)
      //     );
      //   }
    }

    const colorgrad = d3scaleLinear<string>()
      .domain([min, max])
      .interpolate(d3interpolateHcl)
      .range(["#F4D1D2", "#8d2323"]);

    const linkVertical = d3linkVertical<any, HierarchyPointNode<any>>()
      .x((d: any) => d!.x!)
      .y((d: any) => d!.y!);
    // GENERATES LINK DATA BETWEEN NODES
    // -------------------------------------------------------------------
    const links = rootDescendents.slice(1).map((d) => {
      const thick = 1 + Math.floor(30 * (d.data.size / this.state.rootSize));
      const lineColor = d.data.isSelected ? "#089acc" : "#e8eaed";
      const id: string = d.id!;
      const linkVerticalD = linkVertical({ source: d.parent, target: d });
      return {
        d: linkVerticalD!,
        id: id + Math.random(),
        style: { fill: "white", stroke: lineColor, strokeWidth: thick }
      };
    });

    // GENERATES THE LINK LABEL DATA FOR THE SELECTED PATH
    // -------------------------------------------------------------------
    const linkLabels = rootDescendents
      .slice(1)
      .filter((d) => d.data.isSelected)
      .map((d) => {
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

    // GENERTES THE ACTUAL NODE COMPONENTS AND THEIR INTERACTIONS
    // -------------------------------------------------------------------
    const nodeData: TreeNode[] = rootDescendents.map(
      (d): TreeNode => {
        const globalErrorPerc = d!.data!.error! / this.state.rootErrorSize;
        const localErrorPerc = d!.data!.error! / d!.data!.size!;
        const calcMaskShift = globalErrorPerc * 52;
        const calcHoverText = `Error Rate: ${(
          (d!.data!.error! / d!.data!.size!) *
          100
        ).toFixed(2)}%\r\nError Coverage: ${(
          (d.data.error / this.state.rootErrorSize) *
          100
        ).toFixed(2)}%\r\nInstances: ${d!.data!.size!}\r\n${d!.data!
          .pathFromRoot!}${this.skippedInstances(d!)}`;

        let heatmapStyle: { fill: string } = { fill: errorAvgColor };

        if (
          d!.data!.error! / d!.data!.size! >
          this.state.rootLocalError * errorRatioThreshold
        ) {
          heatmapStyle = { fill: colorgrad(localErrorPerc)! };
        }

        let selectedStyle: Record<string, number | string> = heatmapStyle;

        if (d!.data!.isSelected!) {
          selectedStyle = { fill: heatmapStyle.fill, strokeWidth: 3 };
        }

        return {
          data: d!.data!,
          error: 10,
          errorColor: heatmapStyle,
          errorStyle: selectedStyle,
          fillstyleDown: {
            transform: `translate(0px, -${calcMaskShift}px)`
          },
          fillstyleUp: {
            fill: "#d2d2d2",
            transform: `translate(0px, ${calcMaskShift}px)`
          },
          // size: d.size,
          highlight: d!.data!.isSelected,
          hoverText: calcHoverText,
          id: d!.id! + Math.random(),
          maskShift: calcMaskShift,
          parent: d!.parent!,
          r: 28,
          // parentId: d.parentId,
          style: {
            transform: `translate(${d!.x!}px, ${d!.y!}px)`
          }
        };
      }
    );
    const nodeDetail = this.state.nodeDetail;

    return (
      <div className={classNames.mainFrame} id="mainFrame">
        <div className={classNames.innerFrame}>
          <svg
            ref={svgOuterFrame}
            className={classNames.svgOuterFrame}
            id="svgOuterFrame"
            viewBox="0 0 952 820"
            onClick={this.bkgClick.bind(this)}
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

            {/* Legend */}
            <g
              className={classNames.details}
              onClick={(e): void => e.stopPropagation()}
            >
              <mask id="detailMask">
                <rect x="-26" y="-26" width="52" height="52" fill="white" />
              </mask>

              <g className="opacityToggle" style={nodeDetail.showSelected}>
                <g className={classNames.innerOpacityToggle}>
                  <rect
                    className={classNames.opacityToggleRect}
                    width="280"
                    height="140"
                    fill="transparent"
                  />
                  <TreeLegend selectedCohort={this.props.selectedCohort} />
                  <g className={classNames.opacityToggleCircle}>
                    <circle
                      r="26"
                      className={classNames.node}
                      style={nodeDetail.errorColor}
                    />
                    <g
                      style={nodeDetail.maskDown}
                      mask="url(#detailMask)"
                      className={classNames.nopointer}
                    >
                      <circle
                        r="26"
                        className={classNames.node}
                        fill="#d2d2d2"
                        style={nodeDetail.maskUp}
                      />
                    </g>
                  </g>
                  <g className={classNames.nonOpacityToggleCircle}>
                    <circle
                      r="26"
                      className={classNames.node}
                      style={nodeDetail.errorColor}
                    />
                    <circle r="21" className={classNames.node} fill="#d2d2d2" />
                  </g>
                </g>
              </g>
            </g>

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
                {nodeData.map((node, index) => (
                  <CSSTransition
                    key={node.id}
                    in={true}
                    timeout={200}
                    className="nodes"
                  >
                    <g
                      key={node.id}
                      style={node.style}
                      onClick={(
                        e: React.MouseEvent<SVGElement, MouseEvent>
                      ): void => this.select(index, node, e)}
                    >
                      <circle
                        r={node.r}
                        className={classNames.node}
                        style={node.errorStyle}
                      />
                      {node.highlight && (
                        <circle
                          r={node.r * 1.4}
                          className={classNames.clickedNodeDashed}
                        />
                      )}

                      <g
                        style={node.fillstyleDown}
                        mask="url(#Mask)"
                        className={classNames.nopointer}
                      >
                        <circle r="26" style={node.fillstyleUp} />
                      </g>
                      {/*TODO: not sure why text-anchor is not liked by browser*/}
                      <text textAnchor="middle" className={classNames.nodeText}>
                        {node.data.error} / {node.data.size}
                      </text>
                      <title>{node.hoverText}</title>
                    </g>
                  </CSSTransition>
                ))}
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
                    <g key={linkLabel.id} style={linkLabel.style}>
                      <rect
                        x={-linkLabel.bbX}
                        y={-linkLabel.bbY}
                        width={linkLabel.bbWidth}
                        height={linkLabel.bbHeight}
                        fill="white"
                        stroke="#089acc"
                        strokeWidth="1px"
                        rx="10"
                        ry="10"
                      />
                      <text className={classNames.linkLabel}>
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
  }

  public componentWillUnmount(): void {
    window.removeEventListener("resize", this.onResize.bind(this));
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

  private reloadData(treeNodes: any[]): void {
    const reloadDataFunc = (
      state: Readonly<ITreeViewRendererState>
    ): ITreeViewRendererState => {
      if (!treeNodes || treeNodes.length === 0 || !treeNodes[0]) {
        return state;
      }
      const rootSize = treeNodes[0].size;
      const rootErrorSize = treeNodes[0].error;
      const rootLocalError = rootErrorSize / rootSize;

      const tempRoot = d3stratify()(treeNodes);
      const treemap = d3tree().size([state.viewerWidth, state.viewerHeight]);
      const root = treemap(tempRoot);
      return {
        nodeDetail: state.nodeDetail,
        request: state.request,
        root,
        rootErrorSize,
        rootLocalError,
        rootSize,
        selectedNode: state.selectedNode,
        transform: state.transform,
        treeNodes,
        viewerHeight: state.viewerHeight,
        viewerWidth: state.viewerWidth
      };
    };
    this.setState(reloadDataFunc);
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

  private skippedInstances(node: HierarchyPointNode<any>): string {
    return node.data.badFeaturesRowCount !== 0
      ? `Skipped Instances: ${node.data.badFeaturesRowCount}`
      : "";
  }

  private clearSelection(): void {
    const clearSelectionFunc = (
      state: Readonly<ITreeViewRendererState>
    ): ITreeViewRendererState => {
      const selectedNode = state.selectedNode;
      const nodeDetail = state.nodeDetail;
      nodeDetail.showSelected = { opacity: 0 };
      if (selectedNode) {
        this.unselectParentNodes(selectedNode);
      }
      return {
        nodeDetail,
        request: state.request,
        root: state.root,
        rootErrorSize: state.rootErrorSize,
        rootLocalError: state.rootLocalError,
        rootSize: state.rootSize,
        selectedNode: undefined,
        transform: state.transform,
        treeNodes: state.treeNodes,
        viewerHeight: state.viewerHeight,
        viewerWidth: state.viewerWidth
      };
    };
    this.setState(clearSelectionFunc);
    // Clear filters
    const filters: IFilter[] = [];
    this.props.updateSelectedCohort(
      filters,
      [],
      ErrorDetectorCohortSource.None,
      0
    );
  }

  private bkgClick(): void {
    this.clearSelection();
    this.forceUpdate();
  }

  private selectParentNodes(d: HierarchyPointNode<any> | TreeNode): void {
    if (!d) {
      return;
    }
    d.data!.isSelected = true;
    this.selectParentNodes(d.parent!);
  }

  private unselectParentNodes(d: HierarchyPointNode<any> | TreeNode): void {
    if (!d) {
      return;
    }
    d.data!.isSelected = false;
    this.unselectParentNodes(d.parent!);
  }

  private getFilters(d: HierarchyPointNode<any> | TreeNode): IFilter[] {
    if (!d || !d.parent) {
      return [];
    }
    let filterArg: number[];
    if (Array.isArray(d.data!.arg)) {
      filterArg = d.data!.arg;
    } else {
      filterArg = [d.data!.arg];
    }
    const filter = {
      arg: filterArg,
      column: d.parent!.data!.nodeName,
      method: d.data!.method
    };
    return [filter, ...this.getFilters(d.parent!)];
  }

  private select(
    _: number,
    node: TreeNode,
    event: React.MouseEvent<SVGElement, MouseEvent>
  ): void {
    event.stopPropagation();
    const updateSelectedFunc = (
      state: Readonly<ITreeViewRendererState>
    ): ITreeViewRendererState => {
      if (state.selectedNode) {
        this.unselectParentNodes(state.selectedNode);
      }
      this.selectParentNodes(node);

      // Get filters and update
      const filters = this.getFilters(node);
      this.props.updateSelectedCohort(
        filters,
        [],
        ErrorDetectorCohortSource.TreeMap,
        0
      );

      // APPLY TO NODEDETAIL OBJECT TO UPDATE DISPLAY PANEL
      const nodeDetail = {
        errorColor: node!.errorColor!,
        errorInfo: `${node!.data!.error!} Error`,
        globalError: ((node!.data!.error! / state.rootErrorSize) * 100).toFixed(
          2
        ),
        instanceInfo: `${node!.data!.size!} Instances`,
        localError: ((node!.data!.error! / node.data.size) * 100).toFixed(2),
        maskDown: { transform: `translate(0px, -${node!.maskShift!}px)` },
        maskUp: { transform: `translate(0px, ${node!.maskShift!}px)` },
        showSelected: { opacity: 1 },
        successInfo: `${node!.data!.success!} Success`
      };
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
  }

  private fetchTreeNodes(): void {
    if (this.state.request) {
      this.state.request.abort();
    }
    if (!this.props.getTreeNodes) {
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
    //const abortController = new AbortController();
    //const promise = this.props.getTreeNodes(["a", "b", "c"], abortController.signal);
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
        this.clearSelection();
        this.forceUpdate();
        this.reloadData(result);
      });
    // this.setState({ request: abortController }, async () => {
    //     try {
    //         const fetchedData = await promise;
    //         this.treeNodes = fetchedData[0];
    //         this.setState({request: undefined});
    //         this.onResize()
    //     } catch (err) {
    //         if (err.name === 'AbortError') {
    //             return;
    //         }
    //         if (err.name === 'PythonError') {
    //             alert(err.message as string);
    //         }
    //     }
    // });
  }

  private zoomed(zoomEvent: D3ZoomEvent<any, SVGDatum>): void {
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
