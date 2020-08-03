import {
    FontSizes,
    FontWeights,
    getTheme,
    IProcessedStyleSet,
    IStyle,
    mergeStyleSets,
    ICalloutContentStyles,
} from "office-ui-fabric-react";
import { FabricStyles } from "../../FabricStyles";

export interface IAxisControlDialogStyles {
    wrapper: IStyle;
    leftHalf: IStyle;
    rightHalf: IStyle;
    detailedList: IStyle;
    spinButton: IStyle;
    selectButton: IStyle;
    featureText: IStyle;
    filterHeader: IStyle;
    featureComboBox: IStyle;
    treatCategorical: IStyle;
    statsArea: IStyle;
}

export const axisControlDialogStyles: () => IProcessedStyleSet<IAxisControlDialogStyles> = () => {
    const theme = getTheme();
    return mergeStyleSets<IAxisControlDialogStyles>({
        wrapper: {
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            padding: "30px 40px 25px 30px",
            boxSizing: "border-box",
        },
        leftHalf: {
            width: "213px",
        },
        rightHalf: {
            boxSizing: "border-box",
            marginLeft: "25px",
            padding: "20px 25px",
            display: "inline-flex",
            width: "255px",
            flexDirection: "column",
            background: theme.semanticColors.bodyBackgroundChecked,
            borderRadius: "5px",
        },
        filterHeader: {
            fontWeight: FontWeights.semibold,
            fontSize: FontSizes.medium,
            color: theme.semanticColors.bodyTextChecked,
        },
        detailedList: {
            height: "100%",
            width: "100%",
            overflowX: "visible",
        },
        featureText: {
            color: theme.semanticColors.bodySubtext,
        },
        featureComboBox: {
            width: "180px",
            height: "56px",
            marginBottom: "10px",
        },
        treatCategorical: {
            width: "180px",
            height: "20px",
            marginBottom: "10px",
        },
        spinButton: {
            width: "55px",
            height: "36px",
        },
        selectButton: {
            marginRight: "27px",
            marginBottom: "15px",
            height: "32px",
            width: "70px",
            alignSelf: "flex-end",
        },
        statsArea: {
            display: "flex",
            padding: "3px 20px 3px 0",
            justifyContent: "space-between",
        },
    });
};

export const axisControlCallout: () => ICalloutContentStyles = () => {
    const theme = getTheme();
    return {
        container: FabricStyles.calloutContainer,
        root: {},
        beak: {},
        beakCurtain: {},
        calloutMain: {
            overflowY: "visible",
            width: "560px",
            height: "fit-content",
            minHeight: "340px",
            boxShadow: theme.effects.elevation64,
            borderRadius: "2px",
            display: "flex",
            flexDirection: "column",
        },
    };
};
