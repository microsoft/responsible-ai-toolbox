// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum RadioKeys {
  /*
   * Keys for the radio buttons (also called ChoiceGroup)
   */
  All = "all",
  Pos = "pos",
  Neg = "neg"
}

export enum QAExplanationType {
  Start = "start",
  End = "end"
}

export class Utils {
  public static argsort(toSort: number[]): number[] {
    /*
     * Returns the indicies that would sort an array.
     * Note the sorting is from low to high values.
     * param toSort: the list that you want to be sorted
     */
    const sorted = toSort.map((val, index) => [val, index]);
    sorted.sort((a, b) => {
      return a[0] - b[0];
    });
    return sorted.map((val) => val[1]);
  }

  public static sortedTopK(
    list: number[],
    k: number | undefined,
    radio: string | undefined
  ): number[] {
    if (!k || !radio) {
      return [];
    }
    /*
     * Returns a list of indices for the tokens to be displayed based on user controls for number of tokens and type of tokens, list will be of len(number of relevant tokens)
     * returns an empty list if there are no tokens that match the radio key
     * param list: the list that needs to be sorted and spliced
     * param k: the maximum length of the returning list
     * param radio: the key which determines which type of feature importance words will be returned
     */
    let sortedList: number[] = [];
    if (radio === RadioKeys.All) {
      sortedList = this.takeTopK(
        this.argsort(list.map((x) => Math.abs(x))).reverse(),
        k
      );
    } else if (radio === RadioKeys.Neg) {
      sortedList = this.takeTopK(this.argsort(list), k);
      if (list[sortedList[sortedList.length - 1]] >= 0) {
        sortedList = [];
      } else {
        for (let i = sortedList.length; i > 0; i--) {
          if (list[sortedList[i]] >= 0) {
            sortedList = sortedList.slice(i + 1, sortedList.length);
            break;
          }
        }
      }
    } else if (radio === RadioKeys.Pos) {
      sortedList = this.takeTopK(this.argsort(list).reverse(), k);
      if (list[sortedList[sortedList.length - 1]] <= 0) {
        sortedList = [];
      } else {
        for (let i = sortedList.length; i > 0; i--) {
          if (list[sortedList[i]] <= 0) {
            sortedList = sortedList.slice(i + 1, sortedList.length);
            break;
          }
        }
      }
    }
    return sortedList;
  }

  public static takeTopK(list: number[], k: number): number[] {
    /*
     * Returns a list after splicing and taking the top K
     * param list: the list to splice
     * param k: the number to splice the list by
     */
    return list.splice(0, k).reverse();
  }

  public static countNonzeros(list: number[]): number {
    /*
     * Returns the count of the nonzero numbers in an array
     * param list: the list in which the numbers are looked at
     */
    return list.reduce((sum, current) => {
      if (current !== 0) {
        sum = sum + 1;
      }
      return sum;
    }, 0);
  }

  public static predictClass(
    className: string[] | undefined,
    prediction: number[] | undefined
  ): string | undefined {
    if (!className || !prediction) {
      return "";
    }
    /*
     * Returns the predicted class
     * param className: the list of possible classes
     * param prediction: a vector encoding of the probabilities (or one-hot vector) representing the predictions for each class
     */
    return className[this.argsort(prediction).reverse()[0]];
  }
}
