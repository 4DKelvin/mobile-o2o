//router
Home.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/index/',{
            controller:'index',
            templateUrl:'indexView'
        })
        .when('/login/',{
            controller:'login',
            templateUrl:'loginView'
        })
        .otherwise({
            redirectTo:'/index/'
        });
}]);