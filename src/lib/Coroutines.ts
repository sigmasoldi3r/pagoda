/*
  Utility async and generator related flow functions.
*/

/** Makes the routine sleep for n milliseconds. */
export const sleep = (n: number) => new Promise(r => setTimeout(r, n))
