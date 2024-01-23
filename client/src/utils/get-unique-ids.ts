export const getUniqueIds = (keyName: string, items: any[]) => {
  return items.map(input1 => input1[keyName])
  .filter(id => !!id)
  .filter((item, i, names) => names.indexOf(item) === i);
};
