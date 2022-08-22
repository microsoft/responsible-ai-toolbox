import { ITreeNode } from "./TreeViewState";
import { localization } from "@responsible-ai/localization";
import { Metrics } from "@responsible-ai/core-ui";
import { FilterProps } from "../../FilterProps";
import { MetricLocalizationType, MetricUtils } from "../../MetricUtils";
import { HierarchyPointNode } from "d3-hierarchy";

export function treeNodeAriaLabel(
  node: HierarchyPointNode<ITreeNode>,
  isDisabledView: boolean
): string {
  if (isDisabledView) {
    const disabledViewLabel = getNodeText(node);
    return disabledViewLabel;
  }
  const filterProps = node.data.filterProps;
  const condition = node.data.condition;
  const metricName = filterProps.metricName;
  const isErrorRate = metricName === Metrics.ErrorRate;

  let label = condition;
  if (isErrorRate) {
    const errorRateLabel = getErrorRateLabel(filterProps);
    label += errorRateLabel;
  } else {
    const notErrorRateLabel = getNotErrorRateLabel(filterProps);
    label += notErrorRateLabel;
  }

  const errorCoverageLabel = ` ${
    localization.ErrorAnalysis.errorCoverage
  } ${filterProps.errorCoverage.toFixed(2)}%`;
  label += errorCoverageLabel;

  const metricLabel = getMetricLabel(filterProps, isErrorRate);
  label += metricLabel;

  return label;
}

function getErrorRateLabel(props: FilterProps): string {
  const strings = localization.ErrorAnalysis.FilterTooltip;
  const label = ` ${strings.correctNum} ${props.numCorrect} ${strings.incorrectNum} ${props.numIncorrect}`;
  return label;
}

function getNotErrorRateLabel(props: FilterProps): string {
  const strings = localization.ErrorAnalysis.FilterTooltip;
  const errorSum =
    props.numIncorrect > 0.1
      ? props.numIncorrect.toFixed(2)
      : props.numIncorrect.toFixed(4);
  const label = ` ${strings.countNum} ${props.totalCount.toFixed(0)} ${
    strings.errorSum
  } ${errorSum}`;
  return label;
}

function getMetricLabel(props: FilterProps, isErrorRate: boolean): string {
  const metricTitle = MetricUtils.getLocalizedMetric(
    props.metricName,
    MetricLocalizationType.Short
  );
  const metricValue =
    props.metricValue > 0.1
      ? props.metricValue.toFixed(2)
      : props.metricValue.toFixed(4);
  const metricLabel = ` ${metricTitle} ${metricValue} ${
    isErrorRate ? "%" : ""
  }`;
  return metricLabel;
}

export function getNodeText(node: HierarchyPointNode<ITreeNode>): string {
  if (
    node.data.metricName !== Metrics.ErrorRate &&
    node.data.metricName !== undefined
  ) {
    return node.data.metricValue.toFixed(2);
  }
  return `${node.data.error}/${node.data.size}`;
}
