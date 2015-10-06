!function(){"use strict";function a(a,b){return a.module("angularMoment",[]).constant("angularMomentConfig",{preprocess:null,timezone:""}).constant("moment",b).constant("amTimeAgoConfig",{withoutSuffix:!1}).directive("amTimeAgo",["$window","moment","amMoment","amTimeAgoConfig","angularMomentConfig",function(b,c,d,e,f){return function(g,h,i){function j(){o&&(b.clearTimeout(o),o=null)}function k(a){h.text(a.fromNow(p));var d=c().diff(a,"minute"),e=3600;1>d?e=1:60>d?e=30:180>d&&(e=300),o=b.setTimeout(function(){k(a)},1e3*e)}function l(){j(),m&&k(d.preprocessDate(m,q,n))}var m,n,o=null,p=e.withoutSuffix,q=f.preprocess;g.$watch(i.amTimeAgo,function(a){return"undefined"==typeof a||null===a||""===a?(j(),void(m&&(h.text(""),m=null))):(m=a,void l())}),a.isDefined(i.amWithoutSuffix)&&g.$watch(i.amWithoutSuffix,function(a){"boolean"==typeof a?(p=a,l()):p=e.withoutSuffix}),i.$observe("amFormat",function(a){n=a,l()}),i.$observe("amPreprocess",function(a){q=a,l()}),g.$on("$destroy",function(){j()}),g.$on("amMoment:languageChange",function(){l()})}}]).service("amMoment",["moment","$rootScope","$log","angularMomentConfig",function(b,c,d,e){this.preprocessors={utc:b.utc,unix:b.unix},this.changeLanguage=function(d){var e=b.lang(d);return a.isDefined(d)&&c.$broadcast("amMoment:languageChange"),e},this.preprocessDate=function(a,c,e){return this.preprocessors[c]?this.preprocessors[c](a,e):(c&&d.warn("angular-moment: Ignoring unsupported value for preprocess: "+c),!isNaN(parseFloat(a))&&isFinite(a)?b(parseInt(a,10)):b(a,e))},this.applyTimezone=function(a){var b=e.timezone;return a&&b&&(a.tz?a=a.tz(b):d.warn("angular-moment: timezone specified but moment.tz() is undefined. Did you forget to include moment-timezone.js?")),a}}]).filter("amCalendar",["moment","amMoment",function(a,b){return function(c,d){if("undefined"==typeof c||null===c)return"";c=b.preprocessDate(c,d);var e=a(c);return e.isValid()?b.applyTimezone(e).calendar():""}}]).filter("amDateFormat",["moment","amMoment",function(a,b){return function(c,d,e){if("undefined"==typeof c||null===c)return"";c=b.preprocessDate(c,e);var f=a(c);return f.isValid()?b.applyTimezone(f).format(d):""}}]).filter("amDurationFormat",["moment",function(a){return function(b,c,d){return"undefined"==typeof b||null===b?"":a.duration(b,c).humanize(d)}}])}"function"==typeof define&&define.amd?define("angular-moment",["angular","moment"],a):a(angular,window.moment)}();