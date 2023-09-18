// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getOS(): string {
  const userAgent = window.navigator.userAgent;
  if (userAgent.includes("Windows NT")) {
    return "Windows";
  } else if (userAgent.includes("Mac")) {
    return "Mac";
  }
  return "Linux";
}
