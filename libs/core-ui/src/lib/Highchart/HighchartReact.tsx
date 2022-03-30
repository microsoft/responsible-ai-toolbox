// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as Highcharts from "highcharts";
import HighchartsMore from "highcharts/highcharts-more";
import * as Accessibility from "highcharts/modules/accessibility";
import * as Exporting from "highcharts/modules/exporting";
import * as React from "react";

import { loadModules } from "./HighchartsModules";
import { HighchartsModuleNames } from "./HighchartTypes";

// This is the only module we load for all charts.
// Other modules need to be loaded on demand using modules property of the chart component.
Accessibility.default(Highcharts);
Exporting.default(Highcharts);
// init module
HighchartsMore(Highcharts);

interface IHighchartReactProps {
  className?: string;
  id?: string;
  chartOptions: Highcharts.Options;
  disableUpdate?: boolean;
  modules?: HighchartsModuleNames[];
  onError?(error: Error): void;
  onUpdate?(chart: Highcharts.Chart): void;
}

export function HighchartReact(
  props: IHighchartReactProps
): React.ReactElement {
  const chartRef = React.useRef<Highcharts.Chart | null>();
  const containerRef = React.createRef<HTMLDivElement>();

  const createChart = () => {
    let chart: Highcharts.Chart | null | undefined;
    try {
      chart =
        containerRef.current &&
        Highcharts.chart(containerRef.current, { ...props.chartOptions });
    } catch (error) {
      if (props.onError) {
        props.onError(error as Error);
      }
    }
    return chart;
  };

  async function loadChart(): Promise<void> {
    if (chartRef.current) {
      if (!props.disableUpdate) {
        // Update is requested and we let Highcharts to the update
        chartRef.current.update(props.chartOptions, undefined, true);

        // See caller needs to do something after the update
        if (props.onUpdate) {
          props.onUpdate(chartRef.current);
        }
      } else {
        // Update is not enabled although component is reloaded, recreating
        // the chart in this case
        chartRef.current.destroy();
        chartRef.current = createChart();
      }
    }
    if (!chartRef.current) {
      // If there are any modules needed by the chart, make sure that they're loaded first.
      // For example heatmap chart requires "highcharts/modules/heatmap" module to display properly.
      if (props.modules?.length) {
        await loadModules(props.modules);
      }
      // If there is no chartRef around, this is the first load of the component,
      // we are creating the actual chart
      chartRef.current = createChart();
    }
  }

  React.useEffect(() => {
    loadChart();
  });

  React.useEffect(() => {
    // We need to have a separate hook since we want this to be executed
    // only when component is unloaded
    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  return <div className={props.className} id={props.id} ref={containerRef} />;
}
