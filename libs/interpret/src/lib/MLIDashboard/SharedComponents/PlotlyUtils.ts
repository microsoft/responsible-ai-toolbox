import { IPlotlyProperty } from 'mlchartlib';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IExplanationModelMetadata } from '../IExplanationContext';
import _ from 'lodash';

export class PlotlyUtils {
    public static setColorProperty(
        plotlyProp: IPlotlyProperty,
        item: IDropdownOption,
        modelMetadata: IExplanationModelMetadata,
        colorBarLabel?: string,
    ): void {
        PlotlyUtils.clearColorProperties(plotlyProp);
        if (item.data && item.data.isCategorical) {
            if (item.data.sortProperty !== undefined) {
                plotlyProp.data[0].xAccessorPrefix = `sort_by(@, &${item.data.sortProperty})`;
            }
            plotlyProp.data[0].groupBy = [item.key.toString()];
            _.set(plotlyProp, 'layout.showlegend', true);
        } else {
            if (!_.isEqual([item.key], _.get(plotlyProp.data[0], 'datapointLevelAccessors.color.path'))) {
                _.set(plotlyProp.data[0], 'datapointLevelAccessors.color', {
                    path: [item.key],
                    plotlyPath: 'marker.color',
                });
                _.set(plotlyProp.data[0], 'marker', {
                    colorbar: {
                        title: {
                            side: 'right',
                            text: colorBarLabel,
                        },
                    },
                    colorscale: 'Bluered',
                });
            }
        }
    }

    public static clearColorProperties(plotlyProp: IPlotlyProperty): void {
        // Clear any color settings
        plotlyProp.data[0] = _.omit(plotlyProp.data[0], ['datapointLevelAccessors.color', 'marker.colorbar']);
        // Clear any groupBy settings
        plotlyProp.data[0].groupBy = undefined;
        _.set(plotlyProp, 'layout.showlegend', false);
    }
}
