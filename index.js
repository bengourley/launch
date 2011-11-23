module.exports = function (share) {
  namespace('launch', function () {
    require('./lib')(share);
  });
};
