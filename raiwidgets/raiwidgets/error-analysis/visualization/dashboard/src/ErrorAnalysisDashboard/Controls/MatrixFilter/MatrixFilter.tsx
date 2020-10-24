import React from "react";
import { matrixFilterStyles } from "./MatrixFilter.styles";
import { Stack, IStackTokens } from "office-ui-fabric-react/lib/Stack";
import { MatrixArea } from "../MatrixArea/MatrixArea";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption
} from "office-ui-fabric-react/lib/index";

export interface IMatrixFilterProps {
  theme?: string;
  features: string[];
  getMatrix: (request: any[], abortSignal: AbortSignal) => Promise<any[]>;
}

export interface IMatrixFilterState {
  selectedFeature1: string;
  selectedFeature2: string;
}

const stackTokens: IStackTokens = { childrenGap: 20 };

export class MatrixFilter extends React.PureComponent<
  IMatrixFilterProps,
  IMatrixFilterState
> {
  private options: IComboBoxOption[];
  constructor(props: IMatrixFilterProps) {
    super(props);
    this.state = {
      selectedFeature1: null,
      selectedFeature2: null
    };
    this.options = props.features.map((feature, index) => {
      return { key: index, text: feature };
    });
  }

  public render(): React.ReactNode {
    let classNames = matrixFilterStyles();
    return (
      <>
        <div className={classNames.matrixFilter}>
          <Stack tokens={stackTokens}>
            <Stack horizontal tokens={stackTokens} horizontalAlign="start">
              <Stack.Item key="feature1key">
                <ComboBox
                  placeholder="No Feature"
                  label="X-Axis: Feature 1"
                  options={this.options}
                  dropdownMaxWidth={300}
                  useComboBoxAsMenuWidth
                  onChange={this.handleFeature1Changed}
                  calloutProps={{
                    calloutMaxHeight: 300,
                    directionalHintFixed: true
                  }}
                />
              </Stack.Item>
              <Stack.Item key="feature2key">
                <ComboBox
                  placeholder="No Feature"
                  label="Y-Axis: Feature 2"
                  options={this.options}
                  dropdownMaxWidth={300}
                  useComboBoxAsMenuWidth
                  onChange={this.handleFeature2Changed}
                  calloutProps={{
                    calloutMaxHeight: 300,
                    directionalHintFixed: true
                  }}
                />
              </Stack.Item>
            </Stack>
            <MatrixArea
              theme={this.props.theme}
              features={this.props.features}
              getMatrix={this.props.getMatrix}
              selectedFeature1={this.state.selectedFeature1}
              selectedFeature2={this.state.selectedFeature2}
            />
          </Stack>
        </div>
      </>
    );
  }

  private handleFeature1Changed = (
    event: React.FormEvent<IComboBox>,
    item: IComboBoxOption
  ): void => {
    this.setState({ selectedFeature1: item.text });
  };

  private handleFeature2Changed = (
    event: React.FormEvent<IComboBox>,
    item: IComboBoxOption
  ): void => {
    this.setState({ selectedFeature2: item.text });
  };
}
