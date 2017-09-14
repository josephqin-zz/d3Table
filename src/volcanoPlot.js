d3.volcanoPlot = (function(){
	'use strict';
	var plotData = [];
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
	function exports(_selection){
		_selection.selectAll('*').remove();
		if(!plotData.length) return;
		var x = d3.scaleLinear().range([0, width]);
		var y = d3.scaleLinear().range([height, 0]);	    
		var vis = _selection.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var color = d3.scaleOrdinal().range(d3.schemeCategory20);
		var xAxis = d3.axisBottom(x);
		var yAxis = d3.axisLeft(y);
		let Xmin = d3.min(plotData.map(function(d){return d.x}))
		let Xmax = d3.max(plotData.map(function(d){return d.x}))
		let Ymin = d3.min(plotData.map(function(d){return d.y}))
		let Ymax = d3.max(plotData.map(function(d){return d.y}))
		x.domain([Xmin,Xmax]).nice();
		y.domain([Ymin,Ymax]).nice();
		vis.append("line")
		.attr("x1",x(0))
		.attr("y1",450)
		.attr("x2",x(0))
		.attr("y2",0)
		.style('stroke','#000')
		.style('stroke-width',2);

		vis.append("line")
		.attr("x1",0)
		.attr("y1",y(2))
		.attr("x2",800)
		.attr("y2",y(2))
		.style('stroke','#000')
		.style('stroke-width',2);
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

		vis.selectAll(".dot")
		.data(plotData)
		.enter().append("g")
		.each(function(d,i){
			d3.select(this).append('circle')
			.attr("class", "dot")
			.attr("r", 6)
			.attr("cx",  x(d.x))
			.attr("cy",  y(d.y))
			.style("fill", color(i))
		})
		.on("click",function(d){

		})
		.on("mouseover", function(d) {		
			d3.select(this).append('text')
			.text(d.name)
			.style('fill','#000000')  
			.attr('x',d3.mouse(this)[0])
			.attr('y',d3.mouse(this)[1]-20)
			.style('dominant-baseline','middle')
			.style('text-anchor','middle'); 
		})					
		.on("mouseout", function(d) {		
			d3.select(this).select('text').remove();							            				  
		})								  	  

	}

	exports.bindData=function(data){
		if(!arguments.length) return plotData;
		plotData = data;
		return this;
	}

	return exports;
})()