import { IStyle, mergeStyleSets, IProcessedStyleSet, getTheme } from "office-ui-fabric-react";

export interface IMainMenuStyles {
  banner: IStyle;
  summaryLabel: IStyle;
  mediumText: IStyle;
  summaryBox: IStyle;
  summaryItemText: IStyle;
  mainMenu: IStyle;
  cohortBox: IStyle;
  cohortLabelWrapper: IStyle;
  cohortLabel: IStyle;
  overflowButton: IStyle;
  commandButton: IStyle;
  menuIcon: IStyle;
}

export const mainMenuStyles: () => IProcessedStyleSet<IMainMenuStyles> = () => {
    const theme = getTheme();
    return mergeStyleSets<IMainMenuStyles>({
        banner: {
            boxSizing: "border-box",
            height: "60px",
            paddingTop: "10px",
            display: "flex",
            flexDirection: "row",
            width: "100%",
            color: theme.palette.black,
            backgroundColor: theme.palette.white,
            border: "1px solid #C8C8C8"
        },
        summaryLabel: {
            fontVariant: "small-caps",
            fontWeight: "300",
            marginBottom: "2px"
        },
        mediumText: {
            maxWidth: "200px"
        },
        summaryBox: {
            width: "141px",
        },
        summaryItemText: {
            fontSize: "11px",
            lineHeight: "19px"
        },
        mainMenu: {
            width: "100%"
        },
        cohortBox: {
            width: "150px",
            boxSizing: "border-box",
            paddingRight: "10px",
            display: "inline-block"
        },
        cohortLabelWrapper: {
            maxWidth: "100%",
            display: "flex",
            flexDirection: "row"
        },
        cohortLabel: {
            flexGrow: 1
        },
        overflowButton: {
            backgroundColor: theme.palette.neutralPrimary,
            border: "none"
        },
        commandButton: {
            width: 20,
            height: 20,
            padding: '4px 0',
            alignSelf: 'stretch',
            backgroundColor: "transparent"
        },
        menuIcon: {
            color: theme.palette.white,
            fontSize: "20px"
        }
    });
};