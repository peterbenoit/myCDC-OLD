/**
 *
 */
angular.module('mycdc.directives', [])

// THESE CAN BE MOVED TO DIRECTIVES FILE
.directive('uiContainer', function($rootScope, $timeout) {
   return {
        restrict: 'E',
        controller: function($scope, $element){
            if ($scope.containerLoading === undefined) {
                $scope.containerLoading = true;
            }

            $scope.getContainerTemplate = function (blnLoader) {

                var uiContainerTemplateUrl;

                if (!blnLoader && $rootScope.screenState && $rootScope.sourceMeta) {
                    if ($rootScope.screenState.viewType == 'phone') {
                        uiContainerTemplateUrl = 'templates/' + $rootScope.sourceMeta.templates.containerSet + '-phone.html';
                    } else {
                        uiContainerTemplateUrl = 'templates/' + $rootScope.sourceMeta.templates.containerSet + '-tablet-' + $rootScope.screenState.viewOrientation + '.html';
                    }
                } else {
                    uiContainerTemplateUrl = 'templates/ui-loader.html';
                }

                $rootScope.log(uiContainerTemplateUrl, 1, 'UI-CONTAINER-TEMPLATE');

                $scope.containerLoading = false;

                return uiContainerTemplateUrl;
            };

            // SET LISTENER ONCE
            if (!$scope.uiContainerInit) {
                $scope.uiContainerInit = true;
                $scope.$on('screen-state-update-started', function(event, args) {
                    $rootScope.log('UI CONTAINER DIRECTIVE RECEIVED screen-state-update-started', 2, 'EVENT-LISTENER:');
                    $scope.containerLoading = true;
                });
                $scope.$on('screen-state-update-complete', function(event, args) {
                    $rootScope.log('UI CONTAINER DIRECTIVE RECEIVED screen-state-update-complete', 2, 'EVENT-LISTENER:');
                    $timeout($scope.getContainerTemplate, 0);
                });
            }
        },
        scope : '*',
        template: '<div ng-include="getContainerTemplate()"></div>'
   };
})
.directive('uiStream', function($rootScope, $state, $timeout, $ionicPosition, $ionicLoading, $stateParams) {
   var vsd, hsd;

   return {
        restrict: 'E',
        controller: ['$scope', '$element', function($scope, $element){

            $scope.$on('scroll.loadMore', function() {
                $timeout(function() {
                    $ionicLoading.hide();
                }, 2000);
            });

            // CREATE MAIN TEMPALTE HANDLER (COULD USE IONIC FOR TABLE DETECTION, BUT THIS SEEMS MORE UNIVERSAL WITH LESS isThis, isThat CALLS)
            $scope.getStreamTemplate = function () {

                var uiStreamTemplateUrl;

                if ($rootScope.screenState && $rootScope.sourceMeta) {
                    if ($rootScope.screenState.viewType == 'tablet') {
                        uiStreamTemplateUrl = 'templates/' + $rootScope.sourceMeta.templates.stream + '-' + $rootScope.screenState.viewOrientation + '.html';
                    } else {
                        uiStreamTemplateUrl = 'templates/' + $rootScope.sourceMeta.templates.stream + '-universal.html';
                    }
                } else {
                    uiStreamTemplateUrl = 'templates/ui-loader.html';
                }

                //$rootScope.log($('.vertical-scroller').length, -100, 'VERTICAL SCROLLER');
                //$rootScope.log($('.horizontal-scroller').length, -100, 'HORIZONTAL SCROLLER');

                // SCROLLER HEIGHT / WIDTH FIX - IMPORTANT
                var jqVs = $('.vertical-scroller');
                if (jqVs.length) {
                    var intMenuHeight = 44;
                    var jqH3 = $('h3.scroll-header');
                    if (jqVs) {
                        var newHeight = $rootScope.screenState.height - intMenuHeight;
                        if (jqH3.length) {
                            newHeight = newHeight - jqH3.outerHeight();
                        }
                        jqVs.height(newHeight);
                    }
                }

                var jqHs = $('.horizontal-scroller');
                if (jqHs.length) {
                    var newWidth = $rootScope.screenState.width;
                    jqHs.width(newWidth);
                }

                /*
                $rootScope.log($rootScope.screenState.height, -100, 'SCREEN HEIGHT');
                $rootScope.log($('> h3', jsLv).outerHeight(), -100, 'H3 HEIGHT');
                $rootScope.log(newHeight, -100, 'FINAL HEIGHT');
                */
                // END SCROLLER HEIGHT / WIDTH FIX

                $rootScope.log($rootScope.screenState.height, -1, 'SCREEN HEIGHT');

                return uiStreamTemplateUrl;
            };

            // SET LISTENER ONCE
            if (!$scope.uiStreamInit) {
                $scope.uiStreamInit = true;
                $scope.$on('screen-state-update-complete', function(event, args) {
                    $rootScope.log('UI STREAM DIRECTIVE RECEIVED screen-state-update-complete', 2, 'EVENT-LISTENER:');
                    $scope.getStreamTemplate();
                });
                $scope.$on('source-name-changed', function(event, args) {
                    $rootScope.log('SOURCE NAME CHANGED', 2, 'EVENT-LISTENER:');
                    $state.go('app.sourceDetail', {sourceName: $rootScope.sourceName, sourceDetail: $rootScope.sourceDetail });
                });
            }
        }],
        template: '<div ng-include="getStreamTemplate()"></div>'
   }
})
.directive("uiCard", function($rootScope, $timeout, $state) {
    return {
        // ISOLATE SCOPE (RESTRIECT TO CARD DATA OBJECT AND TEMPLATE ATTR)
        scope: {
            cardData: '=',
            appState: '=',
            template: '@'
        },
        restrict: 'E',
        controller: function($scope) {

            $scope.isActiveCard = function (sourceDetail) {
                if ($scope.appState.sourceDetail == sourceDetail) {
                    return 'card-active';
                }
                return "";
            };

            $scope.getCardTemplate = function (blnLoader) {

                blnLoader = blnLoader || false;

                // DEFAULT TO LOADER (IF STATE SCREEN STATE NOT READY, ETC.)
                var uiCardTemplateUrl = 'templates/ui-loader.html';

                if (blnLoader) {
                    return uiCardTemplateUrl;
                }

                if (!tplInit) {
                    var tplInit = true;

                    // SCREEN STATE READY?
                    if ($rootScope.screenState) {
                        // TEMPLATE LOGIC
                        if ($scope.template) {
                            // TEMPLATE OVERRIDE PROVIDED - USE IT
                            uiCardTemplateUrl = 'templates/' + $scope.template+ '.html';
                        } else if ($rootScope.sourceName == 'homestream' &&  $scope.cardData.templates.hasOwnProperty('homeCard')) {
                            // USE DEFAULT TEMPLATE FOR CARD
                            uiCardTemplateUrl = 'templates/' + $scope.cardData.templates.homeCard + '.html';
                        } else if ($scope.cardData.templates && $scope.cardData.templates.hasOwnProperty('card')) {
                            // USE DEFAULT TEMPLATE FOR CARD
                            uiCardTemplateUrl = 'templates/' + $scope.cardData.templates.card + '.html';
                        }
                    }

                    /*if ($scope.cardData.id == '152266') {
                        $rootScope.log($scope.cardData, -1000, 'UI-CARD-DATA');
                        $rootScope.log(uiCardTemplateUrl, -1000, 'UI-CARD-TEMPLATE');
                    }*/

                }

                // RETURN TEMPLATE
                return uiCardTemplateUrl;
            };
        },
        link: function(scope, element, attrs) {
            scope.template = attrs.template;
        },
        template: '<div id="card-{{cardData.id}}" class="card-container-pad" ng-include src="getCardTemplate()"></div>',
    };
})
.directive('uiDetail', function($rootScope, $timeout, $sce, $q, $filter, $state, $stateParams, $ionicPopup, $ionicLoading) {

    var getSourceHtmlUrl = function(sourceCard, blnRefresh) {

        var defer, localStore, localData, objMetaData, noChromeUrl, derivedState;

        // DEFAULT REFRESH IF NEEDED
        blnRefresh = blnRefresh || false;

        // CREATE A PROMISE
        defer = $q.defer();

        // DERIVE A STATE FROM THE CARD PASSED (WHAT SOURCE & DETAIL ARE WE INTERESTED IN?)
        derivedState = {
            sourceName : sourceCard.feedIdentifier,
            sourceDetail : sourceCard.id
        };

        // GET SOURCE METDATA
        objMetaData = $rootScope.getSourceMeta(derivedState);

        // GET LOCAL STORE
        localStore = $rootScope.getLocalStoreByAppState('sourceDetail', derivedState);

        // GET DATA FROM LOCAL STORE
        localData = localStore.all();

        // SET TMP OBJECT
        objTemp = {};

        // CHECK IF WE NEED TO REFRESH OR NOT
        if (!blnRefresh && !localData.expired) {

            console.log
            // LOCAL DATA IS GOOD
            // RESOLVE PROMISE WITH THE STORED DATA
            $rootScope.log(localData.data, 1, 'Using Local Detail Data (Still Fresh)');
            defer.resolve(localData.data);

        } else {

            // CREATE NOCHROME URL
            objTemp.sourceUrl = sourceCard.sourceUrl;
            objTemp.filename = objTemp.sourceUrl.split('/').pop();
            objTemp.noChromeUrl = objTemp.filename.split('.')[0] + '_nochrome.' + objTemp.filename.split('.')[1];
            objTemp.noChromeUrl = objTemp.sourceUrl.replace(objTemp.filename, objTemp.noChromeUrl);

            if (objTemp.noChromeUrl.indexOf('http') == -1) {
                objTemp.noChromeUrl = window.location.protocol + '//' + objTemp.noChromeUrl;
                alert('No Chrome URL FIXED!');
                alert(objTemp.noChromeUrl);
            }

            // URL CHECK NEEDED
            $rootScope.remoteApi({
                url : 'http://www2c.cdc.gov/podcasts/checkurl.asp?url=' + objTemp.noChromeUrl
            }).then(function(resp) {
                var urlToUse;
                // DETERMINE URL BASED ON SERVER STATUS RETURN
                if (resp.data.status === '200') {
                    urlToUse = objTemp.noChromeUrl;
                } else {
                    urlToUse = objTemp.sourceUrl;
                }
                //SAVE IT TO LOCAL
                localStore.save(urlToUse);
                // RESOLVE THE PROMISE WITH THE NEW DATA
                defer.resolve(urlToUse);
                return resp;
            },
            function(resp) {
                // TEMP - SAVE IT TO LOCAL
                localStore.save(objTemp.sourceUrl);
                defer.resolve(objTemp.sourceUrl);
                return resp;
            });
        }
        // RETURN THE PROMISE
        return defer.promise;
    };

    var getSourceDetail = function(sourceCard, blnRefresh) {

        var defer, localStore, localData, objMetaData, derivedState;

        // CREATE A PROMISE
        defer = $q.defer(),
        // DERIVE A STATE FROM THE CARD PASSED (WHAT SOURCE & DETAIL ARE WE INTERESTED IN?)
        derivedState = {
            sourceName : sourceCard.feedIdentifier,
            sourceDetail : sourceCard.id
        };
        // GET META DATA FROM
        objMetaData = $rootScope.getSourceMeta(derivedState);
        localStore = $rootScope.getLocalStoreByAppState('sourceDetail', derivedState);
        localData = localStore.all();

        // CHECK IF WE NEED TO REFRESH OR NOT
        if (!blnRefresh && !localData.expired) {

            // LOCAL DATA IS GOOD
            // RESOLVE PROMISE WITH THE STORED DATA
            $rootScope.log(localData.data, -1000, 'Using Local Detail Data (Still Fresh)');
            defer.resolve(localData.data);

        } else {

            //objCurrentCard = $rootScope.getSourceCard();

            var detailUrl = 'https://prototype.cdc.gov/api/v2/resources/media/' + derivedState.sourceDetail + '/syndicate.json';

            // REMOTE DATA NEEDED

            // GET DATA
            $rootScope.remoteApi({
                url: detailUrl
            }).then(function(d) {

                // NORMALIZE DATA BY SOURCE SPECS
                var data = $rootScope.dataProcessor(d, objMetaData);

                //SAVE IT TO LOCAL
                localStore.save(data);

                // RESOLVE WITH PROCESSED DATA
                $rootScope.log('Using New Detail Data (Remote)', -1000);
                defer.resolve(data);

            }, function(e) {

                // ON ERROR
                if (localData.data && localData.data.length) {

                    // FALLBACK TO SAVED DATA
                    $rootScope.log('Using Local Detail Data (Not Fresh)', -1000);
                    //$rootScope.log(localData.data, -100, 'Using Local Detail Data (Not Fresh)');
                    defer.resolve(localData.data);

                } else {

                    // ALL FAILED RETURN WHAT WE HAVE IN LOCAL STORAGE
                    $rootScope.log('Could Not Find And Data (Local, Remote, or Default)', -1000);
                    defer.reject();
                }
            });
        }

        return defer.promise;
    };

    return {
        restrict: 'E',
        scope : {
            detailCard : '=',
            sourceMeta : '=',
            appState : '='
        },
        controller : function ($rootScope, $scope) {

            // SET DEFAULT TEMPLATE
            $scope.uiDetailTemplateUrl = 'templates/ui-loader.html';

            // LOAD DETAILS ON DETAIL CARD SET / SELECTION
            $scope.$watch('detailCard', function() {
                if ($scope.detailCard) {

                    // SHOW LOADER
                    $ionicLoading.show({
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                    });

                    // NEW THREAD SO LOADER SHOWS...
                    $timeout(function(){
                        // GET DETAIL DATA - THEN HIDE LOADER (& HANDLER ERROR IF NEEDED)
                        $scope.loadDetailData($scope.detailCard).then(function(d){
                            $ionicLoading.hide();
                        }, function () {
                            $ionicLoading.hide();
                            // NO DETAIL CARD FOUND IN CARD LIST: ALERT USER, THEN REDIRECT
                            var noDetailCard = $ionicPopup.alert({title: 'Content not available.', template: 'Sorry, we could not seem to find that content. Please try again.'});
                            noDetailCard.then(function() {
                                $state.go('app.sourceDetail', {sourceName: $scope.sourceName, sourceDetail: $scope.appState.sourceDetail});
                            });
                        });
                    }, 500);
                }
            });

            $scope.trustedContent = function() {
                return $sce.trustAsHtml($scope.detailCard.content);
            };

            $scope.loadDetailData = function (objDetailCard) {

                var defer = $q.defer();
                detailData = {};

                $rootScope.log(objDetailCard, -1000, 'CURRENT DETAIL CARD');

                // CONTINUE IF DETAIL CARD EXISTS IN SCOPE (AND NOT INITIALIZED ALREADY)
                if (objDetailCard) {

                    $scope.detailTemplateUrl = 'templates/' + objDetailCard.templates.detail + '.html';

                    console.log(objDetailCard.detailType);

                    // CALL SPECIFIED PROCESSOR
                    switch (objDetailCard.detailType) {
                        case 'iframe':

                             // SIMPLY SET DETAIL DATA FROM CURRENT CARD
                            detailData = objDetailCard;

                            // GET NO CHROME URL
                            getSourceHtmlUrl(objDetailCard).then(function(iframeUrl){

                                // SET RESPONSE FOR USE BY HTML PARTIAL (AS IFRAME SRC)
                                detailData.frameUrl = $sce.trustAsResourceUrl(iframeUrl);

                                // RESOLVE PROMISE WITH THIS DATA
                                defer.resolve(detailData);

                            });

                        break;
                        case 'video':

                            // VIDEOS - NO ADDITIONAL SERVICE CALLS NEEDED
                            // SIMPLY SET DETAIL DATA FROM CURRENT CARD
                            detailData = objDetailCard;

                            // PROVIDE A VIDEO URL HELPER FOR THE VIDEO PARTIAL
                            detailData.videoUrl = $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + detailData.sourceUrl.split('?v=')[1] + '?rel=0');

                            // RESOLVE PROMISE WITH THIS DATA
                            defer.resolve(detailData);

                        break;
                        case 'journal':
                        case 'blog':

                            // GET SOURCE DETAIL DATA
                            getSourceDetail(objDetailCard, false).then(function(d){

                                // NORMALIZE DATA BY SOURCE SPECS?
                                detailData = d;

                                // UNFORTUNATE = SEEMS TO NEED TO BE ROOT LEVEL SCOPE ITEM TO WORK
                                // $SCOPE.DETAILCARD.CONTEN WILL NOT BIND CORRCETLY, WITH TRUST, OR APPLY, OR ANYTHING...
                                // CAN LOOK INTO IT MORE LATER, BUT NOT WORTH TEH TIME NOW

                                // SET HTML CONTENT
                                $scope.content = detailData.content;

                                // RESOLVE PROMISE WITH THIS DATA
                                defer.resolve(detailData);

                            });

                        break;
                        default:

                            // GET SOURCE DETAIL DATA
                            getSourceDetail(objDetailCard, false).then(function(d){

                                // NORMALIZE DATA BY SOURCE SPECS?
                                detailData = d;

                                // RESOLVE PROMISE WITH THIS DATA
                                defer.resolve(detailData);

                            });

                        break;
                    }

                }

                defer.promise.then(function(detailData){

                    // SAVE DETAIL DATA TO SCOPE
                    $scope.detailData = detailData;

                    // DEBUG
                    $rootScope.log($scope.detailTemplateUrl, -1000, 'UI-DETAIL-DIRECTIVE-TEMPLATE');

                    // SET DETAIL TEMPLATE
                    if ($rootScope.screenState && objDetailCard && $scope.detailData) {

                        // TEMPLATE LOGIC
                        $scope.uiDetailTemplateUrl = 'templates/' + objDetailCard.templates.detail + '.html';

                    }

                });

                return defer.promise;
            };
        },
        template: '<div ng-include="uiDetailTemplateUrl"></div>'
    }
})
.directive("splitBy", function($rootScope) {

    var setDimensions = function (element, reference, columns, setRatio) {
        // DETERMINE DIVISOR
        columns = columns || null;

        // DETERMINE WIDTH TO DIVIDE BY (SCREEN OR PARENT ELEMENT WIDTH)
        var parentWidth = $rootScope.screenState.width;
        if (reference === 'parent') {
            parentWidth = $(element).parent().innerWidth();
        }

        // DETERMINE IF WE NEED TO SET EXPLICIT WIDTH
        if (columns) {
            // DETERMINE NEW WIDTH
            var newWidth = Math.floor((parentWidth - columns) / columns);
        }

        // APPLY NEW WIDTH
        $(element).width(newWidth);

        // SET RATIO (HEIGHT)?
        if (setRatio) {

            var aryArgs = setRatio.split(':');

            if (aryArgs.length == 2) {

                var rW = aryArgs[0];
                var rH = aryArgs[1];

                // DETERMINE NEW RATION SPECIFIC HEIGHT
                var newHeight = Math.floor((newWidth / rW) * rH);


                // APPLY NEW HEIGHT
                $(element).height(newHeight);
            }
        }
    };

    return {
        // ISOLATE SCOPE (RESTRIECT TO CARD DATA OBJECT AND TEMPLATE ATTR)
        restrict: 'A',
        scope : {
            splitBy : '@',
            reference : '@', // 'parent' or 'screen',
            setRatio : '@' // '16:9' or 'false' (default)
        },
        link: function(scope, element, attrs) {
            attrs.reference = attrs.reference || 'screen';
            attrs.setRatio = attrs.setRatio || '';
            setDimensions(element, attrs.reference, attrs.splitBy, attrs.setRatio);
        }
    };
})
.directive('orientation', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('load', function(e) {
                if (this.naturalHeight > this.naturalWidth) {
                    this.className = 'portrait';
                }
            });
        }
    };
})
.directive('errSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });

            attrs.$observe('ngSrc', function(value) {
                if (!value && attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    };
})
.directive('managecontent', function($timeout) {
    return {
        link: function(scope, element, attrs) {
            $timeout(function() {
                $('.contentarea').find('table').each(function() {
                    $(this).replaceWith('<img src="http://www.ikea.com/PIAimages/0106117_PE253936_S5.JPG">');
                });
                $('.contentarea').find('a[href^=#]').each(function() {
                    $(this).replaceWith('<span>' + $(this).text() + '</span>');
                });
            });
        }
    };
})

