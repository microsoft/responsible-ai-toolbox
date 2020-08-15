import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface ILoadingSpinnerStyles {
  explanationSpinner: IStyle;
}

export const loadingSpinnerStyles: IProcessedStyleSet<ILoadingSpinnerStyles> = mergeStyleSets<
  ILoadingSpinnerStyles
>({
  explanationSpinner: {
    margin: "auto",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
      -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`,
    padding: "40px"
  }
});
