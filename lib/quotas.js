var debug     = require('debug')('skytap-usage')
  , Q         = require('q')
  , arghelper = require('./arghelper')
  , rest      = require('./rest')
  , vargs     = require('vargs-callback');


/** 
 * Company API helper:
 * http://help.skytap.com/#API_Documentation.html#Company
 *
 *
 * @param {Skytap} reference to parent object
 */
function Quotas(skytap) {
  this.getArgs = function getArgs() {
    return skytap.getArgs();
  };
}


/**
 * Export the module
 */
module.exports = Quotas;

/**
 * Get quotas
 *
 */

 Quotas.prototype.list = function list(next) {
  debug('quotas');

  var args = this.getArgs();
  args.url  = 'https://cloud.skytap.com/company/quotas.json';
  return rest.apiGet(args, next);
 };