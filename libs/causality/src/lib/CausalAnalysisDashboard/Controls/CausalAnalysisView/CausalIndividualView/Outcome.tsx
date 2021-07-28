// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label, Spinner, Stack, Text } from "office-ui-fabric-react";
import React from "react";

interface IOutcomeProps {
  label: string;
  value: number | undefined;
}

const outcome: React.FC<IOutcomeProps> = (props: IOutcomeProps) => {
  return (
    <Stack horizontal>
      <div />
      <Stack>
        <Label>{props.label}</Label>
        {props.value === undefined ? <Spinner /> : <Text>{props.value}</Text>}
      </Stack>
    </Stack>
  );
};

export { outcome as Outcome };
