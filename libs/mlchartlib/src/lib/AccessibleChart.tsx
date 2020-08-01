import * as _ from "lodash";
import * as Plotly from "plotly.js";
import { PlotlyHTMLElement, Layout } from "plotly.js";
import { ITheme } from "@uifabric/styling";
import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { formatValue } from "./DisplayFormatters";
import { PlotlyThemes, IPlotlyTheme } from "./PlotlyThemes";
import { IPlotlyProperty } from "./IPlotlyProperty";
import { accessibleChartStyle } from "./AccessibleChart.style";

type SelectableChartType = "scatter" | "multi-line" | "non-selectable";

const s = require("./AccessibleChart.css");

export interface IPlotlyAnimateProps {
    props: Partial<IPlotlyProperty>;
    animationAttributes?: any;
}

export interface AccessibleChartProps {
    plotlyProps: IPlotlyProperty;
    theme: string | ITheme;
    themeOverride?: Partial<IPlotlyTheme>;
    relayoutArg?: Partial<Layout>;
    animateArg?: IPlotlyAnimateProps;
    localizedStrings?: any;
    onClickHandler?: (data: any) => void;
}

export class AccessibleChart extends React.Component<AccessibleChartProps> {
    public guid: string = uuidv4();
    private timer: number;
    private plotlyRef: PlotlyHTMLElement;
    private isClickHandled: boolean = false;

    constructor(props: AccessibleChartProps) {
        super(props);
    }

    public componentDidMount(): void {
        if (this.hasData()) {
            this.resetRenderTimer();
        }
    }

    public componentDidUpdate(prevProps: AccessibleChartProps): void {
        if (
            (!_.isEqual(prevProps.plotlyProps, this.props.plotlyProps) || this.props.theme !== prevProps.theme) &&
            this.hasData()
        ) {
            this.resetRenderTimer();
        } else if (this.props.relayoutArg && !_.isEqual(this.props.relayoutArg, prevProps.relayoutArg) && this.guid) {
            Plotly.relayout(this.guid, this.props.relayoutArg);
        } else if (this.props.animateArg && !_.isEqual(this.props.animateArg, prevProps.animateArg) && this.guid) {
            (Plotly as any).animate(this.guid, this.props.animateArg.props, this.props.animateArg.animationAttributes);
        }
    }

    public componentWillUnmount(): void {
        if (this.timer) {
            window.clearTimeout(this.timer);
        }
    }

    public render(): React.ReactNode {
        if (this.hasData()) {
            return (
                <>
                    <div className={accessibleChartStyle.chart} id={this.guid} aria-hidden={true} />
                    {this.createTableWithPlotlyData(this.props.plotlyProps.data)}
                </>
            );
        }
        return (
            <div className={accessibleChartStyle.noData}>
                {this.props.localizedStrings ? this.props.localizedStrings["noData"] : "No Data"}
            </div>
        );
    }

    private hasData(): boolean {
        return (
            this.props.plotlyProps &&
            this.props.plotlyProps.data.length > 0 &&
            _.some(this.props.plotlyProps.data, datum => !_.isEmpty(datum.y) || !_.isEmpty(datum.x))
        );
    }

    private resetRenderTimer(): void {
        if (this.timer) {
            window.clearTimeout(this.timer);
        }
        const themedProps = this.props.theme
            ? PlotlyThemes.applyTheme(this.props.plotlyProps, this.props.theme, this.props.themeOverride)
            : _.cloneDeep(this.props.plotlyProps);
        this.timer = window.setTimeout(async () => {
            this.plotlyRef = await Plotly.react(this.guid, themedProps.data, themedProps.layout, themedProps.config);
            if (!this.isClickHandled && this.props.onClickHandler) {
                this.isClickHandled = true;
                this.plotlyRef.on("plotly_click", this.props.onClickHandler);
            }
            this.setState({ loading: false });
        }, 0);
    }

    private createTableWithPlotlyData(data: Plotly.Data[]): React.ReactNode {
        return (
            <table className={accessibleChartStyle.plotlyTable}>
                <tbody>
                    {data.map((datum, index) => {
                        const xDataLength = datum.x ? datum.x.length : 0;
                        const yDataLength = datum.y ? datum.y.length : 0;
                        const tableWidth = Math.max(xDataLength, yDataLength);
                        // Building this table is slow, need better accesibility for large charts than an unreadable table
                        if (tableWidth > 500) {
                            return;
                        }

                        const xRowCells = [];
                        const yRowCells = [];
                        for (let i = 0; i < tableWidth; i++) {
                            // Add String() because sometimes data may be Nan
                            xRowCells.push(<td key={i + ".x"}>{datum.x ? formatValue(datum.x[i]) : ""}</td>);
                            yRowCells.push(<td key={i + ".y"}>{datum.y ? formatValue(datum.y[i]) : ""}</td>);
                        }
                        return [<tr key={index + ".x"}>{xRowCells}</tr>, <tr key={index + ".y"}>{yRowCells}</tr>];
                    })}
                </tbody>
            </table>
        );
    }
}
