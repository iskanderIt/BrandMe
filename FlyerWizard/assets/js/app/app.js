var app = angular.module('FlyerWizard', ['ngAuth', 'ui.router', 'ngDragDrop', 'ngDialog', 'angularFileUpload']);

app.factory('DataScope', ['$http', function ($http) {
    var instance = {};

    /* PROPERTIES */

    var _iTypes = [
            { name: 'Default', width: '640', height: '480' },
            { name: 'Screen SD 720p', width: '1280', height: '720' },
            { name: 'Screen HD 1080p', width: '1920', height: '1080' },
            { name: 'Facebook Cover', width: '851', height: '315' },
            { name: 'Facebook Post', width: '484', height: '252' },
            { name: 'Facebook Timeline', width: '504', height: '504' },
            { name: 'Twitter Cover', width: '520', height: '260' },
            { name: 'Instagram Photo', width: '640', height: '640' }
    ];

    var _cArtwork = {
        id: null,
        name: 'Crazy Cow',
        type: _iTypes[0],
        author: 'scippopippo@hotmail.it',
        timestamp: '',
        layers: []
    }

    var _cBrand = {
        id: null,
        name: "No Name",
        logoSrc: "http://www.placehold.it/150x150",
        description: "Tell me something about the brand"
    }

    var _cLayer = {
        name: "",
        type: "",
        text: "",
        font_family: "",
        font_size: "",
        isVisible: true,
        x: 0,
        y: 0,
        z: 0,
        width: 0,
        height: 0
    }

    instance.installedTypes = _iTypes;
    instance.currentArtwork = _cArtwork;
    instance.currentBrand = _cBrand;
    instance.currentLayer = { properties: _cLayer };

    /* SETTER & GETTER */

    instance.getIstalledTypes = function () {
        return instance.installedTypes;
    }

    /* ARTWORKS */
    instance.getArtwork = function (id) {
        var $data = angular.toJson({ action: "artwork.detail", id: id });

        return $http.post('server/data.php', $data)
            .then(
            function (res) { return res.data.artwork; },
            function () { }
            );
    };

    instance.getArtworks = function (id) {
        var $data = angular.toJson({ action: "artwork.list", pid: id });

        return $http.post('server/data.php', $data)
            .then(
            function (res) { return res.data.artworks; },
            function () { }
            );
    };

    instance.saveArtwork = function () {
        var persist =
            {
                action: "artwork.save",
                pid: instance.currentBrand.id,
                id: instance.currentArtwork.id,
                payload: instance.currentArtwork
            };
        var $data = angular.toJson(persist);
        return $http.post('server/data.php', $data)
            .then(
            function (res) { return res.data.artwork; },
            function () { }
            );
    };

    instance.deleteArtwork = function (id) {

        var $data = angular.toJson({ action: 'artwork.delete', payload: {id:id} });
        return $http.post('server/data.php', $data)
            .then(
            function (res) { return res.data.artwork; },
            function () { }
            );
    };

    instance.setCurrentArtwork = function (obj) {
        instance.currentArtwork = obj;
    }

    instance.getCurrentArtwork = function () {
        return instance.currentArtwork;
    }

    instance.resetArtwork = function () {
        instance.currentArtwork = _cArtwork;
        instance.currentLayer = { properties: _cLayer };
    }

    /* BRANDS */
    instance.getBrands = function () {
        var $data = angular.toJson({ action: "brand.list" });
        return $http.post('server/data.php', $data)
        .then(
            function (res) { return res.data.brands; },
            function () { }
            );
    }

    instance.getBrand = function (id) {
        var $data = angular.toJson({ action: "brand.detail", id: id });
        return $http.post('server/data.php', $data)
            .then(function (res) { return res.data.brand; });
    }

    instance.setCurrentBrand = function (obj) {
        if (obj.id == "") {
            instance.currentBrand = _cBrand;
            return;
        }

        instance.currentBrand = obj;
    }

    instance.getCurrentBrand = function () {
        return instance.currentBrand;
    }

    instance.saveBrand = function () {
        var $data = angular.toJson({ action: "brand.save", payload: instance.currentBrand });
        return $http.post('server/data.php', $data)
            .then(function (res) { return res.data.brand; });
    }

    instance.deleteBrand = function () {
        var $data = angular.toJson({ action: "brand.delete", payload: instance.currentBrand });
        return $http.post('server/data.php', $data);
    }

    /* LAYERS */
    instance.setCurrentLayer = function (obj) {
        instance.currentLayer.properties = obj;
    }

    instance.getCurrentLayer = function () {
        return instance.currentLayer;
    };

    return instance;
}]);

app.factory('AuthResolver', ['$q', '$rootScope','$state', function ($q, $rootScope, $state) {
    return {
        resolve: function () {
            var deferred = $q.defer();
            var unwatch = $rootScope.$watch('currentUser',
                function (currentUser) {
                    if (angular.isDefined(currentUser)) {
                        if (currentUser) {
                            deferred.resolve(currentUser);
                        } else {
                            deferred.reject();                            
                        }
                        unwatch();
                    }
                });
            return deferred.promise;
        }
    };
}]);

app.config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES',
    function ($stateProvider, $urlRouterProvider, USER_ROLES) {
    // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/");

    // Now set up the states
    $stateProvider
      .state('init', {
          url: "/",
          templateUrl: "views/home/index.html",
          controller: "HomeController",
          data: {
                guestAllowed : true
            }
      })
      .state('brand', {
          url: "/brand",
          templateUrl: "views/brand/list.html?29",
          controller: "BrandListController",
          resolve: {
              auth: function resolveAuthentication(AuthResolver) { 
                  return AuthResolver.resolve();
              }
          },
          data: {
              authorizedRoles: [USER_ROLES.designer]
          }
      })
          .state('brand.edit', {
              url: "/edit/:id",
              templateUrl: "views/brand/edit.html?29",
              controller: "BrandController"
          })
      .state('artwork', {
          url: '/artwork/:pid',
          templateUrl: 'views/artwork/list.html?19',
          controller: "ArtworkListController",
          data: {
              authorizedRoles: [USER_ROLES.designer, USER_ROLES.client]
          }
      })
            .state('artwork.edit', {
                url: '/edit/:id',
                templateUrl: 'views/artwork/edit.html?19',
                controller: "ArtworkController"
            })
      .state('user', {
          url: "/dashboard",
          templateUrl: "views/user/dashboard.html?09",
          controller: "DashboardController",
          resolve: {
              auth: function resolveAuthentication(AuthResolver) {
                  return AuthResolver.resolve();
              }
          },
          data: {
              authorizedRoles: [USER_ROLES.all]
          }
      })
          .state('user.billing', {
              url: "/billing",
              templateUrl: "views/user/billing.html?09",
              controller: "BillingController"
          })
          .state('user.profile', {
              url: '/profile',
              templateUrl: 'views/user/profile.html?09',
              controller: "ProfileController"
          })
          .state('user.setting', {
              url: "/setting",
              templateUrl: "views/user/setting.html?09",
              controller: "SettingController"
          })
}]);

/**
 * Init Controller
 */

app.controller("AppController",
    ['$rootScope', '$scope', '$http', '$stateParams', 'AuthService', 'USER_ROLES', 'AUTH_EVENTS',
        function ($rootScope, $scope, $http, $stateParams, $auth, USER_ROLES, AUTH_EVENTS) {
   
        $rootScope.currentUser = null;
        $rootScope.userRoles = USER_ROLES;
        $rootScope.isAuthorized = $auth.isAuthorized;

        $rootScope.setCurrentUser = function (user) {
        //console.log("setCurrent User:");
        //console.log(user);
        $rootScope.currentUser = user;
    };
        }]);

/**
 * Home controller
 */
app.controller('HomeController',
    ['$scope', '$http', 'DataScope',
        function ($scope, $http, DataScope) {

            console.log('home CONTROLLER');
        }]);


/**
 * AccessController
 */

app.controller("LoginController",
    ['$rootScope', '$scope','$location', '$http', '$state', '$stateParams', 'AUTH_EVENTS', 'AuthService', 'ngDialog',
        function ($rootScope, $scope, $location, $http, $state, $stateParams, AUTH_EVENTS, $auth, $ui) {
    
    $scope.credentials = {
        username: '',
        password: ''
    };
    
    //$scope.next = $state.current.name;
    //$scope.nextParams = $state.params;

    // console.log("scope.next " + $scope.next);
    // LoginController is used twice
    if (typeof $scope.next == "undefined"){
        $scope.next = { name: 'user' };
    }

    $scope.isLogged = function () { return $auth.isAuthenticated(); }


    $scope.login = function (credentials) {
        $auth.login($scope.credentials).
        then(
        // success
        function (user) {
            $ui.closeAll();
            $scope.setCurrentUser(user);

            if($scope.next != "")
                $state.go($scope.next.name, $scope.nextParams, { reload: true });
            else 
                $state.go("user");
        },// error
        function () {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
    }

    $scope.register = function () {
        $ui.open({
            template: 'views/modals/RegisterDialog.html?1234',
            controller: 'UserRegisterController',
            className: 'ngdialog-theme-default',
            scope: $scope,
            cache: false
        }).closePromise.then(function (data) {
            console.log(data.id + ' has been dismissed.');
        });
    }

    $scope.logout = function () {
        $scope.setCurrentUser(null);
        $auth.logout()
            .then(function () {
                $location.path('/');
        });
    }

    $scope.$on(AUTH_EVENTS.notAuthenticated, function (event, next, toParams) {

        $scope.next = next;
        $scope.nextParams = toParams;

        //if (next.data.guestAllowed) { console.log("guestAllowed"); return; }

        $ui.open({
            template: 'views/modals/LoginDialog.html?098',
            className: 'ngdialog-theme-default',
            scope: $scope,
            cache: false
        }).closePromise.then(function (data) {
            
        });
    });

}]);

app.controller("UserRegisterController",
    ['$rootScope', '$scope', '$http', '$state', '$stateParams', 'AUTH_EVENTS', 'AuthService', 'ngDialog',
        function ($rootScope, $scope, $http, $state, $stateParams, AUTH_EVENTS, $auth, $ui) {

    $scope.user = {
        password: '',
        username: '',
        alias: '',
        companyname: '',
        companyaddress: '',
        companyvat: ''
    }

    $scope.register = function (user) {
        $auth.register($scope.user).then(
            //success
            function (user) {
                $ui.closeAll();
                $state.go('profile', { id: user.userId });
            },
            //error
            function () {
            });
    }

}])



/**
 * User Controller
 */
app.controller('DashboardController',
    ['$scope', '$state', '$http', 'DataScope',
        function ($scope, $state, $http, DataScope) {
            $scope.brands = function () { $state.go("brand") };

            $scope.billing = function () { $state.go("user.billing") };

            $scope.profile = function () { $state.go("user.profile") };
        }]);


app.controller("BillingController",
    ['$rootScope', '$scope', '$http', '$state', '$stateParams', 'AUTH_EVENTS', 'AuthService',
        function ($rootScope, $scope, $http, $state, $stateParams, AUTH_EVENTS, $auth) {

        }]);

app.controller("SettingController",
    ['$rootScope', '$scope', '$http', '$state', '$stateParams', 'AUTH_EVENTS', 'AuthService',
        function ($rootScope, $scope, $http, $state, $stateParams, AUTH_EVENTS, $auth) {

        }]);

app.controller("ProfileController",
    ['$rootScope', '$scope', '$http', '$state', '$stateParams', 'AUTH_EVENTS', 'AuthService',
        function ($rootScope, $scope, $http, $state, $stateParams, AUTH_EVENTS, $auth) {

            $scope.user = $scope.currentUser;

        }]);

/**
 * Brand Controllers
 */

app.controller("BrandListController",
    ['$rootScope', '$scope', '$state', '$http', '$stateParams', 'DataScope',
        function ($rootScope, $scope, $state, $http, $stateParams, DataScope) {

    var $data = angular.toJson({ action: "brand.list" });

    DataScope.getBrands().
        then(function (brands) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.brands = brands;
        },function () {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    $scope.edit = function (id) {
        $state.go("brand.edit", { id: id })
    }
}]);

app.controller('BrandController',
    ['$rootScope', '$scope', '$state', '$http', '$stateParams', 'ngDialog', 'DataScope',
        function ($rootScope, $scope, $state, $http, $stateParams, $ui, DataScope) {

    $scope.currentBrand = function () { return DataScope.currentBrand; }

    console.log("state param id: " + $stateParams.id);

    if ($stateParams.id != "")
        DataScope.getBrand($stateParams.id).
            then(function (brand) {
                console.log(brand);
                DataScope.setCurrentBrand(brand);
            },function () { });

    $scope.addlogo = function () {
        $ui.open({
            template: 'views/modals/UploadDialog.html?1',
            controller: 'UploadController',
            className: 'ngdialog-theme-default',
            scope: $scope,
            cache: false
        }).closePromise.then(function (data) {
            console.log(data.id + ' has been dismissed.');
        });
    };

    $scope.$on("AddImage", function (event, src) {
        $filePath = "server/resources/" + src;
        DataScope.getCurrentBrand().logoSrc = $filePath;

    });

    $scope.save = function () {
        DataScope.saveBrand().
        then(function (brandid) {
            console.log("data saved!");
            $state.go("brand.edit", { id: brandid });
        },function () {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };

    $scope.delete = function () {
        DataScope.deleteBrand().
          then(function (data) {
              console.log("brand deleted");
              //$state.go("brand");
          }, function () {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
          });
    }

    $scope.back = function () { $state.go("brand"); }
}]);

/**
 * Artowrks Controllers
 */

app.controller("ArtworkListController",
    ['$rootScope', '$scope', '$state', '$http', 'DataScope', '$stateParams',
        function ($rootScope, $scope, $state, $http, DataScope, $stateParams) {

            if ($stateParams.pid == "")
                $state.go("brand");

            $scope.brandId = $stateParams.pid;

            DataScope.getArtworks($stateParams.pid).
                then(function (artworks) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.artworks = artworks;
                }, function () {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

            $scope.edit = function (id) {
                $state.go("artwork.edit", { pid: $stateParams.pid , id:id})
            }

            $scope.preview = function (id) {
                console.log("preview:" + id);
            }


            $scope.delete = function (id) {
                DataScope.deleteArtwork(id).
                  then(function (data) {
                      console.log("artwork deleted");
                      $state.go("artwork", { pid: $stateParams.pid });
                  }, function () {
                      // called asynchronously if an error occurs
                      // or server returns response with an error status.
                  });
            }

            $scope.back = function (id) { $state.go("brand"); }

        }]);

app.controller('ArtworkController',
    ['$rootScope', '$scope', '$state', '$http', '$stateParams', 'DataScope',
        function ($rootScope, $scope, $state, $http, $stateParams, DataScope) {

    $scope.currentBrand = DataScope.getCurrentBrand();

    $scope.installedTypes = DataScope.getIstalledTypes();


    $scope.back = function () { $state.go("artwork", { pid: $scope.currentBrand.id }); }

    $scope.save = function () {

        DataScope.saveArtwork().
          then(function (artworkId) {
              // this callback will be called asynchronously
              // when the response is available
              // console.log(DataScope.getCurrentArtwork().id);
              if (DataScope.getCurrentArtwork().id == "" ||
                  DataScope.getCurrentArtwork().id == null) {
                  $state.go("artwork.edit", { pid: DataScope.getCurrentBrand().id, id: artworkId });
              }
          },
          function () {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
          });
    }

    $scope.changeType = function () {
        var t = DataScope.getCurrentArtwork().type;

        $("#container-canvas").attr("height", t.height);
        $("canvas").attr("width", t.width).attr("height", t.height);
    }

    // Clear Previous Data
    DataScope.resetArtwork();

    $scope.currentArtwork = DataScope.getCurrentArtwork();
    // Fix, DOM Not ready, changes dont take effect
    $scope.changeType();

    $scope.currentBrand.id = $stateParams.pid;

    // below if methods don't fire
    if ($stateParams.id == "" ||
        $stateParams.id == undefined)
        return;
        
    DataScope.getArtwork($stateParams.id).
            then(function (artwork) {
                // this callback will be called asynchronously
                // when the response is available
                DataScope.setCurrentArtwork(artwork);
                $scope.currentArtwork = DataScope.getCurrentArtwork();
                $scope.changeType();
            }, function () {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

    $scope.delete = function () {
        if ($stateParams.id == "" ||
            $stateParams.id == undefined)
            return;

        DataScope.deleteArtwork($stateParams.id).
          then(function (data) {
              console.log("artwork deleted");
              $state.go("artwork", { pid: $stateParams.pid });
          }, function () {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
          });
    }
}]);

/**
 * Artowrks'children Controllers
 */

app.controller('ToolbarController',
    ['$state', '$rootScope', '$scope', '$http', 'ngDialog', 'DataScope',
        function ($state, $rootScope, $scope, $http, $ui, DataScope) {
    // sovrascrive current Artwork dato che canvas child di artwork
    //$scope.currentArtwork = DataScope.getCurrentArtwork();

    //$scope.currentBrand = DataScope.getCurrentBrand();

    $scope.preview = function () {

        var layers = DataScope.getCurrentArtwork().layers;

        var $cv = $("#canvas");
        if ($cv == undefined) return;

        var ctx = $cv[0].getContext("2d");

        var len = layers.length;
        for (var i = 0; i < len; i++) {
            var l = layers[i];
            if (l.type == "text") {
                //ctx.lineWidth = 1;
                ctx.font = l.font_size + " " + l.font_family;
                ctx.fillStyle = "#000000";
                //ctx.lineStyle = "#ffffff";
                ctx.textBaseline = "top";
                ctx.textAlign = "left";

                ctx.fillText(l.text, l.x, l.y);
            }
            if (l.type == "image") {
                var image = new Image();
                image.src = l.src;
                ctx.drawImage(image, l.x, l.y, image.width, image.height);
            }
        }
    }

    $scope.refresh = function () {
        var $cv = $("#canvas");
        if ($cv == undefined) return;

        var ctx = $cv[0].getContext("2d");
        ctx.clearRect(0, 0, $cv[0].width, $cv[0].height);
    }

    $scope.addimage = function () {
        $ui.open({
            template: 'views/modals/UploadDialog.html?1',
            controller: 'UploadController',
            className: 'ngdialog-theme-default',
            scope: $scope,
            cache: false
        }).closePromise.then(function (data) {
            console.log(data.id + ' has been dismissed.');
        });
    }

    $scope.$on("AddImage", function (event, src) {
        $filePath = "server/resources/" + src;
        DataScope.getCurrentArtwork().layers.push({ name:'New Image Layer', type: "image", src: $filePath, isVisible: true, x: 0, y: 0, z: 1, width: 100, height: 50 });
    });

    $scope.addtext = function () {
        
        DataScope.getCurrentArtwork().layers.push({name:'New Text Layer', type: "text", text: "dummy", font_family: "sans", font_size: "48px", isVisible: true, x: 0, y: 0, z: 1, width: 100, height: 50 });
        console.log("Add text layer");
        console.log(DataScope.getCurrentArtwork());
    }

    $scope.export = function () {

        var layers = DataScope.getCurrentArtwork().layers;
        console.log(layers);

        var $cv = $("#canvas");
        if ($cv == undefined) return;

        var ctx = $cv[0].getContext("2d");

        var len = layers.length;
        for (var i = 0; i < len; i++) {
            var l = layers[i];

            if (l.type == "text") {
                //ctx.lineWidth = 1;
                ctx.font = l.font_size + " " + l.font_family;
                ctx.fillStyle = "#000000";
                //ctx.lineStyle = "#ffffff";
                ctx.textBaseline = "top";
                ctx.textAlign = "left";

                ctx.fillText(l.text, l.x, l.y);
            }
            if (l.type == "image") {
                var image = new Image();
                image.src = l.src;
                ctx.drawImage(image, l.x, l.y, image.width, image.height);
            }
        }

        var imgData = $cv[0].toDataURL('image/png');

        //force download image insted of display it
        imgData = imgData.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

        /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
        imgData = imgData.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');

        //window.location.href = imgData;
        downloadFile("canvas.png", imgData);
    };

}]);

app.controller("UploadController",
    ['$rootScope', '$scope', '$http', 'DataScope', 'FileUploader',
        function ($rootScope, $scope, $http, DataScope, FileUploader) {

    //console.info("UploadController");

    var uploader = $scope.uploader = new FileUploader({
        url: 'server/resource.php'
    });

    // FILTERS

    uploader.filters.push({
        name: 'imageFilter',
        fn: function (item /*{File|FileLikeObject}*/, options) {
            console.log("imageFilter");
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    // CALLBACKS

    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function (fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function (addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function (item) {
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function (fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function (progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
        $rootScope.$broadcast("AddImage", fileItem.file.name);
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function (fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
        console.info('onCompleteAll');
    };

    console.info('uploader', uploader);
}]);

app.controller('LayerController',
    ['$rootScope', '$scope', '$http', 'DataScope',
        function ($rootScope, $scope, $http, DataScope) {

    $scope.toggleItem = function (index) {
        $rootScope.$broadcast("ToggleItem", index);
    }
}]);

app.controller('CanvasController',
    ['$rootScope', '$scope', '$http', 'DataScope',
        function ($rootScope, $scope, $http, DataScope) {

    // sovrascrive current Artwork dato che canvas child di artwork
    // $scope.currentArtwork = DataScope.getCurrentArtwork();
    // console.log($scope.currentArtwork);

    $scope.selectedLayer = DataScope.getCurrentLayer();

    $scope.selectLayer = function ($event, layer) {
        //        var $obj = $scope.artwork.layers[index];
        DataScope.setCurrentLayer(layer);

        //$rootScope.$broadcast("SelectItem", index);

        jQuery(".itemcanvas").removeClass("selected");
        jQuery($event.currentTarget).addClass("selected");

        //console.log($scope.selectedLayer().properties);
    }

    $scope.updateLayer = function (event, ui, layer) {
        layer.x = ui.position.left;
        layer.y = ui.position.top;
    }

    $scope.detect = function () {
        console.log("cliccked");
    }

    $scope.changeSize = function (layer) {
        
        layer.width = getTextWidth(layer.text, layer.font_size + ' ' + layer.font_family);
        layer.size = layer.text.length;
        console.log(layer.width);
    }

    $scope.$on('ToggleItem', function (event, layer) {
        layer.isVisible = !layer.isVisible;
    });

}]);

app.controller('InfoController',
    ['$scope', '$http', 'DataScope',
        function ($scope, $http, DataScope) {

    $scope.selectedLayer = DataScope.getCurrentLayer();
}]);

/**
 * Run 
 */
app.run(['$rootScope', 'AUTH_EVENTS', 'AuthService','$state', function ($rootScope, AUTH_EVENTS, $auth, $state) {

    $rootScope.$on('$stateChangeStart', function (event, next, toParams) {
        console.log('changestate');
        console.log(next);
        var authorizedRoles = next.data.authorizedRoles;

        // isAuthorized is valid for logged users
        if (!$auth.isAuthorized(authorizedRoles) && !next.data.guestAllowed) {
            event.preventDefault();

            //if (next.data.guestAllowed) { console.log("guestAllowed"); return; }

            if ($auth.isAuthenticated()) {
                console.log("not Author");
                // user is not allowed
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized, next, toParams);
            } else {
                // user is not logged in
                console.log("try to restore");
                $auth.restore()
                    .then(function (user) {
                        if (user != undefined) {
                            $rootScope.setCurrentUser(user);
                            $state.go(next, toParams);
                        } else {
                            console.log("not Auth");
                            $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, next, toParams);
                        }
                    });
            }
        }

    });

    // TODO: check the auth flow


}]);

function downloadFile(fileName, urlData) {

    var aLink = document.createElement('a');
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click");
    aLink.download = fileName;
    aLink.href = urlData;
    aLink.dispatchEvent(evt);
    aLink.remove();
}

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var $cv = $("#canvas");
    if ($cv == undefined) return;
    var ctx = $cv[0].getContext("2d");
    ctx.font = font;
    return ctx.measureText(text).width;
};