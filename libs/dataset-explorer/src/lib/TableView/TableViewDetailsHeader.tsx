// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IDetailsColumnRenderTooltipProps,
  IDetailsHeaderProps,
  IRenderFunction,
  SelectAllVisibility,
  TooltipHost
} from "@fluentui/react";
import React from "react";

export const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (
  props,
  defaultRender
) => {
  if (!props) {
    return <div />;
  }
  const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> =
    (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />;
  return (
    <div>
      {defaultRender?.({
        ...props,
        onRenderColumnHeaderTooltip,
        selectAllVisibility: SelectAllVisibility.hidden
      })}
    </div>
  );
};
