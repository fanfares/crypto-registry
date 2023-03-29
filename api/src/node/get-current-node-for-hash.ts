export const getCurrentNodeForHash = (blockHash: string, nodes: number) => {
  let hash = blockHash.replace(/^0+/, '');
  hash = hash.substring(hash.length/2, hash.length)
  const val = parseInt(hash, 16).toString();
  const dec = '0' + val.substring(val.indexOf('.'), val.indexOf('e+'))
  const p = parseFloat(dec);
  const winner = Math.floor(nodes * p);
  console.log('winner =====================', winner, p)
  return winner;
};

