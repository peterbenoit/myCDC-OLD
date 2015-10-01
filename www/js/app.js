//myCDC

angular.module('mycdc', [
    'ionic',
    'mycdc.controllers',
    'mycdc.data',
    'mycdc.directives',
    'mycdc.filters',
    'mycdc.services',
    'mycdc.storage'
    ])

.run(function($ionicPlatform, $rootScope) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.home', {
        url: '/home',
        views: {
            'menuContent': {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }
        }
    })

// Ideally, these would all be dynamic, based off config.json
    // source stream
        // content item view from Id


    // Disease of the Week
    .state('app.DOTW', {
        url: '/dotw',
        views: {
            'menuContent': {
                templateUrl: 'templates/stream.html',
                controller: 'DotwCtrl'
            }
        }
    })
    .state('app.disease', {
        url: '/disease/:articleIdx',
        views: {
            'menuContent': {
                templateUrl: 'templates/article.html',
                controller: 'DiseaseCtrl'
            }
        }
    })
    // FluView Weekly Summary
    .state('app.fluviews', {
        url: '/fluviews',
        views: {
            'menuContent': {
                templateUrl: 'templates/stream.html',
                controller: 'FluViewsCtrl'
            }
        }
    })
    .state('app.fluview', {
        url: '/fluview/:articleIdx',
        views: {
            'menuContent': {
                templateUrl: 'templates/article.html',
                controller: 'FluViewCtrl'
            }
        }
    })
    // Health Articles
    .state('app.healtharticles', {
        url: '/healtharticles',
        views: {
            'menuContent': {
                templateUrl: 'templates/stream.html',
                controller: 'HealthArticlesCtrl'
            }
        }
    })
    .state('app.healtharticle', {
        url: '/healtharticle/:articleIdx',
        views: {
            'menuContent': {
                templateUrl: 'templates/article.html',
                controller: 'HealthArticleCtrl'
            }
        }
    })
    // Vital Signs
    .state('app.vitalsigns', {
        url: '/vitalsigns',
        views: {
            'menuContent': {
                templateUrl: 'templates/stream.html',
                controller: 'VitalSignsCtrl'
            }
        }
    })
    .state('app.vitalsign', {
        url: '/vitalsign/:articleIdx',
        views: {
            'menuContent': {
                templateUrl: 'templates/article.html',
                controller: 'VitalSignCtrl'
            }
        }
    })
    // CDC Director Blog
    .state('app.cdcdirectorsblog', {
        url: '/cdcdirectorsblog',
        views: {
            'menuContent': {
                templateUrl: 'templates/stream.html',
                controller: 'StreamCtrl'
            }
        }
    })
    .state('app.cdcdirectorblog', {
        url: '/cdcdirectorblog/:blogId',
        views: {
            'menuContent': {
                templateUrl: 'templates/blog.html',
                controller: 'BlogCtrl'
            }
        }
    })
    // CDC Works for You 24/7 Blog
    .state('app.247blogs', {
        url: '/247blogs',
        views: {
            'menuContent': {
                templateUrl: 'templates/stream.html',
                controller: 'StreamCtrl'
            }
        }
    })
    .state('app.247blog', {
        url: '/247blog/:blogId',
        views: {
            'menuContent': {
                templateUrl: 'templates/blog.html',
                controller: 'BlogCtrl'
            }
        }
    })
    // Public Health Matters Blog
    .state('app.PHMblogs', {
        url: '/PHMblogs',
        views: {
            'menuContent': {
                templateUrl: 'templates/stream.html',
                controller: 'StreamCtrl'
            }
        }
    })
    .state('app.PHMblog', {
        url: '/PHMblog/:blogId',
        views: {
            'menuContent': {
                templateUrl: 'templates/blog.html',
                controller: 'BlogCtrl'
            }
        }
    })
    // FastStats
    .state('app.FastStats', {
        url: '/FastStats',
        views: {
            'menuContent': {
                templateUrl: 'templates/stream.html',
                controller: 'FastStatsCtrl'
            }
        }
    })
    .state('app.FastStat', {
        url: '/FastStat/:dataId',
        views: {
            'menuContent': {
                templateUrl: 'templates/data.html',
                controller: 'DataCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
});
