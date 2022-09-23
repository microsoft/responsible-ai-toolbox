// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DelayedRender } from "@fluentui/react";
import React from "react";

interface IProps {
  message: string | undefined;
  delay?: number;
  role?: string;
  ariaLive?: React.AriaAttributes["aria-live"];
  automationId?: string;
}

export const Announce: React.FunctionComponent<IProps> = (props: IProps) => {
  // CSS clipping to hide content, but still allowed to be read by modern screen readers.
  // reference: https://webaim.org/techniques/css/invisiblecontent/
  const hiddenElementStyles: React.CSSProperties = {
    clip: "rect(1px, 1px, 1px, 1px)",
    clipPath: "inset(50%)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    width: "1px"
  };

  const role = props.role || "status";
  const delay = props.delay || 0;
  const ariaLive = props.ariaLive || "assertive";

  return (
    <div role={role} aria-live={ariaLive}>
      <DelayedRender delay={delay}>
        {
          <span
            style={hiddenElementStyles}
            data-automation-id={props.automationId}
          >
            {props.message}
          </span>
        }
      </DelayedRender>
    </div>
  );
};
