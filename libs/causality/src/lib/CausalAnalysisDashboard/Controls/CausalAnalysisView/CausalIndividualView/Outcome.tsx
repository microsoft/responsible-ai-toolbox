// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICausalWhatIfData } from "@responsible-ai/core-ui";
import { Label, Spinner, Stack, Text } from "office-ui-fabric-react";
import React from "react";

interface IOutcomeProps {
  label: string;
  value: ICausalWhatIfData | undefined;
}

const outcome: React.FC<IOutcomeProps> = (props: IOutcomeProps) => {
  return (
    <Stack horizontal>
      <div />
      <Stack>
        <Label>{props.label}</Label>
        {props.value === undefined ? (
          <Spinner />
        ) : (
          <Text>{props.value.point_estimate}</Text>
        )}
      </Stack>
    </Stack>
  );
};

export { outcome as Outcome };
