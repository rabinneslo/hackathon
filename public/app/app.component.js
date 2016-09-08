System.register(['@angular/core', './services/index', './directives/map', './components/autoComplete', 'rxjs/Observable', 'rxjs/rx'], function(exports_1, context_1) {
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
    var core_1, index_1, map_1, autoComplete_1, Observable_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (index_1_1) {
                index_1 = index_1_1;
            },
            function (map_1_1) {
                map_1 = map_1_1;
            },
            function (autoComplete_1_1) {
                autoComplete_1 = autoComplete_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (_1) {}],
        execute: function() {
            AppComponent = (function () {
                function AppComponent(mapService) {
                    this.mapService = mapService;
                    this.clusters = [
                        { value: 'cito', display: 'School advies' },
                        { value: 'kmean', display: 'K-mean clustering' },
                        { value: 'inspectie', display: 'Kwaliteit scholen' }];
                    this.measures = [
                        { value: 'leerlingen', display: 'Aantal leerlingen' },
                        { value: 'rijksbijdrage', display: 'Rijksbijdrage per leerling' },
                        { value: 'afstand', display: 'Afstand tot school' },
                        { value: 'aantal', display: 'Aantal scholen' },
                    ];
                    this.cluster = this.clusters[0].value;
                    this.measure = this.measures[0].value;
                    this.view = 'map';
                    this.views = ['map', 'histogram'];
                    this.bezetting = 90;
                }
                AppComponent.prototype.ngOnInit = function () {
                    this.data = Observable_1.Observable.combineLatest(this.mapService.getCities(), this.mapService.getSchools(), function (cities, schools) {
                        return { cities: cities, schools: schools };
                    });
                };
                AppComponent.prototype.updateBezetting = function (value) {
                    this.bezetting = 100 - value;
                };
                AppComponent = __decorate([
                    core_1.Component({
                        directives: [map_1.MapChart, autoComplete_1.AutoComplete],
                        selector: 'hackathon',
                        templateUrl: 'app/app.html',
                        providers: [index_1.MapService]
                    }), 
                    __metadata('design:paramtypes', [(typeof (_a = typeof index_1.MapService !== 'undefined' && index_1.MapService) === 'function' && _a) || Object])
                ], AppComponent);
                return AppComponent;
                var _a;
            }());
            exports_1("AppComponent", AppComponent);
        }
    }
});