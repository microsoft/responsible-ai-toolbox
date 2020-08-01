import { IStyle, IProcessedStyleSet, getTheme, mergeStyleSets } from '@uifabric/styling';

export interface IFeatureImportanceBarStyles {
    chartWithVertical: IStyle;
    noData: IStyle;
    verticalAxis: IStyle;
    rotatedVerticalBox: IStyle;
    boldText: IStyle;
}

export const featureImportanceBarStyles: () => IProcessedStyleSet<IFeatureImportanceBarStyles> = () => {
    const theme = getTheme();
    return mergeStyleSets<IFeatureImportanceBarStyles>({
        chartWithVertical: {
            display: 'flex',
            flexGrow: '1',
            flexDirection: 'row',
        },
        noData: {
            flex: '1',
            margin: '100px auto 0 auto',
        },
        verticalAxis: {
            position: 'relative',
            top: '0px',
            height: 'auto',
            width: '64px',
        },
        rotatedVerticalBox: {
            transform: 'translateX(-50%) translateY(-50%) rotate(270deg)',
            marginLeft: '28px',
            position: 'absolute',
            top: '50%',
            textAlign: 'center',
            width: 'max-content',
        },
        boldText: {
            fontWeight: '600',
        },
    });
};
