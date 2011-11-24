module.exports = function (share) {
  namespace('launch', function () {
    require('./lib')(share);
  });
  return {
    action : require('./lib/action')
  };
};
