d3.plotPanel = (function(){
	'use strict';
	var groupData ={
			groupList:{},
			selectedRow:[],
			relationship:{},
			rowsViewID:d3.range(0,25)
		},
		sampleData = new Array,
		mavenData = new Array;
	function exports(_selection){
		_selection.call(d3.groupView.bindData(groupData).clickEvent(function(d,i){console.log('single click')}).dblclickEvent(function(d,i){console.log('double click')}));
        let groupMap = d3.entries(groupData.relationship).reduce((acc,rl)=>{
        	let sampleMap = sampleData
        					.filter((d,i)=>rl.value.includes(i)).map((d)=>d.sample_id)
        			  		.filter((d,i,self)=>self.indexOf(d)===i)
        			  		.reduce((a,s)=>{a[s]=rl.key;return a},{});
            return {...acc,...sampleMap};
        },{})
        let cohortData = d3.nest()
        				   .key((d)=>d.hasOwnProperty('compound')?d.compound:d.group_id)
                 		   .key((d)=>groupMap[d.sample_id])
        		 		   .entries(mavenData.filter((d)=>Object.keys(groupMap).map((d)=>+d).includes(d.sample_id)))
        
        console.log(cohortData);




	};
    
    exports.sampleData = function(data){
			if(!arguments.length){return sampleData;}
			sampleData = data;
			return this;
	};

	exports.mavenData = function(data){
			if(!arguments.length){return mavenData;}
			mavenData = data;
			return this;
	};

    exports.groupData = function(data){
			if(!arguments.length){return groupData;}
			groupData = data;
			return this;
	};		

	return exports;
})()