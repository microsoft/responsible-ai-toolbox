// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Breadcrumb, IBreadcrumbItem } from "office-ui-fabric-react";
import { Link } from "office-ui-fabric-react/lib/Link";
import { IRenderFunction } from "office-ui-fabric-react/lib/Utilities";
import React from "react";

import { ViewTypeKeys } from "../../ErrorAnalysisDashboard";

import { navigationStyles } from "./Navigation.styles";

export interface INavigationProps {
  updateViewState: (viewTypeKeys: ViewTypeKeys) => void;
  viewType: ViewTypeKeys;
}

export class Navigation extends React.PureComponent<INavigationProps> {
  public render(): React.ReactNode {
    let items: IBreadcrumbItem[] = [];
    if (this.props.viewType === ViewTypeKeys.ExplanationView) {
      items = [
        {
          key: ViewTypeKeys.ErrorAnalysisView,
          onClick: (
            e?: React.MouseEvent<HTMLElement>,
            item?: IBreadcrumbItem
          ): void => {
            if (e !== undefined && item !== undefined) {
              this._errorDetectorBreadcrumbClicked(e, item);
            }
          },
          text: "< Error Detector"
        }
      ];
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
          />
        </div>
      </div>
    );
  }

  private _onRenderItem: IRenderFunction<IBreadcrumbItem> = (
    item?: IBreadcrumbItem
  ): JSX.Element | null => {
    if (item === undefined) {
      return <div></div>;
    }
    if (item.onClick || item.href) {
      return (
        <Link
          as={item.as}
          className="ms-Breadcrumb-itemLink"
          href={item.href}
          onClick={(e: React.MouseEvent<HTMLElement>): void =>
            this._errorDetectorBreadcrumbClicked(e, item)
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

  private _errorDetectorBreadcrumbClicked(
    _: React.MouseEvent<HTMLElement>,
    item: IBreadcrumbItem
  ): void {
    if (item !== undefined && item.key === ViewTypeKeys.ErrorAnalysisView) {
      this.props.updateViewState(item.key);
    }
  }
}
