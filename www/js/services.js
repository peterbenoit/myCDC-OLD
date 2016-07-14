/**
 *
 */
angular.module('mycdc.services', ['ionic'])

.factory('AppUtil', ['$window', '$http', 'Globals', function($window, $http, Globals) {

    var objAppHelpers, objSettings, isExpired;

    objSettings = {
        logLevel: -999,
        storePrefix: 'myCDC',
        dateFormat: 'YYYY-MM-DD-HH-mm-ss',
        dataTimeoutInMinutes: 60,
        apiDefaults: {
            method: 'GET',
            timeout: 30000
        }
    };

    isExpired = function(ageStoreKey) {

        // EXIT IF AGE STORE DOES NOT EXIST
        if (!window.localStorage.hasOwnProperty(ageStoreKey)) {
            alert('isExpired');
            AppUtil.log(ageStoreKey + ' does not exist, returning expired', 0);
            return true;
        }

        // STORE EXISTS, CONTINUE
        var then, now, diff;

        // Find the duration between two dates
        now = moment();
        then = moment(window.localStorage[ageStoreKey], objSettings.dateFormat);
        diff = moment.duration(now - then).asMinutes();

        objAppHelpers.log(ageStoreKey + ' indicates corresponing data is ' + Math.floor(diff) + ' minutes old', -9999);

        // RETURN EXPIRED FLAG
        return diff >= objSettings.dataTimeoutInMinutes;
    };

    objAppHelpers = {
        updateConfig: {
            logLevel: function(logLevel) {
                objSettings.logLevel = (isNaN(logLevel)) ? 100 : logLevel;
            },
            storePrefix: function(storePrefix) {
                if (!!storePrefix) {
                    objSettings.storePrefix = storePrefix;
                }
            }
        },
        log: function(anyVar, intLevel, anyLabel) {
            intLevel = intLevel || 0;
            if (objSettings.logLevel >= intLevel) {
                if (anyLabel) {
                    $window.console.log('*** ' + anyLabel + ' ***');
                }
                $window.console.log(anyVar);
                if (anyLabel) {
                    $window.console.log('*** /' + anyLabel + ' ***');
                }
            }
        },
        normalizeContentGroup: function(contentgroup) {
            return contentgroup.toLowerCase().replace(/ /g, '').replace(/\//g, '').replace(/\d/g, '');
        },
        getSimpleLocalStore: function(storeKey) {

            var storeName = objSettings.storePrefix + '_' + storeKey;

            return {
                get: function() {

                    // TRY TO GET SAVED DATA
                    var jsonData = window.localStorage[storeName];

                    // RETURN IT IF FOUND
                    if (jsonData) {
                        return angular.fromJson(jsonData);
                    }

                    // DEFAULT RETURN
                    return false;
                },
                set: function(appdata) {
                    window.localStorage[storeName] = angular.toJson(appdata);
                },
                clear: function() {
                    window.localStorage.removeItem(storeName);
                }
            };
        },
        getLocalStoreByAppState: function(strType, appState) {

            strType = strType || 'sourceIndex'; // Supports sourceIndex, sourceDetail
            appState = appState || Globals.get('appState') || false;

            var storeName, storeAgingName, dataDefault;

            if (strType == 'sourceDetail') {
                storeName = objSettings.storePrefix + '_' + appState.sourceName + '_' + appState.sourceDetail;
                dataDefault = '';
            } else {
                storeName = objSettings.storePrefix + '_' + appState.sourceName;
                dataDefault = [];
            }
            storeAgingName = storeName + '_saved';

            return {
                all: function() {

                    // TRY TO GET SAVED DATA
                    var jsonData = window.localStorage[storeName];

                    // RETURN IT IF FOUND
                    if (jsonData) {
                        var objReturn = {
                            name: storeName,
                            expired: isExpired(storeAgingName),
                            data: angular.fromJson(jsonData)
                        };

                        objAppHelpers.log(objReturn, 0, storeName + ' data');

                        return objReturn;
                    }

                    // DEFAULT RETURN
                    return {
                        name: storeName,
                        expired: true,
                        data: dataDefault
                    };
                },
                save: function(appdata) {
                    window.localStorage[storeAgingName] = moment().format(objSettings.dateFormat);
                    window.localStorage[storeName] = angular.toJson(appdata);
                },
                clear: function() {
                    window.localStorage.removeItem(storeAgingName);
                    window.localStorage.removeItem(storeName);
                }
            };
        },
        remoteApi: function(options) {
            options.method = options.method || objSettings.apiDefaults.method;
            options.timeout = options.timeout || objSettings.apiDefaults.timeout;
            return $http(options);
        }
    };

    return objAppHelpers;
}])

.factory('Globals', ['$rootScope', function($rootScope) {

    var strGlobalNameSpace = 'runtime';

    if (!$rootScope[strGlobalNameSpace]) {
        $rootScope[strGlobalNameSpace] = {};
    }

    return {
        get: function(key) {
            if (key) {
                if ($rootScope[strGlobalNameSpace].hasOwnProperty(key)) {
                    return $rootScope[strGlobalNameSpace][key];
                }
            } else {
                return $rootScope[strGlobalNameSpace];
            }
            return null;
        },
        set: function(key, value) {
            $rootScope[strGlobalNameSpace][key] = angular.copy(value);
            return true;
        }
    };
}])

.factory('DataSourceInterface', ['$filter', '$q', 'AppUtil', 'Globals', function($filter, $q, AppUtil, Globals) {

    var processors = {
        cardTemplateInjector: function(d, objSourceMeta) {
            var idx1 = d.length,
                idx2, obj1, obj2, strCg, strCgStripped;
            var tmp = [];
            // POINTER TO ROOTSCOPE APP OBJECT (WITH SOURCE LIST, META, BLAH BLAH)
            var app = Globals.get('applicationData');
            AppUtil.log(d, 1, 'CURRENT SOURCE PRE FIX');
            AppUtil.log(objSourceMeta, 1, 'CURRENT SOURCE METADATA');

            while (idx1--) {
                obj1 = d[idx1];

                // PARSE & NORMALIZE TIME(S)
                if (obj1.datePublished) {
                    var time = moment(obj1.datePublished);
                    obj1.datePublished = time.format('MMMM Do, YYYY');
                }

                // PROCESS ENCLOSURES
                obj1.hasImage = false;
                if (obj1.enclosures && obj1.enclosures.length) {
                    idx2 = obj1.enclosures.length;
                    while (idx2--) {
                        obj2 = obj1.enclosures[idx2];
                        if (obj2.contentType.indexOf('image') > -1) {
                            obj1.hasImage = true;
                            obj1.imageSrc = obj2.resourceUrl;
                            //console.log('obj1.imageSrc');
                            //console.log(obj1.imageSrc);
                        }
                    }
                }

                // PROCESS TAGS
                if (obj1.tags && obj1.tags.length) {
                    idx2 = obj1.tags.length;
                    while (idx2--) {
                        obj2 = obj1.tags[idx2];
                        // PROCESS CONTENT GROUPS
                        if (obj2.type.toLowerCase() == 'contentgroup') {
                            strCg = obj2.name;
                            strCgStripped = AppUtil.normalizeContentGroup(strCg);

                            // UPDATE BASED ON TAG DATA
                            obj1.feedIdentifier = strCgStripped;
                            obj1.feedIdentifier = strCgStripped;
                            obj1.templates = app.templateMap[obj1.feedIdentifier];
                            obj1.detailType = objSourceMeta.detailType;
                            obj1.contentType = objSourceMeta.contentType;
                            obj1.home = '#/app/source/' + obj1.feedIdentifier;
                            obj1.url = obj1.home + '/';

                            // SET STREAM TITLE
                            if (app.sourceMetaMap.hasOwnProperty(obj1.feedIdentifier)) {
                                obj1.streamTitle = app.sourceMetaMap[obj1.feedIdentifier].title;
                                obj1.detailType = app.sourceMetaMap[obj1.feedIdentifier].detailType;
                                obj1.typeIdentifier = app.sourceMetaMap[obj1.feedIdentifier].typeIdentifier;
                            }

                            // TODO: consider using config.json for this data
                            if (obj1.feedIdentifier === 'eid') {
                                obj1.hasImage = false;
                            }

                            if (obj1.feedIdentifier === 'vitalsigns') {
                                obj1.hasImage = false;
                            }

                            if (obj1.feedIdentifier === 'outbreaks') {
                                obj1.isOutbreak = true;
                                obj1.hasImage = false;
                            }

                            if (obj1.feedIdentifier === 'travelnotices') {
                                obj1.isAlert = obj1.name.indexOf('Alert') > -1;
                                obj1.isWatch = obj1.name.indexOf('Watch') > -1;
                                obj1.isWarning = obj1.name.indexOf('Warning') > -1;
                            }
                        }
                        // PROCESS NAMES
                        if (obj2.type.toLowerCase() == 'topic') {
                            obj1.topic = obj2.name;
                        }
                    }
                }

                // SAFETY DEFAULTS (SHOULD BE TEMPORARY UNTIL ALL FEEDS ARE STABILIZED)
                obj1.contentgroup = obj1.contentgroup || 'homestream';
                obj1.feedIdentifier = obj1.feedIdentifier || objSourceMeta.feedIdentifier;
                obj1.typeIdentifier = obj1.typeIdentifier || objSourceMeta.typeIdentifier;
                obj1.contentType = obj1.contentType || objSourceMeta.contentType;
                obj1.streamTitle = obj1.streamTitle || objSourceMeta.title;
                obj1.detailType = obj1.detailType || objSourceMeta.detailType;
                obj1.templates = obj1.templates || angular.extend({}, app.templateMap[obj1.feedIdentifier]);
                obj1.home = obj1.home || '#/app/source/' + obj1.feedIdentifier;
                obj1.url = obj1.url || obj1.home + '/';
                obj1.showSourceLink = true; //TODO - MAY BE POSSIBLE AFTER UPDATED FEED DATA - NEED A WAY TO GET ACCURATE CONTENT GROUP FOR CARDS (FROM ENCLOSURES MAYBE?)

                // IF NO TEMPLATES CAN BE FOUND, THE CONTENT GROUP IS INVALID, FLAG FOR DELETE
                obj1.delete = !obj1.templates;
                if (obj1.delete) {
                    AppUtil.log(obj1, -1, 'UNABLE TO FIND CONTENT GROUP FOR THIS ARTICLE');
                }
            }

            // DELETE BAD EGGS (MORE ACCURATELY, KEEP GOOD EGGS)
            AppUtil.log(d);
            AppUtil.log('I was able to filter ' + d.length);
            d = $filter('filter')(d, {
                delete: false
            });
            AppUtil.log('down to' + d.length);

            // APPLY SOURCE FILTERS
            d = $filter('applySourceFilters')(d, app.sourceFilters);

            // LIMIT FINAL RESULTS TO 100
            if (d.length > 100) {
                AppUtil.log('Trimming array from ' + d.length + ' to 100', -100);
                d.splice(100);
            }

            AppUtil.log(d, -1, 'CURRENT SOURCE POST FIX');

            return d;
        },
        feedNormalizer: function(d) {
            return d;
        },
        processTags: function(d) {
            // var currItem, data = d;

            // if (data.length) {
            //     for (var i = data.length - 1; i >= 0; i--) {
            //         currItem = data[i];

            //         // remove html from name
            //         currItem.name = $sce.trustAsHtml(currItem.name);
            //     }

            //     return data;
            // }

            // return [];
            //
            return d;
        },
        parseEncoding: function(d) {
            var currItem, data = d;

            if (data.length) {
                for (var i = data.length - 1; i >= 0; i--) {
                    currItem = data[i];
                    if (currItem.description) {
                        // remove encoding from description
                        var txt = document.createElement('textarea');
                        txt.innerHTML = currItem.description;
                        currItem.description = txt.value;
                    }
                }

                return data;
            }

            return [];
        },
        stripHtml: function(d) {
            var currItem, data = d;

            if (data.length) {
                for (var i = data.length - 1; i >= 0; i--) {
                    currItem = data[i];

                    // TODO: need to talk with Sarah about this, Scientific names will need to be italic in a card name/title

                    // remove html from name
                    currItem.name = currItem.name.replace(/<[^>]+>/gm, '');

                    // remove html from description
                    currItem.description = currItem.description.replace(/<[^>]+>/gm, '');
                }

                return data;
            }

            return [];
        },
        extractVideoComments: function(d) {
            var currItem, data = d;

            if (data.length) {
                for (var i = data.length - 1; i >= 0; i--) {
                    currItem = data[i];
                    if (currItem.description) {
                        currItem.description = currItem.description.split('Comments on this video')[0].trim();
                    }
                }

                return data;
            }

            return [];
        },
        flagOutbreak: function(d) {
            var currItem, data = d;

            if (data.length) {
                for (var i = data.length - 1; i >= 0; i--) {
                    currItem = data[i];
                    currItem.isOutbreak = true;
                }

                return data;
            }

            return [];
        },
        firstOnly: function(d) {
            var data = d;
            if (data.length) {
                return [data[0]];
            }

            return null;
        },
        defaultHandler: function() {
            return [];
        }
    };

    var objPublicMethods = {
        // SOURCE DATA HANDLERS (LIST CFG, SOURCE STREAMS, DETAIL HANDLERS, ETC)
        getSourceMeta: function(appState) {

            appState = appState || Globals.get('appState');

            if (appState) {

                var applicationData = Globals.get('applicationData');

                // PARAMS
                var arySourceInfo, strSourceName = appState.sourceName || "";

                // FILTER HERE
                arySourceInfo = $filter('filter')(applicationData.sourceList, {
                    feedIdentifier: strSourceName
                }) || [];

                console.log(appState, '$^%#^*$%#^*$%^');

                // DID WE FIND IT?
                if (arySourceInfo.length === 1) {

                    // RETURN IT
                    return arySourceInfo[0];
                }

            }

            // ELSE RETURN FALSE
            return false;
        },
        getSourceIndex: function(blnRefresh, appState) {

            blnRefresh = blnRefresh || false;

            appState = appState || Globals.get('appState');

            var defer, localStore, localData, objMetaData, data;

            defer = $q.defer();
            objMetaData = objPublicMethods.getSourceMeta(appState);
            localStore = AppUtil.getLocalStoreByAppState('sourceName', appState);
            localData = localStore.all();

            // CHECK IF WE NEED TO REFRESH OR NOT
            if (!blnRefresh && !localData.expired && false) {

                // LOCAL DATA IS GOOD
                // RESOLVE PROMISE WITH THE STORED DATA
                AppUtil.log('Using Local Stream Data for ' + localData.name + ' (Still Fresh)', -1);
                defer.resolve(localData.data);

            } else {

                // REMOTE DATA NEEDED

                // CAN WE FIND URL?
                if (objMetaData.url) {

                    AppUtil.remoteApi({
                        url: objMetaData.url
                    }).then(function(d) {

                        // NORMALIZE DATA BY SOURCE SPECS
                        var data = objPublicMethods.dataProcessor(d, objMetaData);

                        //SAVE IT TO LOCAL
                        localStore.save(data);

                        // RESOLVE WITH PROCESSED DATA
                        AppUtil.log('Using New Stream Data for ' + localData.name + ' (Refresh Requested)', -1);
                        defer.resolve(data);

                    }, function(e) {

                        // ON ERROR
                        if (localData.data && localData.data.length) {

                            // FALLBACK TO SAVED DATA
                            AppUtil.log('Using Local Stream Data for ' + localData.name + ' (Data Is Expired)', -1);
                            defer.resolve(localData.data);

                        } else {

                            // ALL FAILED RETURN WHAT WE HAVE IN LOCAL STORAGE
                            AppUtil.log('Could Not Find Any Data for ' + localData.name + '  (Local, Remote, or Default)', -1);
                            defer.reject();
                        }
                    });

                } else {

                    // LOCAL DATA IS OLD BUT URL UNAVAILABLE, RESOLVE PROMISE WITH THE STORED DATA
                    AppUtil.log('Using Local Stream Data for ' + localData.name + ' (URL NOT DEFINED)', -1);
                    defer.resolve(data);
                }
            }

            // SAVE RETURNED DATA (WHATEVER IT IS) AS THE SOURCE INDEX
            defer.promise.then(function(data) {

                // SAVE IT TO RS
                Globals.set('sourceMeta', objMetaData);
                Globals.set('sourceIndex', angular.copy(data));

            });

            return defer.promise;
        },

        getSourceCard : function(sourceDetailId) {

            var arySourceInfo = [];

            // GET OR DEFAULT SOURCE DETAIL ID
            sourceDetailId = sourceDetailId || Globals.get('appState').sourceDetail || "";

            var sourceIndex = Globals.get('sourceIndex');

            if (!sourceDetailId) {
                if (sourceIndex.length) {
                    arySourceInfo = [sourceIndex[0]];
                }
            } else {
                // FILTER HERE
                arySourceInfo = $filter('filter')(sourceIndex, {
                    id: sourceDetailId
                }) || [];
            }

            // DID WE FIND IT?
            if (arySourceInfo.length === 1) {

                // THIS FLAGS THE CURRENT CARD AS ACTIVE
                // DOING SO MAKES IT THE FIRST IN THE SCROLLER LIST
                arySourceInfo[0].isCurrent = 1;

                // RETURN IT
                return arySourceInfo[0];
            }

            // ELSE RETURN FALSE
            return false;
        },

        // INITIALLY / ORIGINALLY, ALL SOURCES HAS THEIR OWN CONTROLLER, AND HAD PROCESSORS WHICH
        // PROCESSED FEED DATA BASED ON WHAT THE SOURCE NEEDS WERE. THIS WAS HIGHLY DUPLICATIVE (90% +)
        // THIS IS A MEANS TO APPLY PROCESSORS TO DATA BASED ON THE CONFIGURATION OF THE SOURCE
        // THE SOURCE SPECIFIES WHICH PROCESSORS SHOULD BE USED FOR ITS DATA, AT RUNTIME,THE DATA
        // RETURNED FROM A SERVICE CALL IS PASSED TO THIS METHOD ALONG WITH THE SOURCE CONFIG... AND VIOLA! (YOU HAVE A LARGER VIOLIN)

        dataProcessor: function(objSourceData, objMetaData) {

            // LOCALS
            var processor, data;

            // GET OR DEFAULT DATA
            data = (objSourceData.data && objSourceData.data.results) ? objSourceData.data.results : [];

            // DID WE GET DATA?
            if (data.length > 0) {

                // PROCESS DATA (IF NEEDED)
                if (objMetaData.processors && objMetaData.processors.length) {

                    // REVERSE ARRA SINCE FOR REVERSE LOOP
                    objMetaData.processors.reverse();

                    // REVERSE LOOP THROUGH PROCESSORS
                    for (var i = objMetaData.processors.length - 1; i >= 0; i--) {
                        processor = objMetaData.processors[i];
                        data = processors[processor].call(this, data, objMetaData);
                    }
                }
            }

            // RETURN PROCESSED DATA
            return data;
        }
    };

    return objPublicMethods;
}])

.factory('Device', ['$rootScope', '$q', '$timeout', '$window', 'Globals', function ($rootScope, $q, $timeout, $window, Globals) {

    var factoryMethods = {
        // Get Device Info
        Info : function () {

            var ua = $window.navigator.userAgent;
            //Mozilla/5.0 (Linux; Android 4.4.2; SM-T310 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Safari/537.36
            //Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LVY48H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36

            if (ua.indexOf('Android') > -1 && ua.indexOf('Mobile') === -1) {
                ionic.Platform.setPlatform('androidtablet');
            }

            return {
                'deviceInformation': ionic.Platform.device(),
                'isWebView': ionic.Platform.isWebView(),
                'isIPad': ionic.Platform.isIPad(),
                'isIOS': ionic.Platform.isIOS(),
                'isAndroid': ionic.Platform.isAndroid(),
                'isAndroidTablet': ionic.Platform.platform() === 'androidtablet', //ionic.Platform.is('androidtablet')
                'isWindowsPhone': ionic.Platform.isWindowsPhone(),
                'currentPlatform': ionic.Platform.platform(),
                'currentPlatformVersion': ionic.Platform.version()
            };
        },

        // Get Screen State
        ScreenState : function() {

            console.log('refreshScreenState');

            $rootScope.$broadcast('screen-state-update-started');

            // DEFAULT RETURN TO SCREEN SIZE
            var objReturn = factoryMethods.ScreenSize();

            // GET SCREEN SIZE
            if ($window.innerWidth >= 1024 && $window.innerWidth > $window.innerHeight) {
                objReturn.viewType = 'tablet';
                objReturn.viewOrientation = 'landscape';
            } else if ($window.innerWidth >= 768 && $window.innerWidth < $window.innerHeight) {
                objReturn.viewType = 'tablet';
                objReturn.viewOrientation = 'portrait';
            } else {
                objReturn.viewType = 'phone';
                objReturn.viewOrientation = 'portrait';
            }

            // UPDATE SCOPE
            //$rootScope.screenState = objReturn;

            // THIS NEEDS TO BE LOCALIZED --
            //$rootScope.sourceMeta = sourceMeta;

            // WAIT FOR ANY DIGEST TO COMPLETE BEFORE APPLYING
            $timeout(function() {
                $rootScope.$broadcast('screen-state-update-complete');
            }, 0);

            //Globals.set('screenState', objReturn);

            return objReturn;
        },

        // DEVICE ORIENTATION
        Orientation : function() {
            var  mq, orientation;

            if ($window.matchMedia) {
                mq = $window.matchMedia('(orientation: portrait)');

                orientation = (mq.matches ? 'portrait' : 'landscape');
            }

            // ELSE orientation WILL BE UNDEFINED (WHICH IS EXPECTED)

            // SAVE TO GLOBALS
            //Globals.set('orientation', orientation);

            // RETURN VALUE
            return orientation;
        },

        // SCREEN SIZE
        ScreenSize : function() {
            return {
                'width': $window.innerWidth,
                'height': $window.innerHeight
            };
        }
    };

    return factoryMethods;
}])

// .factory('DeviceInfo', function() {


//     var ua = navigator.userAgent;
//     //Mozilla/5.0 (Linux; Android 4.4.2; SM-T310 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Safari/537.36
//     //Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LVY48H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36

//     if (ua.indexOf('Android') > -1 && ua.indexOf('Mobile') === -1) {
//         ionic.Platform.setPlatform('androidtablet');
//     }

//     return {
//         'deviceInformation': ionic.Platform.device(),
//         'isWebView': ionic.Platform.isWebView(),
//         'isIPad': ionic.Platform.isIPad(),
//         'isIOS': ionic.Platform.isIOS(),
//         'isAndroid': ionic.Platform.isAndroid(),
//         'isAndroidTablet': ionic.Platform.platform() === 'androidtablet', //ionic.Platform.is('androidtablet')
//         'isWindowsPhone': ionic.Platform.isWindowsPhone(),
//         'currentPlatform': ionic.Platform.platform(),
//         'currentPlatformVersion': ionic.Platform.version()
//     };
// })

// .factory('ScreenState', ['$rootScope', '$q', '$window', 'Globals', function ($rootScope, $q, $window, Globals) {

//     return function(callback) {

//         console.log('refreshScreenState');

//         $rootScope.$broadcast('screen-state-update-started');

//         var defer = $q.defer(),
//             objReturn = {
//                 width: $window.innerWidth,
//                 height: $window.innerHeight
//             };

//         // GET SCREEN SIZE
//         if ($window.innerWidth >= 1024 && $window.innerWidth > $window.innerHeight) {
//             objReturn.viewType = 'tablet';
//             objReturn.viewOrientation = 'landscape';
//         } else if ($window.innerWidth >= 768 && $window.innerWidth < $window.innerHeight) {
//             objReturn.viewType = 'tablet';
//             objReturn.viewOrientation = 'portrait';
//         } else {
//             objReturn.viewType = 'phone';
//             objReturn.viewOrientation = 'portrait';
//         }

//         // UPDATE SCOPE
//         //$rootScope.screenState = objReturn;

//         // THIS NEEDS TO BE LOCALIZED --
//         //$rootScope.sourceMeta = sourceMeta;

//         // WAIT FOR ANY DIGEST TO COMPLETE BEFORE APPLYING
//         $timeout(function() {

//             $rootScope.$broadcast('screen-state-update-complete');

//             defer.resolve(objReturn);

//         }, 0);

//         return defer.promise;
//     };
// }])

// .factory('Orientation', function() {
//     var mq,
//         retval = 'landscape';

//     if (window.matchMedia) {
//         mq = window.matchMedia('(orientation: portrait)');

//         return mq.matches ? 'portrait' : 'landscape';
//     }

//     return undefined;
// })

// .factory('ScreenSize', function() {
//     return {
//         'width': window.innerWidth,
//         'height': window.innerHeight
//     };
// })

.factory('FindAllURLsInText', function() {
    return function(text) {
        if (!text) return undefined;

        var source = (text || '').toString(),
            urlArray = [],
            matchArray,
            regexToken;

        // Regular expression to find FTP, HTTP(S) and email URLs.
        regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

        // Iterate through any URLs in the text.
        while ((matchArray = regexToken.exec(source)) !== null) {
            var token = matchArray[0];
            urlArray.push(token);
        }

        return urlArray;
    }
})

.factory('iFrameReady', ['$rootScope', function($rootScope) {

    //alert('iFrameReady Returned');

    return function() {

        var iframe = $('#contentframe');
        anchors = iframe.contents().find('#contentArea a'); // only anchors in the content area

        //iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument

        $rootScope.$broadcast('source-detail-load-complete');

        alert('iFrameReady Called');

        // I RECENTLY COMMENTED THIS OUT AS IT WAS BREAKING THE APP (NOT JUST IFRAME CONTENT)
        if (window.device) {
            body = iframe.contents().find('body');
            $(body).unbind("scroll");
            //$(body).unbind("click");
        }

        /*if (body.length) {
        body.append('<style>header, footer, #socialMediaShareContainer { display:none !important; }</style>')
        }*/

        // Capture any anchors clicked in the iframe document
        anchors.on('click', function(e) {
            e.preventDefault();

            alert('CLICK');

            var framesrc = iframe.attr('src'),
                href = $(this).attr('href'),
                anchor = document.createElement('a'),
                anchorhost,
                frameanchor,
                framehost,
                frameprotocol;

            anchor.href = href;
            anchorhost = anchor.hostname;
            // create an anchor with the href set to the iframe src to fetch the domain & protocol
            // WARN: cannot assume "http" || "www.cdc.gov"
            frameanchor = document.createElement('a');
            frameanchor.href = framesrc;
            framehost = frameanchor.hostname
            frameprotocol = frameanchor.protocol;

            // if this anchor doesn't have a hostname
            if (anchorhost === '') {
                href = frameprotocol + '//' + framehost + href;
            }

            window.open(href, '_system');
        });
    };
}])

.service('returnToState', function($ionicHistory) {
    return function(stateName) {
        var historyId = $ionicHistory.currentHistoryId(),
            history = $ionicHistory.viewHistory().histories[historyId];

        for (var i = history.stack.length - 1; i >= 0; i--) {
            if (history.stack[i].stateName == stateName) {
                $ionicHistory.backView(history.stack[i]);
                $ionicHistory.goBack();
            }
        }
    }
});