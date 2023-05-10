export const getWinningPost= (nodes: number): number => {
  // let winningPost = (nodes / 2);
  // if (winningPost === Math.floor(winningPost)) {
  //   winningPost = Math.floor(winningPost) + 1
  // }

  return Math.floor(nodes / 2) + 1;
}
