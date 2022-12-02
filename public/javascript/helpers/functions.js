const returnExpressions = (expressions) => {
  const sortedArr = Object.entries(expressions).sort(
    ([, v1], [, v2]) => v1 - v2
  );
  const max = sortedArr[sortedArr.length - 1];
  return { max };
};

export { returnExpressions };
