// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IDetailsColumnRenderTooltipProps,
  IDetailsHeaderProps,
  IRenderFunction,
  SelectAllVisibility,
  Stack,
  TooltipHost
} from "@fluentui/react";
import React from "react";

export function generateOnRenderDetailsHeader(
  selectAllVisibility: SelectAllVisibility
): IRenderFunction<IDetailsHeaderProps> {
  const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (
    props,
    defaultRender
  ) => {
    if (!props) {
      return <Stack />;
    }
    const onRenderColumnHeaderTooltip: IRenderFunction<IDetailsColumnRenderTooltipProps> =
      (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />;
    return (
      <Stack>
        {defaultRender?.({
          ...props,
          onRenderColumnHeaderTooltip,
          selectAllVisibility
        })}
      </Stack>
    );
  };
  return onRenderDetailsHeader;
}
