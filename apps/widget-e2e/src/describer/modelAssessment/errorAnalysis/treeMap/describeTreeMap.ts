import { IModelAssessmentData } from "../../IModelAssessmentData";
import { describeTreeMapInitialLoad } from "./describeTreeMapInitialLoad";

export function describeTreeMap(datashape: IModelAssessmentData): void {
  describe("Tree Map", () => {
    describeTreeMapInitialLoad(datashape);
  });
}
