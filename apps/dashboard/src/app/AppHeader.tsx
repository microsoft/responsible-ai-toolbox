// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CommandBar,
  ICommandBarItemProps,
  IContextualMenuItem
} from "office-ui-fabric-react";
import React from "react";

import { applications, IApplications } from "./applications";
import { IAppSetting } from "./IAppSetting";
import { languages } from "./languages";
import { themes } from "./themes";

export interface IAppHeaderProps extends Required<IAppSetting> {
  application: keyof IApplications;
  onSettingChanged<T extends keyof IAppSetting>(
    field: T,
    value: IAppSetting[T]
  ): void;
}

export class AppHeader extends React.Component<IAppHeaderProps> {
  private readonly onApplicationSelect = this.onSelect.bind(
    this,
    "application"
  );
  private readonly onVersionSelect = this.onSelect.bind(this, "version");
  private readonly onDatasetSelect = this.onSelect.bind(this, "dataset");
  private readonly onThemeSelect = this.onSelect.bind(this, "theme");
  private readonly onLanguageSelect = this.onSelect.bind(this, "language");

  public render(): React.ReactNode {
    const items: ICommandBarItemProps[] = [
      {
        iconProps: {
          iconName: "AllApps"
        },
        key: "application",
        subMenuProps: {
          items: this.getOptions(
            Object.keys(applications),
            this.onApplicationSelect
          )
        },
        text: `Application - ${this.props.application}`
      },
      {
        iconProps: {
          iconName: "NumberField"
        },
        key: "version",
        subMenuProps: {
          items: this.getOptions(
            Object.keys(applications[this.props.application].versions),
            this.onVersionSelect
          )
        },
        text: `Version - ${this.props.version}`
      },
      {
        iconProps: {
          iconName: "Database"
        },
        key: "dataset",
        subMenuProps: {
          items: this.getOptions(
            Object.keys(applications[this.props.application].datasets),
            this.onDatasetSelect
          )
        },
        text: `Dataset - ${this.props.dataset}`
      },
      {
        iconProps: {
          iconName: "ColorSolid"
        },
        key: "theme",
        subMenuProps: {
          items: this.getOptions(Object.keys(themes), this.onThemeSelect)
        },
        text: `Theme - ${this.props.theme}`
      },
      {
        iconProps: {
          iconName: "PlainText"
        },
        key: "language",
        subMenuProps: {
          items: this.getOptions(Object.keys(languages), this.onLanguageSelect)
        },
        text: `Language - ${this.props.language}`
      }
    ];
    return <CommandBar items={items} id="TopMenuBar" />;
  }
  private getOptions(
    labels: readonly string[],
    onClick: (
      ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
      item?: IContextualMenuItem
    ) => boolean | void
  ): IContextualMenuItem[] {
    return labels.map((l) => ({
      data: l,
      key: l,
      onClick,
      text: l
    }));
  }

  private onSelect(
    field: keyof IAppSetting,
    _ev?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
    item?: IContextualMenuItem
  ): boolean {
    if (item?.data) {
      this.props.onSettingChanged(field, item?.data);
    }
    return true;
  }
}
