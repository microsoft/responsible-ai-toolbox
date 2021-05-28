// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const nameof = <T>(name: keyof T & string): keyof T & string => name;
