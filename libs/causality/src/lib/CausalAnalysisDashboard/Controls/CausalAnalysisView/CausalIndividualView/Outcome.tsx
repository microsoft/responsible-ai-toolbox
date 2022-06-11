// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label, Spinner, Stack, Text } from "@fluentui/react";
import React from "react";

interface IOutcomeProps {
  label: string;
  value: number | undefined;
  lower?: number;
  upper?: number;
}

const outcome: React.FC<IOutcomeProps> = (props: IOutcomeProps) => {
  return (
    <Stack>
      <Label>{props.label}</Label>
      <Stack horizontal verticalAlign="end" tokens={{ childrenGap: "s1" }}>
        <Stack.Item>
          {props.value === undefined ? (
            <Spinner />
          ) : (
            <Text variant="large">{props.value}</Text>
          )}
        </Stack.Item>
        <Stack.Item>
          {props.lower !== undefined && props.upper !== undefined && (
            <Text variant="small">{`(${props.lower}, ${props.upper})`}</Text>
          )}
        </Stack.Item>
      </Stack>
    </Stack>
  );
};

export { outcome as Outcome };
