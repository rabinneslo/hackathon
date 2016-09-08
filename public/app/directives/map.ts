import { Directive, ElementRef, Attribute, SimpleChange, Input } from '@angular/core';
import * as d3 from 'd3';
declare var topojson: any;

@Directive({
   selector: 'map-chart'
 })

 export class MapChart 
 {
     @Input() data: any;
     @Input() measure: string = 'leerlingen';
     @Input() view: string = 'map';
     @Input() cluster: string = 'cito';
     width: any;
     height: any;
     private container: any;
     private scales: any;
     private comparison: string = 'Cito';
     private colors: Array<string> = ["#d7191c", "#f9d057", "#90eb9d", "#00a6ca"];
     private gemeenten: Array<any> = [];

     constructor ( elementRef: ElementRef, @Attribute('width') width: string, @Attribute('height') height: string ){
         let el: any    = elementRef.nativeElement;  
         let graph: any = d3.select(el);
         this.width = width;
         this.height = height;
         this.container = graph.append('svg')
                               .attr('height', height)
                               .attr('width', width);
                   
     }

     // Render the D3 Bar Chart
     private draw(data: any): void
     {
         if(data){
             let merc = this.prepareProjection();
             let geometries = topojson.feature(data.cities, data.cities.objects.gemeenten);
             let gemeenten = this.prepareData(data.schools, merc, geometries.features);
             if(this.view == 'map'){
                this.makeMap(gemeenten, geometries, merc);
             }
             else{
                 this.makeHistoGram(gemeenten);
             }
         }
     }

     private ngOnChanges( changes: { [propertyName: string]: SimpleChange } ): void 
     {
        this.draw(this.data);
     }

     createComparison():Array<any>{
         if(this.cluster == 'cito'){
             return  [
                {key:'Vmbo', score:533},
                {key:'Havo', score:536},
                {key:'Havo/vwo', score:540},
                {key:'Vwo', score:542}
            ];
         }
         else{
             return [];
         }
     }

     prepareProjection():any{
                     // Mercator projection
            let merc = d3.geoMercator();

            // Coordinates of Suriname
            var lattop = 50.75119191657173,
                lonleft = 3.358524099218433,
                lonright = 6.15414;

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
            merc.translate([this.width/15, this.height/1.05]);
            merc.center([3.358524099218433,50.75119191657173]);

            return merc;
     }

     prepareGeometries(cities:any):any{
         return topojson.feature(cities, cities.objects.gemeenten).features;
     }

     prepareData(schools:any, projection: any, geometries:any):any{
         let gemeenten = schools
                .aggregations
                .gemeenten
                .buckets
                .map((x:any)=>
                {
                    let geometry = geometries.find(geo=> geo.properties.name.search(new RegExp(x.key, "i")) != -1);
                    if(!geometry){console.log(x.key);}
                        return <any>{
                        key: x.key, 
                        aantal: x.doc_count,
                        centroid: projection(d3.geoCentroid(geometry)),
                        leerlingen: x.leerlingen.value, 
                        rijksbijdrage : x.bijdrage ? x.bijdrage.value : 0,
                        scores: x.scores.value,
                        afstand: x.afstand ? x.afstand.value : 0
                    }
                });
         return gemeenten;
     }

     prepareScales(data:any, measures: Array<string>):any{
        let scales = {};
        measures.forEach(measure=>{
            scales[measure] = d3.scaleLinear()
                .domain(d3.extent(data, (d)=>d[measure]))
                .range([2,15]);
        });
        return scales;
     }

     createColorScale():any{
         let comparison = this.createComparison()
         return d3.scaleThreshold()
            .domain(comparison.map(x=>x.score))
            .range(this.colors);
     }

     drawGemeenteBorders(path:any, geometries):void{
        let geoSelection = this.container.selectAll('.geo_gemeenten');
        if(geoSelection._groups[0].length == 0){
            geoSelection
                .data(geometries.features)
                .enter()
                .append("path")
                .attr("class", "geo_gemeenten")
                .attr("d", path);
         }
         else{
             geoSelection.transition()
                .duration(2000)
                .attr('stroke-opacity', 0.3);
         }
     }

     addTooltip():any{
        // Define the div for the tooltip
        let div;
        let selection = d3.select("body").selectAll('div.tooltip');
        if(selection._groups[0].length == 0)
        {
            div = d3.select("body")
                .append("div");
            div	
                .attr("class", "tooltip")				
                .style("opacity", 0);
        }
        else{
            div = selection;
        }
        return div;
     }

     drawCircles(circles:any, colorScale:any, scales):void{
        circles.transition("move")
                .duration(2000)
                .delay((d,i)=>i%20)
                .attr('r', (d)=>scales[this.measure](d[this.measure]))
                .attr('cy', (d)=>d.centroid[1])
                .attr('cx', (d)=>d.centroid[0]);
        circles.transition('highlight')
                .duration(2000)
                .style('fill', (d)=>colorScale(d.scores))
                .style("opacity", 0.6)
     }

     makeLegend(){
         let legend,label;
         let selection = this.container.selectAll('.legend');
         let comparisons = this.createComparison();
         let width = 10;
         let colorScale = this.createColorScale();
         if(selection._groups[0].length == 0){
             legend = this.container.selectAll('.legend')
                .data(comparisons)
                .enter()
                .append("rect")
                .attr("class", "legend");
            legend
                .attr("transform",`translate(${this.width - 350},0)`)
                .attr('width', 0)
                .attr('height', 0)
                .attr('x', 40)
                .attr('y', (d,i)=>{ return i*width*1.5 + width;})
                .style('opacity', 0)
                .attr('fill', (d)=>colorScale(d.score-1))
                .style("font-size","10px");
            label = this.container.selectAll('.legendLabel')
                .data(comparisons)
                .enter()
                .append('text')
                .attr("class", "legendLabel");
            label
                .attr("transform",`translate(${this.width - 350},0)`)
                .attr("x", function(d) { return 40+width*2; })
                .attr("y", (d,i)=>{ return i*width*1.5 + width*1.5;})
                .attr("dy", ".4em")
                .attr('fill', '#aaa')
                .style("font-size","10px")
                .style('opacity', 0)
                .text((d)=>d.key);
         }
         else{
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
            .style('opacity',1);
        
     }

     makeMap(gemeenten: any, geometries:any, merc:any):void{
         let measures = [
            {value : 'leerlingen', display : 'Aantal leerlingen'},
            {value : 'rijksbijdrage', display: 'Rijksbijdrage per leerling'},
            {value : 'afstand', display: 'Afstand tot school'},
            {value : 'aantal', display: 'Aantal scholen'}
         ];
         let scales = this.prepareScales(gemeenten,measures.map(x=>x.value));
         let path = d3.geoPath().projection(merc);
         let borders = this.container.selectAll('.geo_gemeenten');
         if(borders._groups[0].length == 0){
             this.drawGemeenteBorders(path, geometries);
         }
         else{
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
            .style('opacity', 0)
         let tooltip = this.addTooltip();
         let measure = this.measure;
         let circles;
         let selection = this.container.selectAll('circle.gemeenten');
         let colorScale = this.createColorScale();
         if(selection._groups[0].length == 0){
            circles = this.container.selectAll('circle.gemeenten')
                .data(gemeenten)
                .enter()
                .append('circle')
                .attr('class', 'gemeenten')
                .attr('r', (d)=>0)
                .attr('cy', (d)=>d.centroid[1])
                .attr('cx', (d)=>d.centroid[0])
                .style('fill', (d)=>colorScale(d.scores))
                .style('stroke', 'white')
                .style('stroke-opacity', 0.3)
                .style("opacity", 0);
         }
         else{
            circles = this.container.selectAll('circle.gemeenten');
         }
         circles.on("mouseover", function(d) {		
            tooltip.transition()		
                .duration(200)		
                .style("opacity", .9);		
            tooltip.html(d.key + "<br/>"  + Math.round(d.scores)+ "<br/>"  + Math.round(d.leerlingen))	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
         })					
         .on("mouseout", function(d) {		
            tooltip.transition()		
                .duration(500)		
                .style("opacity", 0);	
         });
         this.makeLegend();
         this.drawCircles(circles, colorScale, scales);
     }

     /**
      * @description Create the bins for the histogram chart.
      * @param {Array<any>} the data used for creating the histogram.
      * @param {string} the measurement on the data to use for creating the histogram.
      * @param {number} the bin thresholds to use fro creating the histogram.
      * @return {any}
      */
     createBins(data:Array<any>, measurement: string, thresholds: number):any{
         return d3.histogram()
                  .domain(d3.extent(data, (d)=>d[measurement]))
                  .thresholds(thresholds)
                  .value(d=>d[measurement])
                  (data);
     }

     drawXAxis(xDotAxis:any, width:number){
        //Put in the right location
        let xAxis, xLabels;
        let selection = this.container.selectAll("g.x.axis");
        if(selection._groups[0].length == 0){
            xAxis = this.container.append("g")
                .attr("class", "x axis");
            xAxis.style("opacity", 0);
        }
        else{
            xAxis = this.container.selectAll("g.x.axis");
        }
        xAxis.transition()
            .duration(500)
            .delay(500)
            .style("opacity", 1)
            .attr("transform", "translate(" + 0 + "," + (width+10) + ")")
            .call(xDotAxis);
     }

     drawYAxis(yDotAxis:any){
        let yAxis, yLabels;
        let selection = this.container.selectAll(".y.axis");
        if(selection._groups[0].length == 0){
            yAxis = this.container.append("g")
                .attr("class", "y axis");
            yAxis
                .attr("transform", "translate(" + 65  + "," + 0 + ")")
                .style("opacity", 0);
        }
        else{
            yAxis = this.container.selectAll(".y.axis");
        }
        yAxis.transition()
            .duration(500)
            .delay(500)
            .style('opacity', 1)
            .call(yDotAxis);
     }

     makeHistoGram(schools:any):void{
        let dotSize = 3;
        let offset = 85;
        let height = 350;
        let measure = 'scores';
        let bins = this.createBins(schools, this.measure, 80);
        let dotLocation = d3.extent(bins,d=>d.length)[1]*dotSize*2 + 40;
        bins.forEach(bin=>bin.sort((a,b)=> a[measure] > b[measure] ? 1 : (a[measure] < b[measure] ? -1 : 0)));
        let xScale = d3.scaleLinear()
            .domain(d3.extent(schools, (d)=>d[this.measure]))
            .range([offset, offset + bins.length*dotSize*2]);
        let xDotAxis = d3.axisBottom(xScale)
	        .ticks(8);
        
        let yScale = d3.scaleLinear()
            .range([dotLocation,(dotLocation - d3.extent(bins,d=>d.length)[1]*dotSize*2)])
            .domain(d3.extent(bins,d=>d.length));
        let yDotAxis = d3.axisRight(yScale)
	        .ticks(8);
        this.drawXAxis(xDotAxis,dotLocation);
        this.drawYAxis(yDotAxis);
        this.container.selectAll('.geo_gemeenten')
            .transition()
            .duration(1000)
            .style('stroke-opacity',0);
        let circles;
        let selection = this.container.selectAll('.gemeenten');
        if(selection._groups[0].length == 0){
            console.log('creating');
            circles = this.container
                .selectAll('.gemeenten')
                .data(schools)
                .enter()
                .append('circle');
        }
        else{
            circles = this.container
                .selectAll('.gemeenten');
        }
        circles.transition("march")
            .duration(1000)
            .attr('r',3)
            .attr('cx',(d)=>{
                let bin = bins.find(x=> x.x0 <= d[this.measure] && x.x1 > d[this.measure]);
                if(bin){
                    return xScale(bin.x0) + (xScale(bin.x1)- xScale(bin.x0));
                }
                else{
                    return xScale(bins[bins.length-1].x1);
                }
            })
            .attr('cy',(d)=>{
                let bin = bins.find(x=> x.x0 <= d[this.measure] && x.x1 > d[this.measure]);
                if(bin){
                    let index = bin.findIndex(x=> x.key == d.key);
                    if(index < 0){
                        console.log(bin, d);
                        index = 0;
                    }
                    return dotLocation - (index*6 + 3);
                }
                else{
                    return dotLocation - (0 + 3);
                }
            })
     }
 }