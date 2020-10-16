import { IComboBoxStyles } from "office-ui-fabric-react/lib/ComboBox";
import { IPivotStyles } from "office-ui-fabric-react/lib/Pivot";
import { ITextFieldStyles } from "office-ui-fabric-react/lib/TextField";
import { IStyle, getTheme } from "@uifabric/styling";

export interface IRGBColor {
    r: number;
    g: number;
    b: number;
}

export class FabricStyles {
    public static defaultDropdownStyle: Partial<IComboBoxStyles> = {
        container: {
            display: "inline-flex",
            width: "100%",
        },
        root: {
            flex: 1
        },
        label: {
            padding: "5px 10px 0 10px"
        },
        callout: {
            maxHeight: "256px",
            minWidth: "200px"

        },
        optionsContainerWrapper: {
            maxHeight: "256px",
            minWidth: "200px"
        }
    }

    public static smallDropdownStyle: Partial<IComboBoxStyles> = {
        container: {
            display: "inline-flex",
            flexWrap: "wrap",
            width: "150px",
        },
        root: {
            flex: 1,
            minWidth: "150px"
        },
        label: {
            paddingRight: "10px"
        },
        callout: {
            maxHeight: "256px",
            minWidth: "200px"

        },
        optionsContainerWrapper: {
            maxHeight: "256px",
            minWidth: "200px"
        }
    }

    public static missingParameterPlaceholder: IStyle = {
        height: "300px",
        width: "100%"
    };

    public static missingParameterPlaceholderSpacer: IStyle = {
        margin: "25px auto 0 auto",
        maxWidth: "400px",
        padding: "23px",
        width:"fit-content",
        boxShadow: getTheme().effects.elevation4
    };

    public static faintText: IStyle = {
        fontWeight: "350" as any,
    }

    public static plotlyColorPalette: IRGBColor[] =  [
        {r: 31, g: 119, b: 180},  // muted blue
        {r: 255, g: 127, b: 14},  // safety orange
        {r: 44, g: 160, b: 44},  // cooked asparagus green
        {r: 214, g: 39, b: 40},  // brick red
        {r: 148, g: 103, b: 189},  // muted purple
        {r: 140, g: 86, b: 75},  // chestnut brown
        {r: 227, g: 119, b: 194},  // raspberry yogurt pink
        {r: 127, g: 127, b: 127},  // middle gray
        {r: 188, g: 189, b: 34},  // curry yellow-green
        {r: 23, g: 190, b: 207}   // blue-teal
    ];

    public static plotlyColorHexPalette: string[] =  [
        '#1f77b4',  // muted blue
        '#ff7f0e',  // safety orange
        '#2ca02c',  // cooked asparagus green
        '#d62728',  // brick red
        '#9467bd',  // muted purple
        '#8c564b',  // chestnut brown
        '#e377c2',  // raspberry yogurt pink
        '#7f7f7f',  // middle gray
        '#bcbd22',  // curry yellow-green
        '#17becf'   // blue-teal
    ];

    // public static fabricColorPalette: string[] = [
    //     "#0078d4",
    //     "#00188f",
    //     "#00A2ad",
    //     "#4b003f",
    //     "#917edb",
    //     "#001d3f",
    //     "#e3008c",
    //     "#022f22",
    //     "#ef6950",
    //     "#502006"
    // ];

    public static fabricColorPalette: string[] = [
        '#1f77b4',  // muted blue
        '#ff7f0e',  // safety orange
        '#2ca02c',  // cooked asparagus green
        '#d62728',  // brick red
        '#9467bd',  // muted purple
        '#8c564b',  // chestnut brown
        '#e377c2',  // raspberry yogurt pink
        '#7f7f7f',  // middle gray
        '#bcbd22',  // curry yellow-green
        '#17becf'   // blue-teal
    ];

    public static fabricColorInactiveSeries: string = "#949494";

    public static chartAxisColor: string = "#979797";
    public static fontFamilies = "Segoe UI, Segoe UI Web (West European),  Roboto, Helvetica Neue, sans-serif";

    public static verticalTabsStyle: Partial<IPivotStyles> = {
        root: {
            height: "100%",
            width: "100px",
            display: "flex",
            flexDirection: "column"
        },
        text: {
            whiteSpace: 'normal',
            lineHeight: '28px'
        },
        link: {
            flex: 1,
            backgroundColor: '#f4f4f4',
            selectors: {
                '&:not(:last-child)': {
                    borderBottom: '1px solid grey'
                },
                '.ms-Button-flexContainer': {
                    justifyContent: 'center'
                },
                '&:focus, &:focus:not(:last-child)': {
                    border: '3px solid rgb(102, 102, 102)'
                }
            }    
        },
        linkIsSelected: {
            flex: 1,
            selectors: {
                '&:not(:last-child)': {
                    borderBottom: '1px solid grey'
                },
                '.ms-Button-flexContainer': {
                    justifyContent: 'center'
                },
                '&:focus, &:focus:not(:last-child)': {
                    border: '3px solid rgb(235, 235, 235)'
                }
            }   
        }
    }

    public static textFieldStyle: Partial<ITextFieldStyles> = {
        root: {
            minWidth: '150px',
            padding: '0 5px'
        },
        wrapper :{
            display: "inline-flex"
        },
        subComponentStyles:{
            label: {
                padding: '5px 10px 0 10px'
            },
        },
    }
}