// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { calculateLinePlotData } from "./calculateLineData";


describe("test calculateLineData", () => {
  it('should return ten bins and every bin should have a non-zero value', () => {
    const data = [0.0, .10, .20, .30, .40, .50, .60, .70, .80, .90, 1.00];
    const bins = calculateLinePlotData(data);
    expect(bins).toBeDefined();
    expect(bins?.length).toBe(10);
    for(let i=0; i < bins?.length; i++){
        expect(bins[i].binName).toBeDefined();
        expect(bins[i].binName).toBe(`${i*10}-${(i+1)*10}%`);
        if (i === 9) {
            expect(bins[i].binCount).toEqual(2);
        } else {
            expect(bins[i].binCount).toEqual(1);
        }
    }
  });
  it('should return undefined if no data', () => {
    const bins = calculateLinePlotData([]);
    expect(bins).toBeUndefined();
  });
  it('should return ten bins and only one bin should have non-zero value', () => {
    const data = [0.0];
    const bins = calculateLinePlotData(data);
    expect(bins).toBeDefined();
    expect(bins?.length).toBe(10);
    for(let i=0; i < bins?.length; i++){
        expect(bins[i].binName).toBeDefined();
        expect(bins[i].binName).toBe(`${i*10}-${(i+1)*10}%`);
        if (i === 0) {
            expect(bins[i].binCount).toEqual(1);
        } else {
            expect(bins[i].binCount).toEqual(0);
        }
    }
  });
});