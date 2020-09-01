import Plotly from "plotly.js";
import { IPlotlyProperty } from "./IPlotlyProperty";

export class DefaultSelectionFunctions {
  public static scatterSelection(
    guid: string,
    selections: string[],
    plotlyProps: IPlotlyProperty
  ): void {
    const selectedPoints =
      selections.length === 0
        ? null
        : plotlyProps.data.map((trace) => {
            const selectedIndexes: number[] = [];
            if (trace.customdata) {
              trace.customdata.forEach((data, index) => {
                const id = data?.toString();
                if (id && selections.includes(id)) {
                  selectedIndexes.push(index);
                }
              });
            }
            return selectedIndexes;
          });
    Plotly.restyle(guid, "selectedpoints" as any, selectedPoints as any);
    const newLineWidths =
      selections.length === 0
        ? [0]
        : plotlyProps.data.map((trace) => {
            if (trace.customdata) {
              const customData = trace.customdata;
              const newWidths: number[] = new Array(customData.length).fill(0);
              customData.forEach((data, index) => {
                const id = data?.toString();
                if (id && selections.includes(id)) {
                  newWidths[index] = 2;
                }
              });
              return newWidths;
            }
            return [0];
          });
    Plotly.restyle(guid, "marker.line.width" as any, newLineWidths as any);
  }
}
