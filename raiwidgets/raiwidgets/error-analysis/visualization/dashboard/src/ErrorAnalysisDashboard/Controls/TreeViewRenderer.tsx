import React from "react";
import { select } from "d3-selection";
import {
  stratify as d3stratify,
  tree as d3tree,
  HierarchyPointNode
} from "d3-hierarchy";
import { scaleLinear as d3scaleLinear } from "d3-scale";
import { interpolateHcl as d3interpolateHcl } from "d3-interpolate";
import { max as d3max } from "d3-array";
import { HelpMessageDict } from "../Interfaces";
import { CSSTransition, TransitionGroup } from "react-transition-group";

// Importing this solely to set the selectedPanelId. This component is NOT a statefulContainer
// import StatefulContainer from '../../ap/mixins/statefulContainer.js'

require("./TreeViewRenderer.css");

export interface ITreeViewRendererProps {
  theme?: string;
  messages?: HelpMessageDict;
  selectedFeatures: string[];
  getTreeNodes: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
}

export interface ITreeViewRendererState {
  request?: AbortController;
  nodeDetail: NodeDetail;
  viewerWidth: number;
  viewerHeight: number;
  selected_node: any;
  treeNodes: Array<any>;
  root: HierarchyPointNode<any>;
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
  mask_down: Transform;
  mask_up: Transform;
}

export interface TreeNode {
  id: string;
  parent: HierarchyPointNode<any>;
  r: number;
  error: number;
  data: TreeNodeData;
  // size: d.size,
  highlight: boolean;
  hoverText: string;
  errorColor: ErrorColorStyle;
  maskShift: number;
  style: Transform;
  error_style: Record<string, number | string>;
  fillstyle_up: FillStyleUp;
  fillstyle_down: Transform;
}

export interface TreeNodeData {
  size: number;
  error: number;
  isSelected: boolean;
  nodeName: string;
  pathFromRoot: string;
}

const SvgOuterFrame: React.RefObject<SVGSVGElement> = React.createRef();
const ErrorAvgColor: string = "#b2b7bd";
const ErrorRatioThreshold: number = 1.0;

export class TreeViewRenderer extends React.PureComponent<
  ITreeViewRendererProps,
  ITreeViewRendererState
> {
  constructor(props: ITreeViewRendererProps) {
    super(props);
    this.state = {
      request: undefined,
      nodeDetail: {
        showSelected: { opacity: 0 },
        globalError: "0",
        localError: "0",
        instanceInfo: "0 Instances",
        errorInfo: "0 Errors",
        successInfo: "0 Success",
        errorColor: {
          fill: "#eaeaea"
        },
        mask_down: {
          transform: `translate(0px, -13px)`
        },
        mask_up: {
          transform: `translate(0px, 13px)`
        }
      },
      viewerWidth: 0,
      viewerHeight: 0,
      selected_node: null,
      treeNodes: null,
      root: null,
      rootSize: 0,
      rootErrorSize: 0,
      rootLocalError: 0
    };
    this.fetchTreeNodes();
  }

  public componentDidUpdate(prevProps: ITreeViewRendererProps): void {
    if (this.props.selectedFeatures != prevProps.selectedFeatures) {
      this.fetchTreeNodes();
    }
  }

  private fetchTreeNodes() {
    if (this.state.request !== undefined) {
      this.state.request.abort();
    }
    if (this.props.getTreeNodes === undefined) {
      return;
    }
    //const abortController = new AbortController();
    //const promise = this.props.getTreeNodes(["a", "b", "c"], abortController.signal);
    this.props
      .getTreeNodes(this.props.selectedFeatures, new AbortController().signal)
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

  public render(): React.ReactNode {
    if (!this.state.root) return null;

    const labelPaddingX = 20;
    const labelPaddingY = 8;
    const labelYOffset = 3;

    const min = this.state.rootErrorSize / this.state.rootSize;
    const max = d3max(
      this.state.root.descendants(),
      (d) => d.data.error / d.data.size
    );

    var colorgrad = d3scaleLinear<string>()
      .domain([min, max])
      .interpolate(d3interpolateHcl)
      .range(["#F4D1D2", "#8d2323"]);

    // GENERATES LINK DATA BETWEEN NODES
    // -------------------------------------------------------------------
    var links = this.state.root
      .descendants()
      .slice(1)
      .map((d) => {
        const thick = 1 + Math.floor(30 * (d.data.size / this.state.rootSize));
        const lineColor = d.data.isSelected ? "089acc" : "e8eaed";
        return {
          id: d.id + Math.random(),
          d: `M${d.x},${d.y}L${d.parent.x},${d.parent.y}`,
          style: { strokeWidth: thick, stroke: lineColor }
        };
      });

    // GENERATES THE LINK LABEL DATA FOR THE SELECTED PATH
    // -------------------------------------------------------------------
    var linkLabels = this.state.root
      .descendants()
      .slice(1)
      .filter((d) => d.data.isSelected)
      .map((d) => {
        const labelX = d.x + (d.parent.x - d.x) * 0.5;
        const labelY = 4 + d.y + (d.parent.y - d.y) * 0.5;
        var bb: DOMRect = null;
        try {
          bb = this.getTextBB(d.data.condition);
        } catch (e) {
          bb = new DOMRect(1, 1, 1, 1);
        }
        return {
          id: `linkLabel${d.id}`,
          text: `${d.data.condition}`,
          style: {
            transform: `translate(${labelX}px, ${labelY}px)`
          },
          bbWidth: bb.width + labelPaddingX,
          bbHeight: bb.height + labelPaddingY,
          bbX: 0.5 * (bb.width + labelPaddingX),
          bbY: 0.5 * (bb.height + labelPaddingY) + labelYOffset
        };
      });

    // GENERTES THE ACTUAL NODE COMPONENTS AND THEIR INTERACTIONS
    // -------------------------------------------------------------------
    var nodeData = this.state.root.descendants().map((d) => {
      const globalErrorPerc = d.data.error / this.state.rootErrorSize;
      const localErrorPerc = d.data.error / d.data.size;
      const calcMaskShift = globalErrorPerc * 52;
      const calcHoverText = `Error Rate: ${(
        (d.data.error / d.data.size) *
        100
      ).toFixed(2)}%\r\nError Coverage: ${(
        (d.data.error / this.state.rootErrorSize) *
        100
      ).toFixed(2)}%\r\nInstances: ${d.data.size}\r\n${
        d.data.pathFromRoot
      }${this.skippedInstances(d)}`;

      let heatmapStyle: { fill: string } = { fill: ErrorAvgColor };

      if (
        d.data.error / d.data.size >
        this.state.rootLocalError * ErrorRatioThreshold
      ) {
        heatmapStyle = { fill: colorgrad(localErrorPerc) };
      }

      let selectedStyle: Record<string, number | string> = heatmapStyle;

      if (d.data.isSelected) {
        selectedStyle = { strokeWidth: 3, fill: heatmapStyle.fill };
      }

      return {
        id: d.id + Math.random(),
        // parentId: d.parentId,
        parent: d.parent,
        r: 28,
        error: 10,
        data: d.data,
        // size: d.size,
        highlight: false,
        hoverText: calcHoverText,
        errorColor: heatmapStyle,
        maskShift: calcMaskShift,
        style: {
          transform: `translate(${d.x}px, ${d.y}px)`
        },
        error_style: selectedStyle,
        fillstyle_up: {
          fill: `#d2d2d2`,
          transform: `translate(0px, ${calcMaskShift}px)`
        },
        fillstyle_down: {
          transform: `translate(0px, -${calcMaskShift}px)`
        }
      };
    });
    var nodeDetail = this.state.nodeDetail;

    return (
      <div className="mainFrame" id="mainFrame">
        <div className="innerFrame">
          <svg
            ref={SvgOuterFrame}
            className="SvgOuterFrame"
            id="SvgOuterFrame"
            viewBox="0 0 1000 500"
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
            <g className="details" onClick={(e) => e.stopPropagation()}>
              <mask id="detailMask">
                <rect x="-26" y="-26" width="52" height="52" fill="white" />
              </mask>

              <g className="opacityToggle" style={nodeDetail.showSelected}>
                <g className="innerOpacityToggle">
                  <rect
                    className="opacityToggleRect"
                    width="280"
                    height="140"
                    fill="transparent"
                  />
                  <text className="detailLines">
                    {nodeDetail.instanceInfo} [ {nodeDetail.errorInfo} |{" "}
                    {nodeDetail.successInfo} ]
                  </text>
                  <g className="opacityToggleCircle">
                    <circle
                      r="26"
                      className="node"
                      style={nodeDetail.errorColor}
                    />
                    <g
                      style={nodeDetail.mask_down}
                      mask="url(#detailMask)"
                      className="nopointer"
                    >
                      <circle
                        r="26"
                        className="node"
                        fill="#d2d2d2"
                        style={nodeDetail.mask_up}
                      />
                    </g>
                    <text className="detailPerc">
                      {nodeDetail.globalError}%
                    </text>
                    <text className="detailPercLabel">error coverage</text>
                  </g>
                  <g className="nonOpacityToggleCircle">
                    <circle
                      r="26"
                      className="node"
                      style={nodeDetail.errorColor}
                    />
                    <circle r="21" className="node" fill="#d2d2d2" />
                    <text className="detailPerc">{nodeDetail.localError}%</text>
                    <text className="detailPercLabel">error rate</text>
                  </g>
                </g>
              </g>
            </g>

            {/* Tree */}
            <TransitionGroup component="g" className="linksTransitionGroup">
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
            <TransitionGroup component="g" className="nodesTransitionGroup">
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
                    onClick={((e) => this.select(index, node, e)).bind(this)}
                  >
                    <circle
                      r={node.r}
                      className="node"
                      style={node.error_style}
                    />

                    <g
                      style={node.fillstyle_down}
                      mask="url(#Mask)"
                      className="nopointer"
                    >
                      <circle r="26" style={node.fillstyle_up} />
                    </g>
                    {/*TODO: not sure why text-anchor is not liked by browser*/}
                    <text textAnchor="middle" className="node_text">
                      {node.data.error} / {node.data.size}
                    </text>
                    <title>{node.hoverText}</title>
                  </g>
                </CSSTransition>
              ))}
            </TransitionGroup>
            <TransitionGroup
              component="g"
              className="linkLabelsTransitionGroup"
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
                    <text className="linkLabel">{linkLabel.text}</text>
                  </g>
                </CSSTransition>
              ))}
            </TransitionGroup>
            <g ref="tempGroup" />
          </svg>
        </div>
      </div>
    );
  }
  public onResize(): void {
    const resizeFunc = (state, props) => {
      var height = 300;
      var width = 800;
      if (document.getElementById("mainFrame") != undefined) {
        height = document.getElementById("mainFrame").clientHeight * 0.3;
        width = document.getElementById("mainFrame").clientWidth * 0.6;
      }
      return { viewerWidth: width, viewerHeight: height };
    };
    this.setState(resizeFunc);
  }
  public reloadData(treeNodes): void {
    const reloadDataFunc = (state, props) => {
      if (!treeNodes || treeNodes.length === 0 || !treeNodes[0]) return;
      var rootSize = treeNodes[0].size;
      var rootErrorSize = treeNodes[0].error;
      var rootLocalError = rootErrorSize / rootSize;

      var temp_root = d3stratify()(treeNodes);
      const treemap = d3tree().size([state.viewerWidth, state.viewerHeight]);
      var root = treemap(temp_root);
      return {
        treeNodes: treeNodes,
        root: root,
        rootSize: rootSize,
        rootErrorSize: rootErrorSize,
        rootLocalError: rootLocalError
      };
    };
    this.setState(reloadDataFunc);
  }
  public getTextBB(labelText) {
    var temp = select(SvgOuterFrame.current).append("g");
    temp.selectAll("*").remove();
    temp.append("text").attr("className", "linkLabel").text(`${labelText}`);

    const bb = temp.node().getBBox();
    temp.selectAll("*").remove();
    return bb;
  }
  public skippedInstances(node) {
    return node.data.badFeaturesRowCount !== 0
      ? `Skipped Instances: ${node.data.badFeaturesRowCount}`
      : "";
  }
  public clearSelection(): void {
    const clearSelectionFunc = (state, props) => {
      var selectedNode = state.selected_node;
      var root = state.root;
      var nodeDetail = state.nodeDetail;
      nodeDetail.showSelected = { opacity: 0 };
      if (selectedNode) {
        this.unselectParentNodes(selectedNode);
        root = this.getRoot(selectedNode);
      }
      return { selected_node: null, nodeDetail: nodeDetail, root: root };
    };
    this.setState(clearSelectionFunc);
  }
  public bkgClick(): void {
    this.clearSelection();
    this.forceUpdate();
  }
  public selectParentNodes(d): void {
    if (!d) return;
    d.data.isSelected = true;
    this.selectParentNodes(d.parent);
  }
  public unselectParentNodes(d): void {
    if (!d) return;
    d.data.isSelected = false;
    this.unselectParentNodes(d.parent);
  }
  public getRoot(d): HierarchyPointNode<any> {
    if (d.parent == null) return d;
    return this.getRoot(d.parent);
  }
  public select(index, node, event): void {
    event.stopPropagation();
    const updateSelectedFunc = (state, props) => {
      if (state.selected_node) {
        this.unselectParentNodes(state.selected_node);
      }
      this.selectParentNodes(node);

      // APPLY TO NODEDETAIL OBJECT TO UPDATE DISPLAY PANEL
      var nodeDetail = {
        showSelected: { opacity: 1 },
        globalError: ((node.data.error / state.rootErrorSize) * 100).toFixed(2),
        localError: ((node.data.error / node.data.size) * 100).toFixed(2),
        instanceInfo: `${node.data.size} Instances`,
        errorInfo: `${node.data.error} Error`,
        successInfo: `${node.data.success} Success`,
        errorColor: node.errorColor,
        mask_down: { transform: `translate(0px, -${node.maskShift}px)` },
        mask_up: { transform: `translate(0px, ${node.maskShift}px)` }
      };
      return {
        selected_node: node,
        nodeDetail: nodeDetail,
        treeNodes: state.treeNodes,
        root: state.root,
        rootSize: state.rootSize,
        rootErrorSize: state.rootErrorSize,
        rootLocalError: state.rootLocalError
      };
    };

    this.setState(updateSelectedFunc);
  }
  public componentDidMount() {
    window.addEventListener("resize", this.onResize.bind(this));
  }
  public componentWillUnmount() {
    window.removeEventListener("resize", this.onResize.bind(this));
  }
}
