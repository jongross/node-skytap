var debug     = require('debug')('skytap-environments')
  , Q         = require('q')
  , arghelper = require('./arghelper')
  , rest      = require('./rest')
  , vargs     = require('vargs-callback');



/** 
 * Environment API helper:
 * http://help.skytap.com/#API_Documentation.html#Configur
 *
 * @param {Skytap} reference to parent object
 */
function Environments(skytap) {
  this.skytap = skytap;
  this.getArgs = function getArgs() {
    return skytap.getArgs();
  };
}


/**
 * Export the module
 */
module.exports = Environments;



/**
 * Gets the list of environments
 * 
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.list = vargs(function list(params, next) {
  debug('list');

  var args = this.getArgs();
  args.url = 'https://cloud.skytap.com/configurations';
  args.params = params;
  return rest.apiGet(args, next);
});


/**
 * Gets an environment and its information
 * 
 * @param {Number} environment_id 
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.get = function get(params, next) {
  debug('get %j', params);

  var args = this.getArgs();
  args.url = 'https://cloud.skytap.com/configurations/:configuration_id';
  args.params = params;
  return rest.apiGet(args, next);
};


/**
 * Creates a new environment based on a template
 * or existing configuration
 *
 * @param {Object} params 
 * @config {Number} template_id
 * @config {Number} configuration_id
 * @callback {Function} next
 * @return {Promise} 
 */
Environments.prototype.create = function create(params, next) {
  debug('create %j', params);

  var args = this.getArgs();
  args.url = 'https://cloud.skytap.com/configurations';
  args.params = params;
  return rest.apiPost(args, next);
};


/**
 * Updates an environment's values
 * 
 * @params {Object} params
 * @config {Number} configuration_id
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.update = function update(params, next) {
  debug('update %j', params);

  var args = this.getArgs();
  args.url = 'https://cloud.skytap.com/configurations/:configuration_id';  
  args.params = params;  
  return rest.apiPut(args, next);
};


/**
 * Deletes an environment 
 *  
 * @params {Object} params
 * @config {Number} configuration_id
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.del = function del(params, next) {
  debug('delete %j: ', params);

  var args = this.getArgs();
  args.url = 'https://cloud.skytap.com/configurations/:configuration_id';
  args.params = params;
  return rest.apiDel(args, next);
};


/**
 * Starts an environment from either the suspended or stopped state
 *  
 * @params {Object} params
 * @config {Number} configuration_id
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.start = function start(params, next) {
  debug('run %j', params);

  params.runstate = 'running';
  return this.update(params, next);
};


/**
 * Starts an environment from either the suspended or stopped state
 *  
 * @params {Object} params
 * @config {Number} configuration_id
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.suspend = function suspend(params, next) {
  debug('suspend %j', params);

  params.runstate = 'suspended';
  return this.update(params, next);
};


/**
 * Starts an environment from either the suspended or stopped state
 *  
 * @params {Object} params
 * @config {Number} configuration_id
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.stop = function stop(params, next) {
  debug('stop %j', params);

  params.runstate = 'stopped';
  return this.update(params, next);
};


/**
 * Starts an environment from either the suspended or stopped state
 *  
 * @params {Object} params
 * @config {Number} configuration_id
 * @config {String} runstate
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.waitForState = function waitForState(params, next) {
  debug('waitForState %j', params);
  var deferred = Q.defer()
    , self = this
    , runstate = params.runstate
    , poll;  

  poll = function() {
    debug('waitForState is checking state');

    // retreive the environment
    self.get(params)

    // check the status
    .then(function(environment) {      

      // keep polling if we haven't hit our target
      if(environment.runstate !== runstate) {          
        setTimeout(poll, 5000);
      }

      // otherwise resolve
      else {        
        deferred.resolve(environment);
        if(next) next(null, environment);
      }

    })
    .fail(function(err) {
      deferred.reject(err);
      if(next) next(err);
    });
  };

  poll();
  return deferred.promise;
};


/**
 * Gets the user data for an environment
 *  
 * @params {Object} params
 * @config {Number} configuration_id 
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.userdata = function userdata(params, next) {
  debug('getUserData');  

  var args = this.getArgs();
  args.url = 'https://cloud.skytap.com/configurations/:configuration_id/user_data';
  args.params = params;
  return rest.apiGet(args, next);
};


/**
 * Gets the user data for an environment
 *  
 * @params {Object} params
 * @config {Number} configuration_id 
 * @config {String} contents
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.updateUserdata = function updateUserdata(params, next) {
  debug('updateUserData');

  var args = this.getArgs();
  args.url = 'https://cloud.skytap.com/configurations/:configuration_id/user_data';
  args.params = params;
  return rest.apiPut(args, next);
};


/**
 * Gets all environments available to the 
 * currently authenticated user. 
 *
 * Note: this method makes a request for each user in
 * the system in accordance with the help documentation
 * for retrieving all accessible configurations.
 * http://help.skytap.com/#API_Documentation.html#Configur
 *
 * @callback {Function} next
 * @return {Promise}
 */
Environments.prototype.all = function all(next) {
  debug('all');

  var skytap = this.skytap;
  
  // load list of users
  return skytap.users.list()

  // load user details for each user found
  .then(function(users) {
    return Q.all(users.map(function(user) {
      return skytap.users.get({user_id: user.id});
    }));
  })

  // aggreagte all configurations
  .then(function(users) {    
    return users
      .map(function(user){      
        return user.configurations;
      })
      .reduce(function(result, increment) {
        return result.concat(increment);
      }, []);        
  })

  // allow callback passing functionality
  .nodeify(next);
};