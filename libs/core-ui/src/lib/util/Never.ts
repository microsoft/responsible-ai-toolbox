export type Never<T> = { [key in keyof T]?: never };
