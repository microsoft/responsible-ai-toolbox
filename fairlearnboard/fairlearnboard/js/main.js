import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import { FairnessWizardV2 } from '@responsible-ai/fairlearn';

const RenderDashboard = (divId, data) => {
    ReactDOM.render(<FairnessWizardV2
      dataSummary={{featureNames: data.features, classNames: data.classes}}
      testData={data.dataset}
      predictedY={data.predicted_ys}
      trueY={data.true_y}
      modelNames={data.model_names}
      precomputedMetrics={data.precomputedMetrics}
      precomputedFeatureBins={data.precomputedFeatureBins}
      customMetrics={data.customMetrics}
      predictionType={data.predictionType}
      supportedBinaryClassificationAccuracyKeys={data.classification_methods}
      supportedRegressionAccuracyKeys={data.regression_methods}
      supportedProbabilityAccuracyKeys={data.probability_methods}
      locale={data.locale}
      key={new Date()}
      theme={theme}
    />, document.getElementById(divId));
}
  
export { RenderDashboard, FairnessWizardV2 };
