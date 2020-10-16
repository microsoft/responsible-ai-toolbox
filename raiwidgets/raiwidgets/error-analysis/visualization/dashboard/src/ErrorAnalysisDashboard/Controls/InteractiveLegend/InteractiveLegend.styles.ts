import { IStyle, mergeStyleSets, IProcessedStyleSet, ITheme, getTheme } from "office-ui-fabric-react";

export interface IInteractiveLegendStyles {
  root: IStyle;
  item: IStyle;
  colorBox: IStyle;
  label: IStyle;
  editButton: IStyle;
  deleteButton: IStyle;
  disabledItem: IStyle;
  inactiveColorBox: IStyle;
  inactiveItem: IStyle;
  clickTarget: IStyle;
}

export const interactiveLegendStyles: () => IProcessedStyleSet<IInteractiveLegendStyles> = () => {
    const theme = getTheme();
    return mergeStyleSets<IInteractiveLegendStyles>({
    root: { 
        paddingTop: "8px",
        paddingBottom:"8px"
    },
    item: {
        height: "34px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: "1px"
    },
    disabledItem: {
        height: "34px",
        backgroundColor: theme.semanticColors.disabledBackground,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: "1px"
    },
    inactiveItem: {
        height: "34px",
        color: theme.semanticColors.primaryButtonTextDisabled,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: "1px"
    },
    colorBox: {
        margin: "11px 4px 11px 8px",
        width: "12px",
        height: "12px",
        display: "inline-block",
        borderRadius: "6px",
        cursor: "pointer"
    },
    inactiveColorBox: {
        margin: "11px 4px 11px 8px",
        width: "12px",
        height: "12px",
        display: "inline-block",
        borderRadius: "6px",
        opacity: 0.4,
        cursor: "pointer"
    },
    label: {
        display: "inline-block",
        flex: "1",
        cursor: "pointer"
    },
    editButton: {
        width: "16px",
        display: "inline-block",
        color: theme.semanticColors.buttonText
    },
    deleteButton: {
        width: "16px",
        display: "inline-block",
        color: theme.semanticColors.errorText
    },
    clickTarget: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        cursor: "pointer",
        flex: "1"
    }
  });
};