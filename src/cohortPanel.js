d3.cohortPanel = (function(){
	'use strict';
	var metadata = {
	       groupList:{},
	       selectedRow:[],
	       relationship:{}
   	};
    //Random Color Creator;
    var randomColor = ()=>'#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
    //Get Max and Min for given array;
	var getScale = vals => vals.reduce( (acc,cur) => {return {max:Math.max(acc.max,cur),min:Math.min(acc.min,cur)}},{max:vals[0],min:vals[0]})

    
    //
	var addGroup = function(name){
    	
	    if( !Object.keys(this.groupList).includes(name) ){
	    	
	    	    	
	    	this.groupList = [...Object.keys(this.groupList),name]
	    					.reduce((acc,group)=>{ 
	    						acc[group]= typeof this.groupList[group] === 'undefined' ? {name:group,color:randomColor()}:this.groupList[group]; 
	    						return acc;
	    					},{})
	    	this.relationship = [...Object.keys(this.relationship),name]
	    					.reduce((acc,group)=>{ 
	    						acc[group]= typeof this.relationship[group] === 'undefined'?[]:this.relationship[group]; 
	    						return acc;
	    					},{})				
	    	}
    }

    var rmGroup = function(name){
    	this.groupList = Object.keys(this.groupList)
    	            		  .filter((d)=>d!==name)
    	                      .reduce((acc,group)=>{ acc[group] = this.groupList[group]; return acc},{})
 
    	this.relationship = Object.keys(this.relationship)
    							 .filter((d)=>d!==name)
    							 .reduce((acc,group)=>{ 
    							 	acc[group] = this.relationship[group]; 
    							 	return acc},{})

    }

    var addElm = function(group,elmIDs=null){
    // ElmId vs Group is one to one
        let addelmIDs = elmIDs===null?[...this.selectedRow]:[...elmIDs]	
	    this.selectedRow = [];
	    this.relationship = Object.keys(this.relationship).reduce((acc,r)=>{
	    	//delete elmId from exsit group if it exsits
	    
	    let samplelist = this.relationship[r].filter((s)=>!addelmIDs.includes(s))
	    	//add elmId to the new group 
	    	if( r===group ){ samplelist = [...new Set([...samplelist,...addelmIDs])] }
	    	acc[r]=[...samplelist];	
	    	return acc;	
	    },{});

    }

    var selectRow = function(rID,type){
    	let rows = [];
    	if(type==='single'){
    		rows.push(rID);
    	}else if(type==='multiple'){
	        rows = [...new Set([...this.selectedRow,rID])]
    	}else{
    		let ranges = getScale([...new Set([...this.selectedRow,rID])]);
    		
    		for(i=ranges.min;i<=ranges.max;i++){rows.push(i)};
    		
    	}
    	this.selectedRow = [...rows];
    }

    var groupdata = function(){
    	return this
    }
	
	var exports={
		addGroup: function(name){return addGroup.bind(metadata)(name)},
		rmGroup: function(name){return rmGroup.bind(metadata)(name)},
		data:function(){return groupdata.bind(metadata)()}
    };



	return exports;
})();