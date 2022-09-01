// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const descriptionMaxWidth = "750px";

// hide when screen size is less or equal than large(1023px)
export const hideLgDown = {
  selectors: {
    "@media screen and (max-width: 1023px)": {
      display: "none"
    }
  }
};

// hide when screen size is less or equal than extra large(1365px)
export const hideXlDown = {
  selectors: {
    "@media screen and (max-width: 1365px)": {
      display: "none"
    }
  }
};

// hide when screen size is larger or equal than extra large(1366px)
export const hideXxlUp = {
  selectors: {
    "@media screen and (min-width: 1366px)": {
      display: "none"
    }
  }
};

// flex when screen size is less or equal than small(639px)
export const flexSmDown = {
  selectors: {
    "@media screen and (max-width: 479px)": {
      flexFlow: "wrap"
    }
  }
};

// flex when screen size is less or equal than medium(639px)
export const flexMdDown = {
  selectors: {
    "@media screen and (max-width: 639px)": {
      flexFlow: "wrap"
    }
  }
};

// flex when screen size is less or equal than large(1023px)
export const flexLgDown = {
  selectors: {
    "@media screen and (max-width: 1023px)": {
      flexFlow: "wrap"
    }
  }
};

// flex when screen size is less or equal than large(1365px)
export const flexXlDown = {
  selectors: {
    "@media screen and (max-width: 1365px)": {
      flexFlow: "wrap"
    }
  }
};

// 100% width when screen size is less or equal than large(1023px)
export const fullLgDown = {
  selectors: {
    "@media screen and (max-width: 1023px)": {
      width: "100%"
    }
  }
};
