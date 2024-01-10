// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import jmespath from "jmespath";
import _ from "lodash";
import { Data, Datum } from "plotly.js";

import { accessorMappingFunctions } from "./accessorMappingFunctions";
import { IData } from "./IData";

interface IRow {
  x: any;
  y: any;
  group: any;
  size: any;
}
export class ChartBuilder {
  public static buildPlotlySeries<T>(datum: IData, rows: T[]): IData[] {
    const groupingDictionary: { [key: string]: Partial<Data> } = {};
    let defaultSeries: Partial<Data> | undefined;
    const datumLevelPaths: string = datum.datapointLevelAccessors
      ? `, ${Object.keys(datum.datapointLevelAccessors)
          .map((key) => {
            return `${key}: [${datum.datapointLevelAccessors?.[key].path.join(
              ", "
            )}]`;
          })
          .join(", ")}`
      : "";
    const projectedRows: IRow[] = jmespath.search(
      rows,
      `${datum.xAccessorPrefix || ""}[*].{x: ${datum.xAccessor}, y: ${
        datum.yAccessor
      }, group: ${datum.groupBy}, size: ${
        datum.sizeAccessor
      }${datumLevelPaths}}`
    );
    // for bubble charts, we scale all sizes to the max size, only needs to be done once since its global
    // Due to https://github.com/plotly/plotly.js/issues/2080 we have to set size explicitly rather than use
    // the preferred solution of size ref
    const maxBubbleValue = 10;
    projectedRows.forEach((row) => {
      let series: IData;

      // Handle mutiple group by in the future
      if (datum.groupBy && datum.groupBy.length > 0) {
        const key = row.group;
        if (key === undefined || key === null) {
          if (defaultSeries === undefined) {
            defaultSeries = ChartBuilder.buildDefaultSeries(datum);
          }
          series = defaultSeries as IData;
        } else {
          if (groupingDictionary[key] === undefined) {
            const temp = ChartBuilder.buildDefaultSeries(datum);
            temp.name = key;
            groupingDictionary[key] = temp;
          }
          series = groupingDictionary[key] as IData;
        }
      } else {
        if (defaultSeries === undefined) {
          defaultSeries = ChartBuilder.buildDefaultSeries(datum);
        }
        series = defaultSeries as IData;
      }

      // Due to logging supporting heterogeneous metric types, a metric can be a scalar on one run and a vector on another
      // Support these cases in the minimally surprising way by upcasting a scalar point to match the highest dimension for that row (like numpy does)
      // If two arrays are logged, but of different lengths, pad the shorter ones with undefined to avoid series having different lengths concatted.
      // We always have a size of at least one, this avoids corner case of one array being empty
      const { hasVectorValues, maxLength } = ChartBuilder.getHasVectors(row);
      if (hasVectorValues) {
        // for making scalars into a vector, fill the vector with that scalar value
        if (!Array.isArray(row.x)) {
          row.x = new Array(maxLength).fill(row.x);
        }
        if (!Array.isArray(row.y)) {
          row.y = new Array(maxLength).fill(row.y);
        }
        if (!Array.isArray(row.size)) {
          row.size = new Array(maxLength).fill(row.size);
        }

        // for padding too-short of arrays, set length to be uniform
        row.x.length = maxLength;
        row.y.length = maxLength;
        row.size.length = maxLength;
      }

      if (datum.xAccessor) {
        if (Array.isArray(row.x)) {
          (series.x as Datum[]).push(...row.x);
        } else {
          (series.x as Datum[]).push(row.x);
        }
      }
      if (datum.yAccessor) {
        if (Array.isArray(row.y)) {
          (series.y as Datum[]).push(...row.y);
        } else {
          (series.y as Datum[]).push(row.y);
        }
      }
      if (datum.sizeAccessor) {
        const size =
          (row.size * (datum.maxMarkerSize || 40) ** 2) / (2 * maxBubbleValue);
        (series.marker?.size as number[]).push(Math.abs(size));
      }
      if (datum.datapointLevelAccessors !== undefined) {
        Object.keys(datum.datapointLevelAccessors).forEach((key) => {
          if (!datum.datapointLevelAccessors) {
            return;
          }
          const accessor = datum.datapointLevelAccessors[key];
          const plotlyPath = accessor.plotlyPath;
          let value =
            accessor.mapFunction !== undefined
              ? accessorMappingFunctions[accessor.mapFunction](
                  row[key],
                  datum,
                  accessor.mapArgs || []
                )
              : row[key];
          if (hasVectorValues) {
            if (!Array.isArray(value)) {
              value = new Array(maxLength).fill(value);
            }
            value.length = maxLength;
          }
          if (!_.has(series, plotlyPath)) {
            _.set(series, plotlyPath, []);
          }
          if (Array.isArray(value)) {
            _.get(series, plotlyPath).push(...value);
          } else {
            _.get(series, plotlyPath).push(value);
          }
        });
      }
    });
    const result = defaultSeries !== undefined ? [defaultSeries] : [];
    Object.keys(groupingDictionary).forEach((key) => {
      result.push(groupingDictionary[key]);
    });
    return result as IData[];
  }

  private static getHasVectors(row: IRow): {
    maxLength: number;
    hasVectorValues: boolean;
  } {
    let maxLength = 1;
    let hasVectorValues = false;
    if (Array.isArray(row.x)) {
      hasVectorValues = true;
      maxLength = Math.max(maxLength, row.x.length);
    }
    if (Array.isArray(row.y)) {
      hasVectorValues = true;
      maxLength = Math.max(maxLength, row.y.length);
    }
    if (Array.isArray(row.size)) {
      hasVectorValues = true;
      maxLength = Math.max(maxLength, row.size.length);
    }
    return { hasVectorValues, maxLength };
  }

  private static buildDefaultSeries(datum: IData): Partial<Data> {
    const series: Partial<Data> = _.cloneDeep(datum);
    // defining an x/y accessor will overwrite any hardcoded x or y values.
    if (datum.xAccessor) {
      series.x = [];
    }
    if (datum.yAccessor) {
      series.y = [];
    }
    if (datum.sizeAccessor) {
      if (series.marker) {
        series.marker.size = [];
      }
    }
    if (datum.datapointLevelAccessors !== undefined) {
      Object.keys(datum.datapointLevelAccessors).forEach((key) => {
        const plotlyPath = datum.datapointLevelAccessors?.[key].plotlyPath;
        if (plotlyPath) {
          _.set(series, plotlyPath, []);
        }
      });
    }
    return series;
  }
}
