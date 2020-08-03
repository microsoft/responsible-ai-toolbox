import { IProcessedStyleSet, mergeStyleSets, IStyle } from "@uifabric/styling";

export interface IDependencePlotStyles {
    DependencePlot: IStyle;
    chartWithAxes: IStyle;
    chart: IStyle;
    chartWithVertical: IStyle;
    verticalAxis: IStyle;
    rotatedVerticalBox: IStyle;
    horizontalAxisWithPadding: IStyle;
    paddingDiv: IStyle;
    horizontalAxis: IStyle;
    placeholderWrapper: IStyle;
    placeholder: IStyle;
    secondaryChartPlacolderBox: IStyle;
    secondaryChartPlacolderSpacer: IStyle;
    faintText: IStyle;
}

export const dependencePlotStyles: () => IProcessedStyleSet<IDependencePlotStyles> = () => {
    return mergeStyleSets<IDependencePlotStyles>({
        DependencePlot: {
            display: "flex",
            flexGrow: "1",
            flexDirection: "row",
        },
        chartWithAxes: {
            display: "flex",
            flex: "1",
            padding: "5px 20px 0 20px",
            flexDirection: "column",
        },
        chart: {
            height: "100%",
            flex: 1,
        },
        chartWithVertical: {
            height: "400px",
            width: "100%",
            display: "flex",
            flexDirection: "row",
        },
        verticalAxis: {
            position: "relative",
            top: "0px",
            height: "auto",
            width: "50px",
        },
        rotatedVerticalBox: {
            transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
            marginLeft: "15px",
            position: "absolute",
            top: "50%",
            textAlign: "center",
            width: "max-content",
        },
        horizontalAxisWithPadding: {
            display: "flex",
            flexDirection: "row",
        },
        paddingDiv: {
            width: "50px",
        },
        horizontalAxis: {
            flex: 1,
            textAlign: "center",
        },
        placeholderWrapper: {
            margin: "100px auto 0 auto",
        },
        placeholder: {
            maxWidth: "70%",
        },
        secondaryChartPlacolderBox: {
            height: "400px",
            flex: 1,
        },
        secondaryChartPlacolderSpacer: {
            margin: "25px auto 0 auto",
            padding: "23px",
            width: "fit-content",
            boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.2)",
        },
        faintText: {
            fontWeight: "350" as any,
        },
    });
};
