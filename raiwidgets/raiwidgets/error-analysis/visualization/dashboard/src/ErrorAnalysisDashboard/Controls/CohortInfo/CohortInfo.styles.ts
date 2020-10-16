import { IStyle, mergeStyleSets, IProcessedStyleSet, getTheme } from "office-ui-fabric-react";

export interface ICohortInfoStyles {
  cohortinfo: IStyle;
  divider: IStyle;
  section: IStyle;
  subsection: IStyle;
  header: IStyle;
}

export const cohortInfoStyles: () => IProcessedStyleSet<ICohortInfoStyles> = () => {
    const theme = getTheme();
    return mergeStyleSets<ICohortInfoStyles>({
        cohortinfo: {
            boxSizing: "border-box",
            color: theme.palette.black,
            backgroundColor: theme.palette.white,
            border: "1px solid #C8C8C8"
        },
        divider: {
            borderTop: "1px solid #DADADA",
            width: "100%",
            margin: "0",
            position: "absolute",
            left: "50%",
            marginRight: "-50%",
            transform: "translate(-50%, 0%)"
        },
        section: {
            paddingLeft: "20px",
            paddingTop: "10px !important",
            paddingBottom: "10px !important"
        },
        subsection: {
        },
        header: {
            fontSize: "14px",
            fontWeight: "600"
        }
    });
};