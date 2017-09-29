d3.linePlot = (function(){
	'use strict';
	var plotData = [];
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
	// var clickEventFn = function(d,i){console.log('click')};
	function exports(_selection){
		_selection.selectAll('*').remove();
		if(!plotData.length) return;
		
		var xScale = d3.scaleLinear().range([0, width]);
		var yScale = d3.scaleLinear().range([height, 0]);	    
		var vis = _selection.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var color = d3.scaleOrdinal().range(d3.schemeCategory20);
		var xAxis = d3.axisBottom(xScale);
		var yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".2s"));;
		let Xmin = d3.min(plotData.map((d)=>d3.min(d.values.map((t)=>(t.x)))))
        let Xmax = d3.max(plotData.map((d)=>d3.max(d.values.map((t)=>(t.x)))))
        let Ymin = d3.min(plotData.map((d)=>d3.min(d.values.map((t)=>(t.y)))))
        let Ymax = d3.max(plotData.map((d)=>d3.max(d.values.map((t)=>(t.y)))))
		xScale.domain([Xmin,Xmax]).nice();
		yScale.domain([Ymin,Ymax]).nice();
		let lineFunction = d3.line()
                               .x(function (d) {return xScale(d.x);})
                               .y(function (d) {return yScale(d.y);})
                               .curve(d3.curveMonotoneX);
		
		vis.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", -6)
			.style("text-anchor", "end")
			.text("");

		vis.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("")

			vis.append("g")
			.selectAll("path")
			.data(plotData)
			.enter().append("path")
			.attr("class","line")
			.attr("fill","none")
			.attr("stroke-width","1")
			.attr("d",function(d){return lineFunction(d.values)})
			.style("stroke",function(d,i){return color(i)})
			.attr("data-series",function(d){return d.name})
			.on("mouseover", function(d) {
				vis.append('text')
				.attr('id','tip')
				.text(d.name)
				.style('fill','#000000')  
				.attr('x',d3.mouse(this)[0])
				.attr('y',d3.mouse(this)[1])
				.style('dominant-baseline','middle')
				.style('text-anchor','middle');
				d3.select(this).attr("stroke-width","2.5")

			})					
			.on("mouseout", function(d) {		
				vis.select('#tip').remove();	
				d3.select(this).attr("stroke-width","1")
			});								  	  

	};

	exports.bindData=function(data){
		if(!arguments.length) return plotData;
		plotData = data;
		return this;
	}

	// exports.clickEvent = function(fn){
 //    	if(!arguments.length) return clickEventFn;
 //    	clickEventFn=fn;
 //    	return this;
 //    }

	return exports;
})()