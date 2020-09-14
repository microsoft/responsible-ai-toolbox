import { IComboBox, IComboBoxOption } from "office-ui-fabric-react";

export enum WeightVectors {
  Equal = "equal",
  AbsAvg = "absAvg",
  Predicted = "predicted"
}
export type WeightVectorOption =
  | number
  | WeightVectors.Equal
  | WeightVectors.Predicted
  | WeightVectors.AbsAvg;

export interface IWeightedDropdownContext {
  options: IComboBoxOption[];
  selectedKey: WeightVectorOption;
  onSelection: (
    event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ) => void;
}
