const numRows = 200;
const numFeatures = 50000;
const perPointExplanation = new Array(numRows).fill(0).map(x => { return new Array(numFeatures).fill(0).map(y => Math.random())});

export const largeFeatureCount = {

    localExplanations: {
        intercept: [0.2, -0.2, 0.1],
        scores: [perPointExplanation, perPointExplanation, perPointExplanation]
    }
}