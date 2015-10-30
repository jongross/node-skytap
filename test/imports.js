var chai      = require('chai')
  , expect    = chai.expect
  , Skytap    = require('../lib/skytap')
  , nockspect = require('./util/nockspect')
  , _         = require('underscore');

describe('Skyap.imports', function () {
  var skytap = Skytap.init({ username: 'foo', token: 'bar'});

  describe('.list', function () {

    it('requests a list of imports', function () {
      return nockspect(function (nock) {
        nock.get('/imports').reply(200);
        return _.bind(skytap.imports.list, skytap.imports);
      });
    });

    it('takes optional parameters', function () {
      return nockspect(function (nock) {
        nock.get('/imports?foo=bar').reply(200);
        return _.bind(skytap.imports.list, skytap.imports, {
          foo: 'bar'
        });
      });
    });
  });    
  describe('.create', function () {

    it('requests an import job be created', function () {
      return nockspect(function (nock) {
        nock.post('/imports', body).reply(200);
        return _.bind(skytap.imports.create, skytap.imports, _.extend({
          template_name: 'foobar',
          region: 'yakima',
          md5: 'fakehash'
        }));
      });
    });
  });