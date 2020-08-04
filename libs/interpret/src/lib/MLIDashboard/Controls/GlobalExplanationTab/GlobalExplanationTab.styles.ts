import { IStyle, mergeStyleSets, IProcessedStyleSet, getTheme } from "office-ui-fabric-react";
import { FabricStyles } from "../../FabricStyles";

export interface IGlobalTabStyles {
    page: IStyle;
    infoIcon: IStyle;
    helperText: IStyle;
    infoWithText: IStyle;
    globalChartControls: IStyle;
    sliderLabel: IStyle;
    topK: IStyle;
    startingK: IStyle;
    chartTypeDropdown: IStyle;
    globalChartWithLegend: IStyle;
    legendAndSort: IStyle;
    cohortLegend: IStyle;
    legendHelpText: IStyle;
    secondaryChartAndLegend: IStyle;
    missingParametersPlaceholder: IStyle;
    missingParametersPlaceholderSpacer: IStyle;
    faintText: IStyle;
    chartEditorButton: IStyle;
    callout: IStyle;
    boldText: IStyle;
    calloutWrapper: IStyle;
    calloutHeader: IStyle;
    calloutTitle: IStyle;
    calloutInner: IStyle;
    calloutActions: IStyle;
    calloutLink: IStyle;
    infoButton: IStyle;
    multiclassWeightLabel: IStyle;
    multiclassWeightLabelText: IStyle;
    cohortLegendWithTop: IStyle;
    rightJustifiedContainer: IStyle;
}

export const globalTabStyles: () => IProcessedStyleSet<IGlobalTabStyles> = () => {
    const theme = getTheme();
    const rightMarginWidth = "200px";
    return mergeStyleSets<IGlobalTabStyles>({
        page: {
            width: "100%",
            height: "100%",
            padding: "16px 40px 0 14px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
        },
        infoWithText: {
            display: "flex",
            flexDirection: "row",
            width: "100%",
            boxSizing: "border-box",
            paddingLeft: "25px",
        },
        infoIcon: {
            width: "23px",
            height: "23px",
            fontSize: "23px",
        },
        helperText: {
            paddingRight: "120px",
            paddingLeft: "15px",
        },
        globalChartControls: {
            display: "flex",
            flexDirection: "row",
            padding: "18px 300px 4px 67px",
        },
        sliderLabel: {
            fontWeight: "600",
            paddingRight: "10px",
        },
        topK: {
            maxWidth: "200px",
        },
        startingK: {
            flex: 1,
        },
        chartTypeDropdown: {
            margin: "0 5px 0 0",
        },
        globalChartWithLegend: {
            height: "400px",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            position: "relative",
        },
        secondaryChartAndLegend: {
            height: "300px",
            width: "100%",
            display: "flex",
            flexDirection: "row",
        },
        legendAndSort: {
            width: rightMarginWidth,
            height: "100%",
        },
        cohortLegend: {
            fontWeight: "600",
            paddingBottom: "10px",
        },
        legendHelpText: {
            fontWeight: "300",
        },
        missingParametersPlaceholder: [FabricStyles.missingParameterPlaceholder],
        missingParametersPlaceholderSpacer: [FabricStyles.missingParameterPlaceholderSpacer],
        faintText: [FabricStyles.faintText],
        chartEditorButton: [
            FabricStyles.chartEditorButton,
            {
                margin: "5px",
            },
        ],
        callout: {
            width: "200px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            padding: "10px 20px",
            backgroundColor: theme.semanticColors.bodyBackground,
        },
        boldText: {
            fontWeight: "600",
            paddingBottom: "5px",
        },
        calloutWrapper: [FabricStyles.calloutWrapper],
        calloutHeader: [FabricStyles.calloutHeader],
        calloutTitle: [FabricStyles.calloutTitle],
        calloutInner: [FabricStyles.calloutInner],
        infoButton: {
            width: "fit-content",
            margin: "5px",
            padding: "8px 10px",
        },
        multiclassWeightLabel: {
            display: "inline-flex",
            paddingTop: "10px",
        },
        multiclassWeightLabelText: {
            paddingTop: "5px",
            fontWeight: "600",
        },
        cohortLegendWithTop: {
            fontWeight: "600",
            paddingBottom: "10px",
            paddingTop: "10px",
        },
        calloutActions: {
            position: "relative",
            marginTop: 20,
            width: "100%",
            whiteSpace: "nowrap",
        },
        calloutLink: [
            theme.fonts.medium,
            {
                color: theme.palette.neutralPrimary,
            },
        ],
        rightJustifiedContainer: {
            width: "100%",
            paddingRight: rightMarginWidth,
            boxSizing: "border-box",
            display: "inline-flex",
            flexDirection: "row",
            justifyContent: "flex-end",
        },
    });
};
