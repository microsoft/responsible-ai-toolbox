// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  GroupHeader,
  IDetailsGroupDividerProps,
  IRenderFunction,
  Stack
} from "@fluentui/react";
import React from "react";

import { tableViewStyles } from "./TableView.styles";

export function onRenderGroupHeader(): IRenderFunction<IDetailsGroupDividerProps> {
  const onRender: IRenderFunction<IDetailsGroupDividerProps> = (props) => {
    if (!props) {
      return <Stack />;
    }
    const onToggleSelectGroup: () => void = () => {
      if (props.onToggleCollapse && props.group) {
        props.onToggleCollapse(props.group);
      }
    };
    const classNames = tableViewStyles();
    return (
      <GroupHeader
        {...props}
        styles={{
          check: { display: "none" },
          title: {
            fontSize: "14px"
          }
        }}
        className={classNames.groupHeader}
        onToggleSelectGroup={onToggleSelectGroup}
      />
    );
  };
  return onRender;
}
