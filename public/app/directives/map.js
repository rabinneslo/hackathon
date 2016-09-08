System.register(['@angular/core', 'd3'], function(exports_1, context_1) {
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
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var core_1, d3;
    var MapChart;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (d3_1) {
                d3 = d3_1;
            }],
        execute: function() {
            MapChart = (function () {
                function MapChart(elementRef, width, height) {
                    this.measure = 'leerlingen';
                    this.view = 'map';
                    this.cluster = 'cito';
                    this.comparison = 'Cito';
                    this.colors = ["#d7191c", "#f9d057", "#90eb9d", "#00a6ca"];
                    this.gemeenten = [];
                    var el = elementRef.nativeElement;
                    var graph = d3.select(el);
                    this.width = width;
                    this.height = height;
                    this.container = graph.append('svg')
                        .attr('height', height)
                        .attr('width', width);
                }
                // Render the D3 Bar Chart
                MapChart.prototype.draw = function (data) {
                    if (data) {
                        var merc = this.prepareProjection();
                        var geometries = topojson.feature(data.cities, data.cities.objects.gemeenten);
                        var gemeenten = this.prepareData(data.schools, merc, geometries.features);
                        if (this.view == 'map') {
                            this.makeMap(gemeenten, geometries, merc);
                        }
                        else {
                            this.makeHistoGram(gemeenten);
                        }
                    }
                };
                MapChart.prototype.ngOnChanges = function (changes) {
                    this.draw(this.data);
                };
                MapChart.prototype.createComparison = function () {
                    if (this.cluster == 'cito') {
                        return [
                            { key: 'Vmbo', score: 533 },
                            { key: 'Havo', score: 536 },
                            { key: 'Havo/vwo', score: 540 },
                            { key: 'Vwo', score: 542 }
                        ];
                    }
                    else {
                        return [];
                    }
                };
                MapChart.prototype.prepareProjection = function () {
                    // Mercator projection
                    var merc = d3.geoMercator();
                    // Coordinates of Suriname
                    var lattop = 50.75119191657173, lonleft = 3.358524099218433, lonright = 6.15414;
                    /**
                     * Make the scale so that the difference of longitude is
                     * exactly the width of the image
                     */
                    var scale = 20 * this.width / (lonright - lonleft);
                    /**
                     * Translate the origin of the map to [0,0] as a start,
                     * not to the now meaningless default of [480,250]
                     */
                    merc.scale(scale);
                    merc.translate([this.width / 15, this.height / 1.05]);
                    merc.center([3.358524099218433, 50.75119191657173]);
                    return merc;
                };
                MapChart.prototype.prepareGeometries = function (cities) {
                    return topojson.feature(cities, cities.objects.gemeenten).features;
                };
                MapChart.prototype.prepareData = function (schools, projection, geometries) {
                    var gemeenten = schools
                        .aggregations
                        .gemeenten
                        .buckets
                        .map(function (x) {
                        var geometry = geometries.find(function (geo) { return geo.properties.name.search(new RegExp(x.key, "i")) != -1; });
                        if (!geometry) {
                            console.log(x.key);
                        }
                        return {
                            key: x.key,
                            aantal: x.doc_count,
                            centroid: projection(d3.geoCentroid(geometry)),
                            leerlingen: x.leerlingen.value,
                            rijksbijdrage: x.bijdrage ? x.bijdrage.value : 0,
                            scores: x.scores.value,
                            afstand: x.afstand ? x.afstand.value : 0
                        };
                    });
                    return gemeenten;
                };
                MapChart.prototype.prepareScales = function (data, measures) {
                    var scales = {};
                    measures.forEach(function (measure) {
                        scales[measure] = d3.scaleLinear()
                            .domain(d3.extent(data, function (d) { return d[measure]; }))
                            .range([2, 15]);
                    });
                    return scales;
                };
                MapChart.prototype.createColorScale = function () {
                    var comparison = this.createComparison();
                    return d3.scaleThreshold()
                        .domain(comparison.map(function (x) { return x.score; }))
                        .range(this.colors);
                };
                MapChart.prototype.drawGemeenteBorders = function (path, geometries) {
                    var geoSelection = this.container.selectAll('.geo_gemeenten');
                    if (geoSelection._groups[0].length == 0) {
                        geoSelection
                            .data(geometries.features)
                            .enter()
                            .append("path")
                            .attr("class", "geo_gemeenten")
                            .attr("d", path);
                    }
                    else {
                        geoSelection.transition()
                            .duration(2000)
                            .attr('stroke-opacity', 0.3);
                    }
                };
                MapChart.prototype.addTooltip = function () {
                    // Define the div for the tooltip
                    var div;
                    var selection = d3.select("body").selectAll('div.tooltip');
                    if (selection._groups[0].length == 0) {
                        div = d3.select("body")
                            .append("div");
                        div
                            .attr("class", "tooltip")
                            .style("opacity", 0);
                    }
                    else {
                        div = selection;
                    }
                    return div;
                };
                MapChart.prototype.drawCircles = function (circles, colorScale, scales) {
                    var _this = this;
                    circles.transition("move")
                        .duration(2000)
                        .delay(function (d, i) { return i % 20; })
                        .attr('r', function (d) { return scales[_this.measure](d[_this.measure]); })
                        .attr('cy', function (d) { return d.centroid[1]; })
                        .attr('cx', function (d) { return d.centroid[0]; });
                    circles.transition('highlight')
                        .duration(2000)
                        .style('fill', function (d) { return colorScale(d.scores); })
                        .style("opacity", 0.6);
                };
                MapChart.prototype.makeLegend = function () {
                    var legend, label;
                    var selection = this.container.selectAll('.legend');
                    var comparisons = this.createComparison();
                    var width = 10;
                    var colorScale = this.createColorScale();
                    if (selection._groups[0].length == 0) {
                        legend = this.container.selectAll('.legend')
                            .data(comparisons)
                            .enter()
                            .append("rect")
                            .attr("class", "legend");
                        legend
                            .attr("transform", "translate(" + (this.width - 350) + ",0)")
                            .attr('width', 0)
                            .attr('height', 0)
                            .attr('x', 40)
                            .attr('y', function (d, i) { return i * width * 1.5 + width; })
                            .style('opacity', 0)
                            .attr('fill', function (d) { return colorScale(d.score - 1); })
                            .style("font-size", "10px");
                        label = this.container.selectAll('.legendLabel')
                            .data(comparisons)
                            .enter()
                            .append('text')
                            .attr("class", "legendLabel");
                        label
                            .attr("transform", "translate(" + (this.width - 350) + ",0)")
                            .attr("x", function (d) { return 40 + width * 2; })
                            .attr("y", function (d, i) { return i * width * 1.5 + width * 1.5; })
                            .attr("dy", ".4em")
                            .attr('fill', '#aaa')
                            .style("font-size", "10px")
                            .style('opacity', 0)
                            .text(function (d) { return d.key; });
                    }
                    else {
                        legend = this.container.selectAll('.legend');
                        label = this.container.selectAll('.legendLabel');
                    }
                    legend.transition()
                        .duration(800)
                        .delay(1000)
                        .style('opacity', 0.6)
                        .attr('width', width)
                        .attr('height', width);
                    label.transition()
                        .duration(800)
                        .delay(1000)
                        .style('opacity', 1);
                };
                MapChart.prototype.makeMap = function (gemeenten, geometries, merc) {
                    var measures = [
                        { value: 'leerlingen', display: 'Aantal leerlingen' },
                        { value: 'rijksbijdrage', display: 'Rijksbijdrage per leerling' },
                        { value: 'afstand', display: 'Afstand tot school' },
                        { value: 'aantal', display: 'Aantal scholen' }
                    ];
                    var scales = this.prepareScales(gemeenten, measures.map(function (x) { return x.value; }));
                    var path = d3.geoPath().projection(merc);
                    var borders = this.container.selectAll('.geo_gemeenten');
                    if (borders._groups[0].length == 0) {
                        this.drawGemeenteBorders(path, geometries);
                    }
                    else {
                        borders.transition()
                            .duration(1000)
                            .delay(1000)
                            .style('stroke-opacity', 0.3);
                    }
                    this.container.selectAll('.x.axis')
                        .transition()
                        .duration(1000)
                        .style('opacity', 0);
                    this.container.selectAll('.y.axis')
                        .transition()
                        .duration(1000)
                        .style('opacity', 0);
                    var tooltip = this.addTooltip();
                    var measure = this.measure;
                    var circles;
                    var selection = this.container.selectAll('circle.gemeenten');
                    var colorScale = this.createColorScale();
                    if (selection._groups[0].length == 0) {
                        circles = this.container.selectAll('circle.gemeenten')
                            .data(gemeenten)
                            .enter()
                            .append('circle')
                            .attr('class', 'gemeenten')
                            .attr('r', function (d) { return 0; })
                            .attr('cy', function (d) { return d.centroid[1]; })
                            .attr('cx', function (d) { return d.centroid[0]; })
                            .style('fill', function (d) { return colorScale(d.scores); })
                            .style('stroke', 'white')
                            .style('stroke-opacity', 0.3)
                            .style("opacity", 0);
                    }
                    else {
                        circles = this.container.selectAll('circle.gemeenten');
                    }
                    circles.on("mouseover", function (d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(d.key + "<br/>" + Math.round(d.scores) + "<br/>" + Math.round(d.leerlingen))
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                        .on("mouseout", function (d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
                    this.makeLegend();
                    this.drawCircles(circles, colorScale, scales);
                };
                /**
                 * @description Create the bins for the histogram chart.
                 * @param {Array<any>} the data used for creating the histogram.
                 * @param {string} the measurement on the data to use for creating the histogram.
                 * @param {number} the bin thresholds to use fro creating the histogram.
                 * @return {any}
                 */
                MapChart.prototype.createBins = function (data, measurement, thresholds) {
                    return d3.histogram()
                        .domain(d3.extent(data, function (d) { return d[measurement]; }))
                        .thresholds(thresholds)
                        .value(function (d) { return d[measurement]; })(data);
                };
                MapChart.prototype.drawXAxis = function (xDotAxis, width) {
                    //Put in the right location
                    var xAxis, xLabels;
                    var selection = this.container.selectAll("g.x.axis");
                    if (selection._groups[0].length == 0) {
                        xAxis = this.container.append("g")
                            .attr("class", "x axis");
                        xAxis.style("opacity", 0);
                    }
                    else {
                        xAxis = this.container.selectAll("g.x.axis");
                    }
                    xAxis.transition()
                        .duration(500)
                        .delay(500)
                        .style("opacity", 1)
                        .attr("transform", "translate(" + 0 + "," + (width + 10) + ")")
                        .call(xDotAxis);
                };
                MapChart.prototype.drawYAxis = function (yDotAxis) {
                    var yAxis, yLabels;
                    var selection = this.container.selectAll(".y.axis");
                    if (selection._groups[0].length == 0) {
                        yAxis = this.container.append("g")
                            .attr("class", "y axis");
                        yAxis
                            .attr("transform", "translate(" + 65 + "," + 0 + ")")
                            .style("opacity", 0);
                    }
                    else {
                        yAxis = this.container.selectAll(".y.axis");
                    }
                    yAxis.transition()
                        .duration(500)
                        .delay(500)
                        .style('opacity', 1)
                        .call(yDotAxis);
                };
                MapChart.prototype.makeHistoGram = function (schools) {
                    var _this = this;
                    var dotSize = 3;
                    var offset = 85;
                    var height = 350;
                    var measure = 'scores';
                    var bins = this.createBins(schools, this.measure, 80);
                    var dotLocation = d3.extent(bins, function (d) { return d.length; })[1] * dotSize * 2 + 40;
                    bins.forEach(function (bin) { return bin.sort(function (a, b) { return a[measure] > b[measure] ? 1 : (a[measure] < b[measure] ? -1 : 0); }); });
                    var xScale = d3.scaleLinear()
                        .domain(d3.extent(schools, function (d) { return d[_this.measure]; }))
                        .range([offset, offset + bins.length * dotSize * 2]);
                    var xDotAxis = d3.axisBottom(xScale)
                        .ticks(8);
                    var yScale = d3.scaleLinear()
                        .range([dotLocation, (dotLocation - d3.extent(bins, function (d) { return d.length; })[1] * dotSize * 2)])
                        .domain(d3.extent(bins, function (d) { return d.length; }));
                    var yDotAxis = d3.axisRight(yScale)
                        .ticks(8);
                    this.drawXAxis(xDotAxis, dotLocation);
                    this.drawYAxis(yDotAxis);
                    this.container.selectAll('.geo_gemeenten')
                        .transition()
                        .duration(1000)
                        .style('stroke-opacity', 0);
                    var circles;
                    var selection = this.container.selectAll('.gemeenten');
                    if (selection._groups[0].length == 0) {
                        console.log('creating');
                        circles = this.container
                            .selectAll('.gemeenten')
                            .data(schools)
                            .enter()
                            .append('circle');
                    }
                    else {
                        circles = this.container
                            .selectAll('.gemeenten');
                    }
                    circles.transition("march")
                        .duration(1000)
                        .attr('r', 3)
                        .attr('cx', function (d) {
                        var bin = bins.find(function (x) { return x.x0 <= d[_this.measure] && x.x1 > d[_this.measure]; });
                        if (bin) {
                            return xScale(bin.x0) + (xScale(bin.x1) - xScale(bin.x0));
                        }
                        else {
                            return xScale(bins[bins.length - 1].x1);
                        }
                    })
                        .attr('cy', function (d) {
                        var bin = bins.find(function (x) { return x.x0 <= d[_this.measure] && x.x1 > d[_this.measure]; });
                        if (bin) {
                            var index = bin.findIndex(function (x) { return x.key == d.key; });
                            if (index < 0) {
                                console.log(bin, d);
                                index = 0;
                            }
                            return dotLocation - (index * 6 + 3);
                        }
                        else {
                            return dotLocation - (0 + 3);
                        }
                    });
                };
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', Object)
                ], MapChart.prototype, "data", void 0);
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', String)
                ], MapChart.prototype, "measure", void 0);
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', String)
                ], MapChart.prototype, "view", void 0);
                __decorate([
                    core_1.Input(), 
                    __metadata('design:type', String)
                ], MapChart.prototype, "cluster", void 0);
                MapChart = __decorate([
                    core_1.Directive({
                        selector: 'map-chart'
                    }),
                    __param(1, core_1.Attribute('width')),
                    __param(2, core_1.Attribute('height')), 
                    __metadata('design:paramtypes', [(typeof (_a = typeof core_1.ElementRef !== 'undefined' && core_1.ElementRef) === 'function' && _a) || Object, String, String])
                ], MapChart);
                return MapChart;
                var _a;
            }());
            exports_1("MapChart", MapChart);
        }
    }
});