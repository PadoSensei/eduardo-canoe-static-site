const until = async (fn) => {
  try {
    const result = await fn();
    return [null, result];
  } catch (error) {
    return [error, null];
  }
};
module.exports = { until };
