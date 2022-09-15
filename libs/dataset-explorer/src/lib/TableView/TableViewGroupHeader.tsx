// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Icon, IDetailsGroupDividerProps, Stack } from "@fluentui/react";
import React from "react";

import { tableViewStyles } from "./TableView.styles";

export const onToggleCollapse = (props?: IDetailsGroupDividerProps) => {
  return (): void => {
    if (props?.group && props?.onToggleCollapse) {
      props?.onToggleCollapse(props.group);
    }
  };
};

export const onRenderGroupHeader = (
  props?: IDetailsGroupDividerProps
): React.ReactElement => {
  const classNames = tableViewStyles();
  const iconName = props?.group?.isCollapsed
    ? "ChevronRightMed"
    : "ChevronDownMed";
  return (
    <Stack className={classNames.header} horizontal>
      <Icon
        ariaLabel="expand collapse group"
        className={classNames.chevronButton}
        iconName={iconName}
        onClick={onToggleCollapse(props)}
      />
      <span className={classNames.headerTitle}>{props?.group?.name}</span>
      &nbsp;
      <span className={classNames.headerCount}>
        {`(${props?.group?.count})`}
      </span>
    </Stack>
  );
};
