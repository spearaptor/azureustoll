'use strict';
module.exports = function(app) {
  var tollUsers = require('../controllers/tollController');

  // TOLL Tax Contract Routes
  app.route('/toll/createUser')
    .post(tollUsers.create_user);

  app.route('/toll/createToll')
    .post(tollUsers.create_toll);

  app.route('/erc20/mint')
    .post(tollUsers.mint);

  app.route('/toll/revokeUser')
    .post(tollUsers.revoke_user);

  app.route('/toll/payToll')
    .post(tollUsers.pay_toll);
  
  app.route('/toll/revokeToll')
    .post(tollUsers.revoke_toll);

  // ERC20Mintable contract Routes
  app.route('/erc20/balanceOf')
    .post(tollUsers.balanceOf);

};