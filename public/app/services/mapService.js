System.register(['@angular/core', '@angular/http', '../shared/rxjs-operators'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, http_1;
    var MapService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (_1) {}],
        execute: function() {
            MapService = (function () {
                function MapService(http) {
                    this.http = http;
                }
                // Uses http.get() to load a single JSON file
                MapService.prototype.getCities = function () {
                    return this.http.get('/json/cities.json').map(function (res) { return res.json(); });
                };
                MapService.prototype.getSchools = function (query) {
                    if (query === void 0) { query = '*'; }
                    return this.http.get("/api/school?term=" + query).map(function (res) { return res.json(); });
                };
                MapService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [(typeof (_a = typeof http_1.Http !== 'undefined' && http_1.Http) === 'function' && _a) || Object])
                ], MapService);
                return MapService;
                var _a;
            }());
            exports_1("MapService", MapService);
        }
    }
});