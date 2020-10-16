import React from 'react';
import ReactDOM from 'react-dom';

import { ErrorAnalysisDashboard } from 'error-analysis-dashboard';

const RenderDashboard = (divId, data) => {
  let generatePrediction = (postData) => {
    return fetch(data.predictionUrl, {method: "post", body: JSON.stringify(postData), headers: {
      'Content-Type': 'application/json'
    }}).then(resp => {
      if (resp.status >= 200 && resp.status < 300) {
        return resp.json()
      }
      return Promise.reject(new Error(resp.statusText))
    }).then(json => {
      if (json.error !== undefined) {
        throw new Error(json.error)
      }
      return Promise.resolve(json.data)
    })
  }

  let generateDebugML = (postData) => {
      return fetch(data.treeUrl, {method: "post", body: JSON.stringify(postData), headers: {
        'Content-Type': 'application/json'
    }}).then(resp => {
        if (resp.status >= 200 && resp.status < 300) {
          return resp.json()
        }
        return Promise.reject(new Error(resp.statusText))
      }).then(json => {
        if (json.error !== undefined) {
          throw new Error(json.error)
        }
        return Promise.resolve(json.data)
      })
    }



  ReactDOM.render(<ErrorAnalysisDashboard
      modelInformation={{modelClass: 'blackbox'}}
      dataSummary={{featureNames: data.featureNames, classNames: data.classNames}}
      testData={data.trainingData}
      predictedY={data.predictedY}
      probabilityY={data.probabilityY}
      trueY={data.trueY}
      precomputedExplanations={{
        localFeatureImportance: data.localExplanations,
        globalFeatureImportance: data.globalExplanation,
        ebmGlobalExplanation: data.ebmData
      }}
      requestPredictions={data.predictionUrl !== undefined ? generatePrediction : undefined}
      requestDebugML={data.treeUrl !== undefined ? generateDebugML : undefined}
      localUrl={data.localUrl}
      locale={data.locale}
      key={new Date()}
      features={data.featureNames}
    />, document.getElementById(divId));
}

export { RenderDashboard, ErrorAnalysisDashboard };
