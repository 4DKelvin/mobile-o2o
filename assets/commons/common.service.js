Common.factory('Http', ['$http', 'basePath', 'cacheConstants', function ($http, basePath, CacheConstants) {
    return {
        get: function (path, params) {
            var url = basePath + path;
            var token = store.get(CacheConstants.token);
            var memberId = store.get(CacheConstants.memberId);
            if (token != null) {
                params.token = token;
            }
            if (memberId != null) {
                params.memberId = memberId;
            }
            return $http.get(url, {params: params, timeout: 1000 * 10});
        },
        post: function (path, params) {
            var url = basePath + path;
            var token = store.get(CacheConstants.token);
            var memberId = store.get(CacheConstants.memberId);
            var data = {token: token, memberId: memberId, requestData: params};
            return $http.post(url, data);
        }
    };
}]);