'use strict';
module.exports = function(app) {
  var tollUsers = require('../controllers/tollController');

  // TOLL Tax Contract Routes
  app.route('/toll/createUser')
    .post(tollUsers.create_user);

  app.route('/toll/revokeUser')
    .post(tollUsers.revoke_user);

  // ERC20Mintable contract Routes
  app.route('/erc20/balanceOf')
    .post(tollUsers.balanceOf);

};