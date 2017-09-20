//table windows View
// 'use strict';
d3.tableView = (function(){
    //Default values:
    'use strict';
    var rawTableData = null,
    	columns = new Array,
    	cellWidth = 150,
    	cellHeight = 20;

    var filterFun = (d,i)=>true;	

    var rowColor = (i)=>{return i%2?"ffffff":'#e0e2e5'}
    //get contrast color of give color;
    function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
    }

    var rowRender = function(rowData,rowId){
        let rcolor = rowColor(rowId)
    	d3.select(this).style('fill',rcolor)
    				   .attr('transform','translate( 0 '+","+cellHeight*rowId+" )");
    	d3.select(this).selectAll('g')
    				   .data(rowData)
    				   .enter()
    				   .append('g')
    				   .attr('id',(col,i)=>'col'+i)
    				   .each(function(col,i){
    				   	d3.select(this).attr('transform','translate('+cellWidth*i+', 0)')
    				   	d3.select(this).append('rect')
    				   				   .attr('width',cellWidth)
    				   				   .attr('height',cellHeight)
    				    d3.select(this).append('text')
    				    			   .text((d)=>d)
    				    			   .style('fill',invertColor(rcolor,true))	
    				    			   .attr('x',cellWidth/2)
    				    			   .attr('y',cellHeight/2)
    				    			   .style('dominant-baseline','middle')
    				    			   .style('text-anchor','middle')			   
    				   				   

    				   })

    };
    //module event behavior
    var clickEventFn = function(d,i){console.log('single click')} 
    var dblclickEventFn = function(d,i){console.log('double click')}
    var dragEventFn = d3.drag(); 

	function exports(_selection){
		if(!rawTableData)return this;
		//render table row0 is table head
		let rows = [columns,...rawTableData.filter(filterFun).map((r)=>{
	  		return columns.map((col)=>r[col]);
	  	})];
	  	_selection.selectAll('*').remove();
		_selection.selectAll('g')
				  .data(rows)
				  .enter()
				  .append('g')
				  .attr('id',(r,i)=>'row'+i)
				  .each(rowRender)
                  .on('click',clickEventFn)
        		  .call(dragEventFn);
   	};

	//Getters and Setters
	exports.bindData = function(data){
		if(!arguments.length) return rawTableData;
	  	rawTableData = data ;
        if(data.length>0) columns=Object.keys(data[0])
	    return this;
	};

	exports.columns = function(cols){
       if(!arguments.length) return columns;
       if (cols.length>0) columns = [...cols];
       return this;
	};

	exports.rowFilter = function(conditionFun){
	   if(!arguments.length) return filterFun;
	   filterFun = conditionFun;
	   return this;

	};

    exports.rowColor = function(colorMap){
        if(!arguments.length) return rowColor;
        rowColor = (i) => colorMap[i]?colorMap[i]:((i)=>{return i%2?"ffffff":'#e0e2e5'})(i);
        return this;
    }

    exports.clickEvent = function(fn){
        if(!arguments.length) return clickEventFn;
        clickEventFn = fn
        return this;
    }

    exports.dblclickEvent = function(fn){
        if(!arguments.length) return dblclickEventFn;
        dblclickEventFn = fn;
        return this;
    }

    exports.dragEvent = function(fn){
        if(!arguments.length) return dragEventFn;
        dragEventFn = fn;
        return this;
    }

	return exports;

})();