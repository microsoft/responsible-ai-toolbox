import React from "react";
import { Spinner, SpinnerSize } from "office-ui-fabric-react";
import { localization } from "../../Localization/localization";

import "./LoadingSpinner.scss";

export class LoadingSpinner extends React.PureComponent {
  public render(): React.ReactNode {
    return (
      <Spinner
        className={"explanation-spinner"}
        size={SpinnerSize.large}
        label={localization.BarChart.calculatingExplanation}
      />
    );
  }
}
