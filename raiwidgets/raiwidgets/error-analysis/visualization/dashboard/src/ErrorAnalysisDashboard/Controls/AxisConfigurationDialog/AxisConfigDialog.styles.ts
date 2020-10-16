import { FontSizes, FontWeights, getTheme, IProcessedStyleSet, IStyle, mergeStyleSets, ICalloutContentStyles } from "office-ui-fabric-react";

export interface IAxisControlDialogStyles {
    axisConfigDialog:IStyle;
    wrapper:IStyle;
    leftHalf:IStyle;
    rightHalf:IStyle;
    detailedList:IStyle;
    spinButton:IStyle;
    selectButton: IStyle;
    featureText:IStyle;
    filterHeader:IStyle;
    featureComboBox:IStyle;
    treatCategorical:IStyle;
}

export const axisControlDialogStyles: () => IProcessedStyleSet<IAxisControlDialogStyles> = () => {
    const theme = getTheme();
    return mergeStyleSets<IAxisControlDialogStyles>({
        axisConfigDialog: {
            position: 'absolute',
            overflowY: 'visible',
            width: '560px',
            height: '386px',
            left: '450px',
            top: '250px',
            //elevation64 is used for dialogs/panels
            boxShadow: theme.effects.elevation64,
            borderRadius: '2px'
        },
        wrapper: {
            height: "238px",
            width: "560px",
            display: "flex",
            marginTop:"65px"
        },
        leftHalf: {
            width: "213px",
            height: "238px",
            marginLeft: "40px",
        },
        rightHalf: {
            display: "inline-flex",
            width: "255px",
            height: "238px,",
            flexDirection: "column",
            background: theme.palette.neutralLight,
            marginRight: "27px",
            marginLeft: "25px",
            borderRadius: "5px"
        },
        filterHeader: {
            fontWeight: FontWeights.semibold,
            fontSize: FontSizes.medium,
            color: theme.palette.black
        },
        detailedList: {
            marginTop: "28px",
            height: "160px",
            width: "197px",
            overflowX: "visible"
        },
        featureText: {
            width: "180px",
            height: "20px",
            marginTop:"1px",
            marginLeft: "27px",
            color: theme.palette.neutralSecondaryAlt,
            textAlign: "left",
        },
        featureComboBox: {
            width: "180px",
            height: "56px",
            margin: "21px 48px 1px 30px"
        },
        treatCategorical: {
            width: "180px",
            height: "20px",
            margin: "9px 45px 1px 30px"
        },
        spinButton: {
            width:"55px",
            height:"36px",
            marginLeft:"27px"
        },
        selectButton: {
            marginTop:"24px",
            marginRight:"27px",
            marginLeft:"463px",
            height:"32px",
            width:"70px",
            alignSelf:"flex-end"
        }
        
    });
};

const axisControlDialog = axisControlDialogStyles();
export const axisControlCallout: () => ICalloutContentStyles = () => {
    return {
        container: {},
        root: {},
        beak: {},
        beakCurtain: {},
        calloutMain: axisControlDialog.axisConfigDialog
    };
};