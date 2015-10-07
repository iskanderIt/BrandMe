(function (angular, factory) {
    if (typeof define === 'function' && define.amd) {
        define('angular-auth', ['angular'], function (angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(typeof angular === 'undefined' ? null : angular, function (angular) {

    var module = angular.module('ngAuth', []);

    'use strict';

    module

    .service('Session', ["$http", function ($http) {
        this.create = function (sessionId, userId, userRole) {
            this.id = sessionId;
            this.userId = userId;
            this.userRole = userRole;
        };
        this.destroy = function () {
            this.id = null;
            this.userId = null;
            this.userRole = null;
        };
    }])

    .factory('AuthService', ['$http','Session',function ($http, Session) {
        var authService = {};

        authService.login = function (credentials) {
            var $data = angular.toJson({ action: "user.login", credentials:credentials });
            return $http
                .post('server/data.php', $data)
                .then(function (res) {
                    Session.create(res.data.sessId, res.data.user.id,
                                    res.data.user.role);
                    return res.data.user;
                });
        };

        authService.register = function (user) {
            var $data = angular.toJson({ action: "user.register", user: user });
            return $http
                .post('server/data.php', $data)
                .then(function (res) {
                    Session.create(res.data.user.sessId, res.data.user.userId,
                                    res.data.user.userRole);
                    return res.data.user;
                });
        };

        authService.logout = function () {
            var $data = angular.toJson({ action: "user.logout" });
            return $http
                .post('server/data.php', $data)
                .then(function (res) {
                    Session.destroy();
                });
        }

        authService.save = function (user) {
            var $data = angular.toJson({ action: "user.save", user: user });
            return $http.post('server/data.php', $data)
            .then(function (res) {
                return res.data.data;
            });
        };

        authService.restore = function () {
            var $data = angular.toJson({ action: "user.session" });
            return $http.post('server/data.php', $data)
            .then(function (res) {
                if (res.data.user == undefined) {
                    return null;
                }
                Session.create(res.data.sessId, res.data.user.id,
                                res.data.user.role);
                return res.data.user;
            });
        }

        authService.getUser = function (id) {
            var $data = angular.toJson({ action: "user.detail", id: id });
            return $http.post('server/data.php', $data)
            .then(function (res) {
                return res.data.user;
            });
        };

        authService.isAuthenticated = function () {
            return !!Session.userId;
        };

        authService.isAuthorized = function (authorizedRoles) {

            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            
            return (authService.isAuthenticated() &&
              ((authorizedRoles.indexOf(Session.userRole) !== -1) ||
                authorizedRoles.indexOf('*') !== -1));
        };

        return authService;
    }])

    .constant('AUTH_EVENTS',
    {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    })
    .constant('USER_ROLES', {
        all: '*',
        admin: 'admin',
        designer: 'designer',
        client: 'client',
        guest: 'guest'
    })

    return module;
}));