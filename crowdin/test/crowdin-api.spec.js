var i18nFolders = require('../modules/i18n-folders');
var CrowdinApi = require('../modules/crowdin-api');
var retry = require('bluebird-retry');
var Promise = require('bluebird');
var promiseRetry = require('promise-retry');


i18nFolders = new i18nFolders({
    glob: path.resolve(__dirname, '../mock-folders/app/**/*.i18n.json'),
    splitFolder: 'app'
});

var crowdinApi = new CrowdinApi({
    apiKey: 'b50e9ec565b8e83a8c15e84b59268a4a',
    projectId: 'part-up-web-app'
});

describe('crowdin real api', function() {

    before(function(done) {
        crowdinApi.deleteDirectory('app').then(function() {
            done();
        }).catch(function() {
            done();
        });
    });

    after(function(done) {
        crowdinApi.deleteDirectory('app').then(function() {
            done();
        }).catch(function() {
            done();
        });
    });


    it('should add directory', function(done) {
        expect(crowdinApi.addDirectory('app')).to.be.fulfilled.and.notify(done);
    });

    it('should remove directory', function(done) {
        expect(crowdinApi.deleteDirectory('app')).to.be.fulfilled.and.notify(done);
    });

    it('should retry add folders in sequence until it finished without errors', function(done) {

        crowdinApi.addDirectoriesInSequence(
            [
                'app',
                'app/i18n',
                'app/packages',
                'app/packages/partup:client-footer',
                'app/packages/partup:client-footer/i18n',
                'app/packages/partup:client-pages',
                'app/packages/partup:client-pages/i18n',
                'app/packages/partup:client-pages/i18n/app',
                'app/packages/partup:client-pages/i18n/app/discover',
                'app/packages/partup:client-pages/i18n/app/discover/partials'
            ]
        ).done(function(promise) {
            expect(promise.error).to.be.undefined;
            done();
        });

    });
});

