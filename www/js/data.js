angular.module('mycdc.data', [])

// methods for getting data for a source

.factory('AppData', function($http, $q, AppStorage) {})
.factory('MenuData', function($http, $q, MenuStorage) {})
.factory('DotwData', function($http, $q, DotwStorage) {
    var deferred = $q.defer(),
        promise = deferred.promise,
        data = [],
        service = {};

    service.async = function() {
        $http({
            method: 'GET',
            url: 'json/sources/DOTW.json',
            timeout: 5000
        }).
        then(function(d) {
            result = d;
            data = result.data.results;
            DotwStorage.save(data);
            deferred.resolve();
        }).
        catch(function() {
            data = DotwStorage.all();
            deferred.reject();
        });

        return promise;
    };

    service.getAll = function() {
        return data;
    };

    service.get = function(idx) {
        return data[idx];
    };

    return service;
})
.factory('FluViewData', function($http, $q, FluViewStorage) {
    var deferred = $q.defer(),
        promise = deferred.promise,
        data = [],
        service = {};

    service.async = function() {
        $http({
            method: 'GET',
            url: 'json/sources/FluView.json',
            timeout: 5000
        }).
        then(function(d) {
            result = d;
            data = result.data.results;
            FluViewStorage.save(data);
            deferred.resolve();
        }).
        catch(function() {
            data = FluViewStorage.all();
            deferred.reject();
        });

        return promise;
    };

    service.getAll = function() {
        return data;
    };

    service.get = function(idx) {
        return data[idx];
    };

    return service;
})
.factory('HealthArticlesData', function($http, $q, HealthArticlesStorage) {
    var deferred = $q.defer(),
        deferred2 = $q.defer(),
        promise = deferred.promise,
        promise2 = deferred2.promise,
        data = [], content = '',
        service = {};

    service.async = function() {
        $http({
            method: 'GET',
            url: 'json/sources/HealthArticles.json',
            timeout: 5000
        }).
        then(function(d) {
            result = d;
            data = result.data.results;
            HealthArticlesStorage.save(data);
            deferred.resolve();
        }).
        catch(function() {
            data = HealthArticlesStorage.all();
            deferred.reject();
        });

        return promise;
    };

    service.getContentSource = function(id) {
        $http({
            method: 'GET',
            url: 'json/content/' + id + '.json',
            timeout: 5000
        }).
        then(function(d) {
            content = d.data.results.content;
            deferred2.resolve();
        }).
        catch(function(e) {
            console.log(e);
            deferred2.reject();
        }).
        finally(function() {});

        return promise2;
    };

    service.getContent = function() {
        return content;
    }

    service.getAll = function() {
        return data;
    };

    service.get = function(idx) {
        return data[idx];
    };

    service.getId = function(idx) {
        return data[idx].id;
    };

    return service;
})
.factory('VitalSignsData', function($http, $q, VitalSignsStorage) {
    var deferred = $q.defer(),
        promise = deferred.promise,
        data = [],
        service = {};

    service.async = function() {
        $http({
            method: 'GET',
            url: 'json/sources/VitalSigns.json',
            timeout: 5000
        }).
        then(function(d) {
            result = d;
            data = d.data.results;
            VitalSignsStorage.save(data);
            deferred.resolve();
        }).
        catch(function() {
            data = VitalSignsStorage.all();
            deferred.reject();
        });

        return promise;
    };

    service.getContent = function(id) {
        $http({
            method: 'GET',
            url: 'json/content/' + id + '.json',
            timeout: 5000
        }).
        then(function(d) {
            return d.data.results.content;
        }).
        catch(function() {
            alert('Could not get content');
        });
    };

    service.getAll = function() {
        return data;
    };

    service.get = function(idx) {
        return data[idx];
    };

    service.getId = function(idx) {
        return data[idx].id;
    };

    return service;
})
.factory('FastStatsData', function($http, $q, FastStatsStorage) {
    var deferred = $q.defer(),
        promise = deferred.promise,
        data = [],
        service = {};

    service.async = function() {
        $http({
            method: 'GET',
            url: 'json/sources/FastStats.json',
            timeout: 5000
        }).
        then(function(d) {
            result = d;
            data = result.data.results;
            FastStatsStorage.save(data);
            deferred.resolve();
        }).
        catch(function() {
            data = FastStatsStorage.all();
            deferred.reject();
        });

        return promise;
    };

    service.getAll = function() {
        return data;
    };

    service.get = function(idx) {
        return data[idx];
    };

    return service;
})
.factory('CDCDirectorBlogData', function($http, $q, CDCDirectorBlogStorage) {})
.factory('CDCWorksforYou247BlogData', function($http, $q, CDCWorksforYou247BlogStorage) {})
.factory('PublicHealthMattersBlogData', function($http, $q, PublicHealthMattersBlogStorage) {})


;
