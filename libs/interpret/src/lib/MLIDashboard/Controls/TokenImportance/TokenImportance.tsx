// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    Dropdown,
    IDropdownOption,
    Text
  } from "@fluentui/react";
  import { TokenOption } from "@responsible-ai/core-ui";
  import React from "react";
  
  import { tokenImportanceStyles } from "./TokenImportance.styles";
  
  export interface ITokenImportanceProps {
    onTokenChange: (option: TokenOption) => void;
    selectedToken: TokenOption;
    tokenOptions: TokenOption[];
    tokenLabels: any;
    disabled?: boolean;
  }
  interface ITokenImportanceState {
    tokenOptionsMap: { key: TokenOption; text: any }[];
  }
  
  export class TokenImportance extends React.Component<
    ITokenImportanceProps,
    ITokenImportanceState
  > {
    public constructor(props: ITokenImportanceProps) {
      super(props);

      this.state = {
        tokenOptionsMap: this.props.tokenOptions?.map((option) => {
            return {
              key: option,
              text: this.props.tokenLabels[option]
            };
          })
      };
    }

    public componentDidUpdate(prevProps: ITokenImportanceProps): void {
      if (this.props.tokenOptions !== prevProps.tokenOptions || 
          this.props.tokenLabels !== prevProps.tokenLabels
      ) {
        this.setState({
          tokenOptionsMap: this.props.tokenOptions?.map((option) => {
            return {
              key: option,
              text: this.props.tokenLabels[option]
            };
          })
        })
      }
    }

    public render(): React.ReactNode {
      const tokenNames = tokenImportanceStyles();
      return (
        <div id="TokenImportance">
          <div className={tokenNames.tokenLabel}>
            <Text
              variant={"medium"}
              className={tokenNames.tokenLabelText}
            >
              {"Selected Token"}
            </Text>

          </div>
          {this.state.tokenOptionsMap && (
            <Dropdown
              options={this.state.tokenOptionsMap}
              selectedKey={this.props.selectedToken}
              onChange={this.setTokenOption}
              ariaLabel={"selected token"}
              disabled={this.props.disabled ?? false}
            />
          )}
        </div>
      );
    }
  
    private setTokenOption = (
      _event: React.FormEvent<HTMLDivElement>,
      item?: IDropdownOption
    ): void => {
      if (item?.key === undefined) {
        return;
      }

      const newIndex = item.key as TokenOption;
      this.props.onTokenChange(newIndex);
    };
  }

