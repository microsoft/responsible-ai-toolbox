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

import { ColorPalette } from "../../ColorPalette";
import { ErrorCohort, ErrorDetectorCohortSource } from "../../ErrorCohort";
import { FilterProps } from "../../FilterProps";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import {
  IErrorColorStyle,
  ITransform,
  INodeDetail,
  ITreeViewRendererState
} from "../../TreeViewState";
import { ErrorRateGradient } from "../ErrorRateGradient/ErrorRateGradient";
import { FilterTooltip } from "../FilterTooltip/FilterTooltip";
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
  state: ITreeViewRendererState;
  setTreeViewState: (treeViewState: ITreeViewRendererState) => void;
}

export interface IFillStyleUp {
  transform: string;
  fill: string;
}

export interface ITreeNode {
  data: ITreeNodeData;
  error: number;
  errorColor: IErrorColorStyle;
  errorStyle: Record<string, number | string>;
  fillstyleUp: IFillStyleUp;
  fillstyleDown: ITransform;
  highlight: boolean;
  selected: boolean;
  filterProps: FilterProps;
  id: string;
  isMouseOver: boolean;
  maskShift: number;
  parent: HierarchyPointNode<any>;
  r: number;
  style: ITransform;
}

export interface ITreeNodeData {
  error: number;
  isMouseOver: boolean;
  onSelectedPath: boolean;
  isSelectedLeaf: boolean;
  nodeName: string;
  pathFromRoot: string;
  size: number;
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

export class TreeViewRenderer extends React.PureComponent<
  ITreeViewRendererProps,
  ITreeViewRendererState
> {
  public constructor(props: ITreeViewRendererProps) {
    super(props);
    // Note: we take state from props in case
    this.state = this.props.state;
    if (
      !this.state.treeNodes ||
      this.state.treeNodes.length === 0 ||
      !this.state.treeNodes[0]
    ) {
      this.fetchTreeNodes();
    }
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

    const minColor = ColorPalette.MinColor;
    const maxColor = ColorPalette.MaxColor;

    const colorgrad = d3scaleLinear<string>()
      .domain([min, max])
      .interpolate(d3interpolateHcl)
      .range([minColor, maxColor]);

    const linkVertical = d3linkVertical<any, HierarchyPointNode<any>>()
      .x((d: any) => d!.x!)
      .y((d: any) => d!.y!);
    // GENERATES LINK DATA BETWEEN NODES
    // -------------------------------------------------------------------
    const links = rootDescendents.slice(1).map((d) => {
      const thick = 1 + Math.floor(30 * (d.data.size / this.state.rootSize));
      const lineColor = d.data.onSelectedPath ? "#089acc" : "#e8eaed";
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
      .filter((d) => d.data.onSelectedPath)
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
    const nodeData: ITreeNode[] = rootDescendents.map(
      (d): ITreeNode => {
        const globalErrorPerc = d!.data!.error! / this.state.rootErrorSize;
        const localErrorPerc = d!.data!.error! / d!.data!.size!;
        const calcMaskShift = globalErrorPerc * 52;
        const errorRate = (d!.data!.error! / d!.data!.size!) * 100;
        const filterProps = new FilterProps(
          d!.data!.error!,
          d!.data!.size!,
          this.state.rootErrorSize,
          errorRate
        );

        let heatmapStyle: { fill: string } = { fill: errorAvgColor };

        if (
          d!.data!.error! / d!.data!.size! >
          this.state.rootLocalError * errorRatioThreshold
        ) {
          heatmapStyle = { fill: colorgrad(localErrorPerc)! };
        }

        let selectedStyle: Record<string, number | string> = heatmapStyle;

        if (d!.data!.onSelectedPath!) {
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

          filterProps,
          // size: d.size,
          highlight: d!.data!.onSelectedPath,
          id: d!.id! + Math.random(),
          isMouseOver: d!.data!.isMouseOver,
          maskShift: calcMaskShift,
          parent: d!.parent!,
          r: 28,
          selected: d!.data!.isSelectedLeaf,
          // parentId: d.parentId,
          style: {
            transform: `translate(${d!.x!}px, ${d!.y!}px)`
          }
        };
      }
    );
    const nodeDetail = this.state.nodeDetail;
    const minPct = this.state.rootLocalError * errorRatioThreshold * 100;

    return (
      <div className={classNames.mainFrame} id="mainFrame">
        <div className={classNames.innerFrame}>
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
                  <TreeLegend
                    selectedCohort={this.props.selectedCohort}
                    baseCohort={this.props.baseCohort}
                  />
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
                  <g className={classNames.errorRateGradientStyle}>
                    <ErrorRateGradient
                      max={max}
                      minPct={minPct}
                      selectedCohort={this.props.selectedCohort}
                    />
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
                      // Note: I've tried to add onMouseOver as well but it causes weird perf issues since it fires so often
                      onMouseEnter={(
                        e: React.MouseEvent<SVGElement, MouseEvent>
                      ): void => this.hover(node, true, e)}
                      pointerEvents="all"
                    >
                      <circle
                        r={node.r}
                        className={classNames.node}
                        style={node.errorStyle}
                      />
                      {node.highlight && (
                        <circle
                          r={node.r * 1.4}
                          className={
                            node.selected
                              ? classNames.clickedNodeFull
                              : classNames.clickedNodeDashed
                          }
                        />
                      )}

                      <g
                        style={node.fillstyleDown}
                        mask="url(#Mask)"
                        className={classNames.nopointer}
                      >
                        <circle r="26" style={node.fillstyleUp} />
                      </g>
                      <text textAnchor="middle" className={classNames.nodeText}>
                        {node.data.error} / {node.data.size}
                      </text>
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
                        stroke="#089acc"
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
              <g
                className={classNames.nodesTransitionGroup}
                pointerEvents="none"
              >
                {nodeData.map((node) => (
                  <FilterTooltip
                    key={node.id + "tooltip"}
                    filterProps={node.filterProps}
                    isMouseOver={node.isMouseOver}
                    nodeTransform={node.style.transform}
                  />
                ))}
              </g>
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
    this.props.setTreeViewState(this.state);
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
        nodeDetail = this.getNodeDetail((root as unknown) as ITreeNode, state);
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
    this.props.updateSelectedCohort(
      filters,
      [],
      ErrorDetectorCohortSource.None,
      0
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

  private selectParentNodes(d: HierarchyPointNode<any> | ITreeNode): void {
    if (!d) {
      return;
    }
    d.data!.onSelectedPath = true;
    this.selectParentNodes(d.parent!);
  }

  private unselectParentNodes(d: HierarchyPointNode<any> | ITreeNode): void {
    if (!d) {
      return;
    }
    d.data!.onSelectedPath = false;
    d.data!.isSelectedLeaf = false;
    this.unselectParentNodes(d.parent!);
  }

  private getFilters(d: HierarchyPointNode<any> | ITreeNode): IFilter[] {
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
    node: ITreeNode,
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
      node.data.isSelectedLeaf = true;

      // Get filters and update
      const filters = this.getFilters(node);
      this.props.updateSelectedCohort(
        filters,
        [],
        ErrorDetectorCohortSource.TreeMap,
        0
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
  }

  private getNodeDetail(
    node: ITreeNode,
    state: ITreeViewRendererState
  ): INodeDetail {
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
    return nodeDetail;
  }

  private hover(
    node: ITreeNode,
    mouseEnter: boolean,
    event: React.MouseEvent<SVGElement, MouseEvent>
  ): void {
    node.data.isMouseOver = mouseEnter;
    const currentTarget = event.currentTarget;
    const checkMouseLeave = (e: MouseEvent): void => {
      if (currentTarget && !currentTarget.contains(e.target as HTMLElement)) {
        node.data.isMouseOver = false;
        svgOuterFrame.current!.removeEventListener(
          "mousemove",
          checkMouseLeave
        );
        this.forceUpdate();
      }
    };
    svgOuterFrame.current!.addEventListener("mousemove", checkMouseLeave);
    this.forceUpdate();
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
