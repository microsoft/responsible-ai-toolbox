import { modelAssessmentDatasets } from "../modelAssessmentDatasets";
import { describeTreeMap } from "./treeMap/describeTreeMap";

const testName = "Error Analysis";
export function describeErrorAnalysis(
  name: keyof typeof modelAssessmentDatasets
): void {
  const datasetShape = modelAssessmentDatasets[name];

  describe(testName, () => {
    before(() => {
      const hosts = Cypress.env().hosts;
      cy.visit(hosts[0].host);
    });
    describeTreeMap(datasetShape);
  });
}
