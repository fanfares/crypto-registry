export const wait = async (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
