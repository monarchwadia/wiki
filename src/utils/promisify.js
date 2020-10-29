module.exports = function promisify(nodeStyleFunction, ...args) {
  return new Promise((resolve, reject) => {
    nodeStyleFunction(...args, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
