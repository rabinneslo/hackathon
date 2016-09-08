System.register(['@angular/core', '../services/index', '@angular/forms', '../shared/rxjs-operators'], function(exports_1, context_1) {
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
    var core_1, index_1, forms_1;
    var AutoComplete;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (index_1_1) {
                index_1 = index_1_1;
            },
            function (forms_1_1) {
                forms_1 = forms_1_1;
            },
            function (_1) {}],
        execute: function() {
            AutoComplete = (function () {
                function AutoComplete(myElement, service) {
                    this.service = service;
                    this.selection = new core_1.EventEmitter();
                    this.results = [];
                    this.query = new forms_1.FormControl();
                    this.elementRef = myElement;
                }
                AutoComplete.prototype.ngOnInit = function () {
                    var _this = this;
                    this.query
                        .valueChanges
                        .debounceTime(400)
                        .distinctUntilChanged()
                        .switchMap(function (term) { return _this.service.getSchools(term); })
                        .subscribe(function (items) {
                        _this.results = items.hits && items.hits.hits ? items.hits.hits.map(function (x) { return x._source; }) : [];
                    }, function (error) {
                        console.log(error);
                    });
                };
                AutoComplete.prototype.select = function (item) {
                    this.selection.emit(item);
                    this.results = [];
                };
                AutoComplete.prototype.handleClick = function (event) {
                    var clickedComponent = event.target;
                    var inside = false;
                    do {
                        if (clickedComponent === this.elementRef.nativeElement) {
                            inside = true;
                        }
                        clickedComponent = clickedComponent.parentNode;
                    } while (clickedComponent);
                    if (!inside) {
                        this.results = [];
                    }
                };
                __decorate([
                    core_1.Output(), 
                    __metadata('design:type', Object)
                ], AutoComplete.prototype, "selection", void 0);
                AutoComplete = __decorate([
                    core_1.Component({
                        selector: 'autocomplete',
                        host: {
                            '(document:click)': 'handleClick($event)'
                        },
                        providers: [index_1.MapService],
                        template: "\n        <div class=\"searchBoxWrapper\">\n            <input type=\"text\" placeholder=\"Zoek scholen...\" class=\"form-control\" [formControl]=\"query\"/>\n            <a class=\"btn btn-zoeken\">\n                <i class=\"fa fa-search zoeken\"></i>\n            </a>\n        </div>\n        <div class=\"suggestions\" *ngIf=\"results.length > 0\">\n            <ul class=\"suggestions-results\">\n                <li *ngFor=\"let item of results\">\n                    <a (click)=\"select(item)\">{{item.naam}} ({{item.adres.plaats}})</a>\n                </li>\n            </ul>\n        </div>\t\n        "
                    }), 
                    __metadata('design:paramtypes', [(typeof (_a = typeof core_1.ElementRef !== 'undefined' && core_1.ElementRef) === 'function' && _a) || Object, (typeof (_b = typeof index_1.MapService !== 'undefined' && index_1.MapService) === 'function' && _b) || Object])
                ], AutoComplete);
                return AutoComplete;
                var _a, _b;
            }());
            exports_1("AutoComplete", AutoComplete);
        }
    }
});