// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  getTheme,
  INavLink,
  INavLinkGroup,
  Nav,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { GlobalTabKeys } from "../ModelAssessmentEnums";

export interface INavigationProps {
  activeGlobalTab: GlobalTabKeys;
  handleGlobalTabClick: (_ev?: any, item?: INavLink | undefined) => void;
}

export class Navigation extends React.PureComponent<INavigationProps> {
  private navLinkGroups: INavLinkGroup[] = [];

  constructor(props: INavigationProps) {
    super(props);

    this.navLinkGroups.push({
      links: [
        {
          key: GlobalTabKeys.ModelStatisticsTab,
          name: localization.ModelAssessment.Navigation.modelStatistics,
          onClick: this.props.handleGlobalTabClick,
          target: "_blank",
          url: ""
        },
        {
          key: GlobalTabKeys.DataExplorerTab,
          name: localization.ErrorAnalysis.dataExplorerView,
          onClick: this.props.handleGlobalTabClick,
          target: "_blank",
          url: ""
        },
        {
          key: GlobalTabKeys.ErrorAnalysisTab,
          name: localization.ErrorAnalysis.Navigation.errorExplorer,
          onClick: this.props.handleGlobalTabClick,
          target: "_blank",
          url: ""
        },
        {
          key: GlobalTabKeys.FairnessTab,
          name: localization.Fairness.Header.title,
          onClick: this.props.handleGlobalTabClick,
          target: "_blank",
          url: ""
        }
      ],
      name: "Identify"
    });
    this.navLinkGroups.push({
      links: [
        {
          key: GlobalTabKeys.GlobalExplanationTab,
          name: localization.ErrorAnalysis.globalExplanationView,
          onClick: this.props.handleGlobalTabClick,
          target: "_blank",
          url: ""
        },
        {
          key: GlobalTabKeys.LocalExplanationTab,
          name: localization.ErrorAnalysis.localExplanationView,
          onClick: this.props.handleGlobalTabClick,
          target: "_blank",
          url: ""
        }
      ],
      name: "Diagnose"
    });
    this.navLinkGroups.push({
      links: [
        {
          key: GlobalTabKeys.CausalAnalysisTab,
          name: "Causal analysis",
          onClick: this.props.handleGlobalTabClick,
          target: "_blank",
          url: ""
        }
      ],
      name: "Actionable Insights"
    });
  }

  public render(): React.ReactNode {
    return (
      <Nav
        selectedKey={this.props.activeGlobalTab}
        onLinkClick={this.props.handleGlobalTabClick}
        styles={{ root: { width: 300 } }}
        groups={this.navLinkGroups}
        onRenderGroupHeader={onRenderGroupHeader}
        onRenderLink={onRenderLink}
      />
    );
  }
}

function onRenderGroupHeader(group?: INavLinkGroup) {
  return (
    <h6 style={{ paddingLeft: "20px" }}>
      {group ? group.name?.toUpperCase() : ""}
    </h6>
  );
}

function onRenderLink(link?: INavLink) {
  const theme = getTheme();
  return (
    <Text
      variant={"mediumPlus"}
      style={{ color: theme.semanticColors.bodyText }}
    >
      {link ? link.name : ""}
    </Text>
  );
}
