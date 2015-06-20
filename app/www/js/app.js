// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.factory('JSON', function ($http) {
    var PATH='json/';
    return function (fileName, callback) {
        $http.get(PATH+fileName)
            .then(function (res) {
                if(callback){
                   callback(res.data);
                }
            });
    }
})
.factory('REMEMBER',function($localstorage){
    function isInitialised(category,unitId){
        if (!$localstorage.get(category)) {
            return false;
        } else{
            var obj=$localstorage.getObject(category);
            if(!obj[unitId]){
                 return false;
            }
            else{
                return true;
            }
        }
    }
    function initialise(category,unitId) {
        if ($localstorage.get(category)) {
            var obj=$localstorage.getObject(category);
        }else{
            var obj = {}
        }
        obj[unitId] = {
            records: {},
            meta: {
                maxlevel: 0,
                minlevel: 0
            }
        };
        console.log('initialise '+category);
        $localstorage.setObject(category,obj);
    }
    function addToRecord(obj,unitId,index) {
        var level=Number();
        if(!obj.records){
            obj.records={};
        }
        if(!obj[unitId].records){
            obj[unitId].records={}
        }
        if(! obj[unitId].records[index]){
            level = 1;
        }else{
            level=obj[unitId].records[index]+1;
        }
        obj[unitId].records[index]=level;
        if(!obj[unitId].meta){
            obj[unitId].meta={};
        }
        if(obj[unitId].meta.maxlevel!==null || level> obj[unitId].meta.maxlevel){
            obj[unitId].meta.maxlevel=level;
        }
        return obj;
    }
    function tableShift(obj,unitId,total){
        //console.log('table shift');
        //console.log(obj)
        //console.log(unitId)
        var newObj={};
        newObj['0']=[];
        for(i=0;i<total;i++){
            if(!obj[unitId].records[i]){
                newObj['0'].push(i);
            }
        }
        if(obj[unitId].meta && obj[unitId].meta.maxlevel!==null){   
            for(i=1;i<=obj[unitId].meta.maxlevel;i++){
                newObj[i]=[];
                Object.keys(obj[unitId].records).forEach(function(key) {
                    //console.log(key, obj[unitId].records[key]);
                    if(obj[unitId].records[key]==i){
                        newObj[i].push(key);
                    }
                });
            }  
        }
        console.log(newObj);
        return newObj;
    }
    function pickOneFromShifted(category, level, unitId, total) {
        //category: 'FORGOT' || 'REMEMBER'
        console.log('pick one from ' + category);
        if (!isInitialised(category,unitId)) {
            initialise(category,unitId) ;
        } 
        var obj=$localstorage.getObject(category);
        //console.log(obj);
        //            if(category=='FORGOT'){
        //                level=obj[unitId].meta.level-level;
        //            }
        if (obj[unitId].meta.minlevel!==null && level >= obj[unitId].meta.minlevel) {
            var newObj = tableShift(obj, unitId, total);
            if (newObj && newObj[level] && newObj[level].length > 0) {
                var max = newObj[level].length - 1;
                var result = newObj[level][random(max)];
                console.log(result);
                return result;
            } else {
                console.log('Level up: nothing left at this level')
                obj[unitId].meta.minlevel = level + 1;
                $localstorage.setObject(category,obj);
                return null;
            }
        }else{
           return null;
        }
        
    }
    function random(max, min) {
         //generate a random number , default to 0 ~ max
         if (!min) {
             min = 0
         };
         return Math.floor(Math.random() * (max + 1) + min);
     }
    return{
        remember:function(unitId,index){
            if (!isInitialised('REMEMBER',unitId)) {
                initialise('REMEMBER',unitId) ;
            } 
            var obj=$localstorage.getObject('REMEMBER');
            $localstorage.setObject('REMEMBER',addToRecord(obj,unitId,index))
            
        },
        forgot:function(unitId,index){
            if (!isInitialised('FORGOT',unitId)) {
                initialise('FORGOT',unitId) ;
            } 
            var obj=$localstorage.getObject('FORGOT');
            $localstorage.setObject('FORGOT',addToRecord(obj,unitId,index))
            
        },
        pick:function(unitId,total){
            var level=0;
            var result=null;
            while (result==null){
                result= pickOneFromShifted('REMEMBER',level,unitId,total);
                if(result!==null){
                    return result;
                }
                level++;
            }
        },
        howManyTimesForgot:function(unitId,index){
            if (!isInitialised('FORGOT',unitId)) {
                initialise('FORGOT',unitId) ;
            } 
            var obj=$localstorage.getObject('FORGOT');
            var forgotTimes=obj[unitId].records[index];
            if(forgotTimes!==null){
                return forgotTimes;
            }
        },
        currentLevel:function(unitId){
           if (!isInitialised('FORGOT',unitId)) {
                initialise('FORGOT',unitId) ;
            }
            var obj=$localstorage.getObject('REMEMBER');
            var level=obj[unitId].meta.minlevel;
            if(level!==null){
                return level;
            }
        }
    }
})
.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key) {
      return $window.localStorage[key] || null;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: "/search",
    views: {
      'menuContent': {
        templateUrl: "templates/search.html"
      }
    }
  })

  .state('app.browse', {
    url: "/browse",
    views: {
      'menuContent': {
        templateUrl: "templates/browse.html"
      }
    }
  })
    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent': {
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })

  .state('app.single', {
    url: "/playlists/:playlistId",
    views: {
      'menuContent': {
        templateUrl: "templates/playlist.html",
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
});
