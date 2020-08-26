import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface ISinglePointFeatureImportanceStyles {
  featureBarExplanationChart: IStyle;
  topControls: IStyle;
  featureSlider: IStyle;
  localSummary: IStyle;
}

export const singlePointFeatureImportanceStyles: IProcessedStyleSet<ISinglePointFeatureImportanceStyles> = mergeStyleSets<
  ISinglePointFeatureImportanceStyles
>({
  featureBarExplanationChart: {
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%"
  },
  topControls: {
    display: "flex",
    padding: "3px 15px"
  },
  featureSlider: {
    flex: 1
  },
  localSummary: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    flex: 1
  }
});
