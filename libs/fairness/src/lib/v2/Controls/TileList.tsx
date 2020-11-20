// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IChoiceGroupOption,
  ChoiceGroup,
  getTheme,
  Label,
  Text
} from "office-ui-fabric-react";
import React from "react";

export interface ITileProp {
  title: string;
  selected: boolean;
  description?: string;
  tags?: string[];
  disabled?: boolean;
  onSelect: () => void;
}

export interface ITileListProps {
  items: ITileProp[];
  columnCount?: number;
}
export class TileList extends React.PureComponent<ITileListProps> {
  public render(): React.ReactNode {
    const theme = getTheme();
    // const styles = TileListStyles();
    // return (
    //   <div className={styles.container}>
    //     {this.props.items.map((item, index) =>
    //       this._onRenderCell(item, index, styles)
    //     )}
    //   </div>
    // );
    var options: IChoiceGroupOption[] = [];
    this.props.items.forEach((item, index) => {
      options.push({
        key: index.toString(),
        text: item.title,
        onRenderLabel: () => {
          return (
            <>
              <Label style={{ margin: "-4px 0 0 30px" }}>{item.title}</Label>
              <Text>{item.description}</Text>
            </>
          );
        },
      });
    });

    return (
      <ChoiceGroup
        label=""
        options={options}
        styles={{
          flexContainer: {
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap"
          }
        }}
      />
    );
  }

  // private _onRenderCell = (
  //   item: ITileProp,
  //   index: number | undefined,
  //   styles: IProcessedStyleSet<ITilesListStyles>
  // ): JSX.Element => {
  //   return (
  //     <div
  //       className={styles.itemCell}
  //       onClick={item.onSelect.bind(this)}
  //       key={index}
  //       data-is-focusable={true}
  //       role="radio"
  //       aria-checked={item.selected}
  //     >
  //       <Icon
  //         iconName={item.selected ? "RadioBtnOn" : "RadioBtnOff"}
  //         className={styles.iconClass}
  //       />
  //       <Text className={styles.title} block>
  //         {item.title}
  //       </Text>
  //       <Text className={styles.description}>{item.description}</Text>
  //     </div>
  //   );
  // };
}
