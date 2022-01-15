// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import _ from "lodash";

export const defaultHighchartsOptions: Highcharts.Options = {
  chart: {
    panKey: "ctrl",
    panning: {
      enabled: true,
      type: "xy"
    },
    resetZoomButton: {
      position: {
        verticalAlign: "top",
        x: -4,
        y: 4
      },
      relativeTo: "plotBox"
    },
    spacingBottom: 16,
    spacingLeft: 16,
    spacingRight: 16,
    spacingTop: 16,
    zoomType: "xy"
  },
  credits: undefined,
  plotOptions: {
    area: {
      marker: {
        enabled: false
      }
    },
    line: {
      marker: {
        enabled: false
      }
    },
    scatter: {
      marker: {
        radius: 3,
        symbol: "circle"
      }
    }
  },
  time: {
    useUTC: false
  },
  title: {
    text: undefined
  },
  xAxis: {
    gridLineWidth: 0,
    title: {
      text: undefined
    }
  },
  yAxis: {
    gridLineWidth: 1,
    title: {
      text: undefined
    }
  },
  zAxis: {
    gridLineWidth: 1,
    title: {
      text: undefined
    }
  }
};
