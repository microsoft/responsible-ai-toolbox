// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Link, Stack, Text } from "@fluentui/react";
import React from "react";

import { headerWithInfoStyles } from "./HeaderWithInfo.styles";
import { LabelWithCallout } from "./LabelWithCallout";

export interface IHeaderWithInfoProps {
  title: string;
  calloutTitle: string;
  calloutDescription: string;
  calloutLink: string;
  calloutLinkText: string;
  id?: string;
}

export class HeaderWithInfo extends React.Component<IHeaderWithInfoProps> {
  public render(): React.ReactNode {
    const styles = headerWithInfoStyles();

    return (
      <Stack horizontal id={this.props.id}>
        <Stack.Item>
          <Text variant="large" className={styles.boldText}>
            {this.props.title}
          </Text>
        </Stack.Item>

        <Stack.Item className={styles.callout}>
          <LabelWithCallout
            label=""
            calloutTitle={this.props.calloutTitle}
            type="button"
          >
            <Text block>{this.props.calloutDescription}</Text>
            <Link href={this.props.calloutLink} target="_blank">
              {this.props.calloutLinkText}
            </Link>
          </LabelWithCallout>
        </Stack.Item>
      </Stack>
    );
  }
}
