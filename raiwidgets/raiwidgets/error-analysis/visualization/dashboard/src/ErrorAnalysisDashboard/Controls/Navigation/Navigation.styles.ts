import { IStyle, mergeStyleSets, IProcessedStyleSet, getTheme } from "office-ui-fabric-react";

export interface INavigationStyles {
  navigation: IStyle;
  breadcrumb: IStyle;
}

export const navigationStyles: () => IProcessedStyleSet<INavigationStyles> = () => {
    const theme = getTheme();
    return mergeStyleSets<INavigationStyles>({
        navigation: {
            boxSizing: "border-box",
            height: "35px",
            width: "100%",
            color: theme.palette.black,
            backgroundColor: theme.palette.white,
            borderTop: "1px solid #C8C8C8",
            borderRight: "1px solid #C8C8C8",
            borderLeft: "1px solid #C8C8C8"
        },
        breadcrumb: {
            padding: "0px 0px 0px 10px"
        }
    });
};