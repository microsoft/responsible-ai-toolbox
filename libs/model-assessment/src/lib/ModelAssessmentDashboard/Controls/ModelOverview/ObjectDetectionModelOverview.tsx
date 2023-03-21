import { IComboBoxOption } from "@fluentui/react";
import { IDataset } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export function getSelectableAggregateMethod(): IComboBoxOption[] {
    const selectableAggregateMethods : IComboBoxOption[] = [
      { key: "macro",
        text: localization.ModelAssessment.ModelOverview.metricTypes.macro },
      { key: "micro",
        text: localization.ModelAssessment.ModelOverview.metricTypes.micro }
    ];
    return selectableAggregateMethods;
};

export function getSelectableClassNames(dataset: IDataset): IComboBoxOption[] {
    const selectableClassNames : IComboBoxOption[] = []
    if (dataset.class_names) {
      for (const className of dataset.class_names) {
        selectableClassNames.push({
          key: className,
          text: className
        })
      }
    }
    return selectableClassNames;
};





