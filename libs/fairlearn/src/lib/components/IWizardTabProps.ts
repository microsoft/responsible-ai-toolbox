import { IFairnessContext } from "../util/IFairnessContext";

export interface IWizardTabProps {
  dashboardContext: IFairnessContext;
  onNext: () => void;
  onPrevious?: () => void;
}
