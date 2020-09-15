// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type Never<T> = { [key in keyof T]?: never };
