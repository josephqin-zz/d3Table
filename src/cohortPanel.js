d3.cohortPanel = (function(){
	'use strict';
	var groupData ={
		groupList:{},
		selectedRow:[],
		relationship:{},
		rowsViewID:d3.range(0,25)
   	   	};
   	var sampleData = new Array;
   	var mavenData = new Array;
   	var columnList = new Array;   	
	function exports(_selection){

		_selection.append('g').attr('id','groupSelector').call(d3.groupSelector.groupData(groupData).tableData(sampleData).tableColumns(columnList))

	}
	//Setter and Getter
	exports.sampleData = function(data){
		if(!arguments.length){return sampleData;}
		sampleData = data;
		return this;
	}
	exports.mavenData = function(data){
		if(!arguments.length){return mavenData;}
		mavenData = data;
		return this;
	}

	exports.tableColumns = function(data){
		if(!arguments.length){return columnList;}
		columnList = data;
		return this;
	}

	return exports
})()