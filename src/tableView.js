d3.tableView = (function(){
    //Default values:
    var rawTableData = null,
    	columns = null,
    	cellWidth = 150,
    	cellHeight = 20;

    var filterFun = (d,i)=>true;	

    var rowColor = (i)=>{return i%2?"ffffff":'#e0e2e5'}

    var rowRender = function(rowData,rowId){
    	d3.select(this).style('fill',rowColor(rowId))
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
    				    			   .style('fill','#000000')	
    				    			   .attr('x',cellWidth/2)
    				    			   .attr('y',cellHeight/2)
    				    			   .style('dominant-baseline','middle')
    				    			   .style('text-anchor','middle')			   
    				   				   

    				   })

    }; 

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
				  .each(rowRender);
		

	};

	//Getters and Setters
	exports.tableData = function(data){
		if(!arguments.length) return rawTableData;
	  	rawTableData = data ;
        columns = Object.keys(data[0]);
	    return this;
	};

	exports.columnList = function(cols){
       if(!arguments.length) return columns;
       columns = [...cols];
       return this;
	};

	exports.rowFilter = function(conditionFun){
	   if(!arguments.length) return filterFun;
	   filterFun = conditionFun;
	   return this;

	};

	return exports;

})();
