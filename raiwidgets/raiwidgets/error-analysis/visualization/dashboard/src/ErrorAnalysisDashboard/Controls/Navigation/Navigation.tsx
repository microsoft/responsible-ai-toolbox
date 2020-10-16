import _ from "lodash";
import { navigationStyles } from "./Navigation.styles";
import {
  Breadcrumb,
  IBreadcrumbItem,
  IBreadcrumbStyles
} from "office-ui-fabric-react/lib/Breadcrumb";
import { ILinkStyles, Link } from "office-ui-fabric-react/lib/Link";
import { viewTypeKeys } from "../../ErrorAnalysisDashboard";
import React from "react";

export interface INavigationProps {
  updateViewState: (viewTypeKeys) => void;
  viewType: viewTypeKeys;
}

export class Navigation extends React.PureComponent<INavigationProps> {
  public render(): React.ReactNode {
    let items = [];
    if (this.props.viewType == viewTypeKeys.explanationView) {
      items = [
        {
          text: "< Error Detector",
          key: viewTypeKeys.errorAnalysisView,
          onClick: (e: React.MouseEvent<HTMLElement>, item: IBreadcrumbItem) =>
            this._errorDetectorBreadcrumbClicked(e, item)
        }
      ];
    }
    let classNames = navigationStyles();
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

  private _onRenderItem = (item: IBreadcrumbItem) => {
    if (item.onClick || item.href) {
      return (
        <Link
          as={item.as}
          className="ms-Breadcrumb-itemLink"
          href={item.href}
          onClick={(e: React.MouseEvent<HTMLElement>) =>
            this._errorDetectorBreadcrumbClicked(e, item)
          }
          color="blue"
        >
          {item.text}
        </Link>
      );
    } else {
      const Tag = item.as || "span";
      return (
        <Tag className="ms-Breadcrumb-item" color="blue">
          {item.text}
        </Tag>
      );
    }
  };

  private _errorDetectorBreadcrumbClicked(
    ev: React.MouseEvent<HTMLElement>,
    item: IBreadcrumbItem
  ): void {
    if (item != undefined && item.key == viewTypeKeys.errorAnalysisView) {
      this.props.updateViewState(item.key);
    }
  }
}
