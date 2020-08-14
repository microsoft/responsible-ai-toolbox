import React from "react";
import { Spinner, SpinnerSize } from "office-ui-fabric-react";
import { localization } from "../../Localization/localization";
import { loadingSpinnerStyles } from "./LoadingSpinner.styles";

export class LoadingSpinner extends React.PureComponent {
  public render(): React.ReactNode {
    return (
      <Spinner
        className={loadingSpinnerStyles.explanationSpinner}
        size={SpinnerSize.large}
        label={localization.BarChart.calculatingExplanation}
      />
    );
  }
}
