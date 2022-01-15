// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as Highcharts from "highcharts";
import * as Accessibility from "highcharts/modules/accessibility";
import * as React from "react";
import { HighchartsModuleNames } from "./HighchartTypes";
import { loadModules } from "./HighchartsModules";

// This is the only module we load for all charts.
// Other modules need to be loaded on demand using modules property of the chart component.
Accessibility.default(Highcharts);

interface IHighchartReactProps {
  className?: string;
  chartOptions: Highcharts.Options;
  disableUpdate?: boolean;
  modules?: HighchartsModuleNames[];
  onError?(error: Error): void;
  onUpdate?(chart: Highcharts.Chart): void;
}

// tslint:disable-next-line: function-name
export function HighchartReact(
  props: IHighchartReactProps
): React.ReactElement {
  const { chartOptions, className, disableUpdate, modules, onError, onUpdate } =
    props;

  const chartRef = React.useRef<Highcharts.Chart | null>();
  const containerRef = React.createRef<HTMLDivElement>();

  async function loadChart(): Promise<void> {
    if (!chartRef.current) {
      // If there are any modules needed by the chart, make sure that they're loaded first.
      // For example heatmap chart requires "highcharts/modules/heatmap" module to display properly.
      if (modules?.length) {
        await loadModules(modules);
      }

      // If there is no chartRef around, this is the first load of the component,
      // we are creating the actual chart
      chartRef.current = createChart();
    } else {
      // Component is reloaded by the parent component, now we should see whether
      // an update or a chart recreate is needed
      if (!disableUpdate) {
        // Update is requested and we let Highcharts to the update
        chartRef.current.update(chartOptions);

        // See caller needs to do something after the update
        if (onUpdate) {
          onUpdate(chartRef.current);
        }
      } else {
        // Update is not enabled although component is reloaded, recreating
        // the chart in this case
        chartRef.current.destroy();
        chartRef.current = createChart();
      }
    }
  }

  React.useEffect(() => {
    loadChart();
  });

  React.useEffect(() => {
    // We need to have a seperate hook since we want this to be executed
    // only when component is unloaded
    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  return <div className={} ref={containerRef} />;

  function createChart(): Highcharts.Chart | null | undefined {
    let chart: Highcharts.Chart | null | undefined;
    try {
      chart =
        containerRef.current &&
        Highcharts.chart(containerRef.current, { ...chartOptions });
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }

    return chart;
  }
}
