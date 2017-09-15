d3.barPlot = (function(){
	'use strict';
	var barData = [];
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	var groupList = new Array;
	var groupMap = new Array;
    var clickEventFn = function(d,i){console.log('click')};
    var maptoArray = (nestMap,Fn) => Object.keys(nestMap).map((k)=>{ 
   	let item = {};
   	item.key = k;
   	let data = nestMap[k];
   	if(Array.isArray(data)){
   		item.rawdata=data;
   	 	item.values=Fn.call(null,data);
   	}else{
   		item.values = maptoArray(data,Fn);
   	}
   	return item;
   })


	function exports(_selection){
		_selection.selectAll('*').remove();
		if(!barData.length) return;
		var x = d3.scaleBand().rangeRound([0, width]).padding(0.5);
		var y = d3.scaleLinear().range([height, 0]);	    
		var svg = _selection.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		var xAxis = d3.axisBottom(x);
		var yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s"));
		
		let nest = d3.nest().key((d)=>groupMap[d.sample_id])

        let cData = maptoArray(nest.object(barData),(d)=>d3.mean(d.map((r)=>r.areatop))) 
           
        
        x.domain(cData.map(function(d) { return d.key; }));
        y.domain([0, d3.max(cData, function(d) { return d.values; })]);

            
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "middle")
                .style("font-size", "20")
                .attr("dy", "0.55em");

            svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis)
                  .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", ".71em")
                  .style("text-anchor", "end");

            svg.selectAll("rect")
                .data(cData)
                .enter().append("rect")
                .style("fill", (d)=>groupList[d.key].color)
                .attr("x", function(d) { return x(d.key); })
                .attr("width", x.bandwidth())
                .attr("y", function(d) { return y(d.values); })
                .attr("height", function(d) { return height - y(d.values); })      
                .on('click',clickEventFn);								  	  

	}

	exports.bindData=function(data){
		if(!arguments.length) return barData;
		barData = data;
		return this;
	}

	exports.groupMap=function(data){
		if(!arguments.length) return groupMap;
		groupMap = data;
		return this;
	}

	exports.groupList=function(data){
		if(!arguments.length) return groupList;
		groupList = data;
		return this;
	}

	exports.clickEvent = function(fn){
    	if(!arguments.length) return clickEventFn;
    	clickEventFn=fn;
    	return this;
    }


	return exports;
})()