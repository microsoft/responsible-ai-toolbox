// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  Breadcrumb,
  IBreadcrumbItem,
  IBreadcrumbStyleProps,
  IBreadcrumbStyles,
  IStyleFunctionOrObject,
  Link,
  IRenderFunction
} from "office-ui-fabric-react";
import React from "react";

import {
  ViewTypeKeys,
  GlobalTabKeys,
  PredictionTabKeys
} from "../../ErrorAnalysisEnums";

import { navigationStyles } from "./Navigation.styles";

export interface INavigationProps {
  updateViewState: (viewTypeKeys: ViewTypeKeys) => void;
  updatePredictionTabState: (predictionTab: PredictionTabKeys) => void;
  viewType: ViewTypeKeys;
  activeGlobalTab: GlobalTabKeys;
  activePredictionTab: PredictionTabKeys;
}

const breadcrumbStyle: IStyleFunctionOrObject<
  IBreadcrumbStyleProps,
  IBreadcrumbStyles
> = {
  root: { margin: "3px 0px 1px" }
};

export class Navigation extends React.Component<INavigationProps> {
  public render(): React.ReactNode {
    const items: IBreadcrumbItem[] = [];
    if (this.props.viewType === ViewTypeKeys.ErrorAnalysisView) {
      items.push({
        key: ViewTypeKeys.ErrorAnalysisView,
        text: localization.ErrorAnalysis.Navigation.errorExplorer
      });
    }
    if (this.props.viewType === ViewTypeKeys.ExplanationView) {
      items.push({
        key: ViewTypeKeys.ErrorAnalysisView,
        onClick: (
          e?: React.MouseEvent<HTMLElement>,
          item?: IBreadcrumbItem
        ): void => {
          if (e !== undefined && item !== undefined) {
            this.errorDetectorBreadcrumbClicked(e, item);
          }
        },
        text: localization.ErrorAnalysis.Navigation.errorExplorer
      });
      if (this.props.activeGlobalTab === GlobalTabKeys.DataExplorerTab) {
        items.push({
          key: GlobalTabKeys.DataExplorerTab,
          text: localization.ErrorAnalysis.Navigation.dataExplorer
        });
      } else if (
        this.props.activeGlobalTab === GlobalTabKeys.GlobalExplanationTab
      ) {
        items.push({
          key: GlobalTabKeys.GlobalExplanationTab,
          text: localization.ErrorAnalysis.Navigation.globalExplanation
        });
      } else if (
        this.props.activeGlobalTab === GlobalTabKeys.LocalExplanationTab
      ) {
        if (
          this.props.activePredictionTab !== PredictionTabKeys.InspectionTab
        ) {
          items.push({
            key: GlobalTabKeys.LocalExplanationTab,
            text: localization.ErrorAnalysis.Navigation.localExplanation
          });
        } else {
          items.push({
            key: GlobalTabKeys.LocalExplanationTab,
            onClick: (
              e?: React.MouseEvent<HTMLElement>,
              item?: IBreadcrumbItem
            ): void => {
              if (e !== undefined && item !== undefined) {
                this.localExplanationBreadcrumbClicked(e, item);
              }
            },
            text: localization.ErrorAnalysis.Navigation.localExplanation
          });
          items.push({
            key: PredictionTabKeys.InspectionTab,
            text:
              localization.ErrorAnalysis.Navigation.localExplanationInspection
          });
        }
      }
    }
    const classNames = navigationStyles();
    return (
      <div className={classNames.navigation}>
        <div className={classNames.breadcrumb}>
          <Breadcrumb
            items={items}
            maxDisplayedItems={10}
            ariaLabel="Navigation"
            overflowAriaLabel="More links"
            onRenderItem={this._onRenderItem}
            styles={breadcrumbStyle}
          />
        </div>
      </div>
    );
  }

  private _onRenderItem: IRenderFunction<IBreadcrumbItem> = (
    item?: IBreadcrumbItem
  ): JSX.Element | null => {
    if (!item) {
      return <div></div>;
    }
    if (item.onClick) {
      return (
        <Link
          as={item.as}
          className="ms-Breadcrumb-itemLink"
          href={item.href}
          onClick={(e: React.MouseEvent<HTMLElement>): void =>
            item.onClick!(e, item)
          }
          color="blue"
        >
          {item.text}
        </Link>
      );
    }
    return (
      <span className="ms-Breadcrumb-item" color="blue">
        {item.text}
      </span>
    );
  };

  private errorDetectorBreadcrumbClicked(
    _: React.MouseEvent<HTMLElement>,
    item: IBreadcrumbItem
  ): void {
    if (item !== undefined && item.key === ViewTypeKeys.ErrorAnalysisView) {
      this.props.updateViewState(item.key);
    }
  }

  private localExplanationBreadcrumbClicked(
    _: React.MouseEvent<HTMLElement>,
    item: IBreadcrumbItem
  ): void {
    if (item !== undefined && item.key === GlobalTabKeys.LocalExplanationTab) {
      this.props.updatePredictionTabState(
        PredictionTabKeys.CorrectPredictionTab
      );
    }
  }
}
