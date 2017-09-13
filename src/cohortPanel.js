d3.cohortPanel = (function(){
	'use strict';
	var groupdata={
		       groupList:{},
		       selectedRow:[],
		       relationship:{}
   	    	};
    var rows = [];
	for(let i=0;i<20;i++){rows.push(i)}
    var	tabledata=rows.map((d)=>{ return {id:d,name:'sample'+d,value:Math.round(Math.random()*100)}})

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
    //select behavior single/multiple/group
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

    var exports=function(_selection){
		
   	    var dispatcher = d3.dispatch('addGroup','rmGroup','addElm','rmElm','updateUI','selectRow')
   	    //UI initial
   	    var inputPanel = _selection.append('g').attr('id','inputPanel');
   	    var tablePanel = _selection.append('g').attr('id','tablePanel');
   	    var groupPanel = _selection.append('g').attr('id','groupPanel');
   	    //event FN
   	    //select Row
   	    var selectFn = function(value,i){
   	    	 	    	
                    let selectType = 'single'
                    if( d3.event.shiftKey ){

                        selectType = 'group'
                    }
                    if( d3.event.ctrlKey ){
                        selectType = 'multiple'
                    } 
                    if(i>0)dispatcher.call('selectRow',this,i,selectType);
   	    }
        //add element to group
        var addElmFn = function(value){dispatcher.call('addElm',this,value.key)}
        //remove group
        var rmGroupFn = function(value){dispatcher.call('rmGroup',this,value.key)}
        //remove element from group
        var rmElmFn = function(value,i){dispatcher.call('rmElm',this,i)}

        var tableFn = d3.tableView.bindData(tabledata).clickEvent(selectFn).dblclickEvent(rmElmFn)
        var groupFn = d3.groupPanel.clickEvent(addElmFn).dblclickEvent(rmGroupFn)
   	    inputPanel.call(d3.inputPanel.getInputFn(function(value){dispatcher.call('addGroup',this,value)}));	
		groupPanel.call(groupFn)
		          .attr('transform',(d,i)=>'translate( 0,'+(inputPanel.node().getBBox().height+5)+')');
   	    tablePanel.call(tableFn)
   	    		  .attr('transform',d3.zoomIdentity.translate(205,0));
   	    

        //all dispatch workflow setting
   	    dispatcher.on('addGroup',function(name){
   	        addGroup.bind(groupdata)(name);
   	    	dispatcher.call('updateUI',null,groupdata);
   	    });
   	    dispatcher.on('rmGroup',function(name){
   	    	rmGroup.bind(groupdata)(name);
   	    	dispatcher.call('updateUI',null,groupdata);
   	    })

   	    dispatcher.on('selectRow',function(rID,type){
   	        selectRow.bind(groupdata)(rID,type);

   	        dispatcher.call('updateUI',null,groupdata);
   	    })

   	    dispatcher.on('addElm',function(groupName,elms=null){
		
			addElm.bind(groupdata)(groupName,elms);
		
			dispatcher.call('updateUI',null,groupdata);
		})

		dispatcher.on('rmElm',function(elms=null){
		
			addElm.bind(groupdata)(null,elms);//add elms to null group equalite to delete elms
			
			dispatcher.call('updateUI',null,groupdata);

		})

   	    dispatcher.on('updateUI',function(groupdata){
   	    	
            
            //style rows according to selected Rows and group information
   	    	let rowscolor = d3.entries(groupdata.relationship).reduce((acc,r)=>{
                let rcolor = groupdata.groupList[r.key].color
                let rmap = r.value.reduce((rs,rid)=>{ rs[rid]= rcolor; return rs;},{})
                return {...acc,...rmap}
   	    	},{})
   	    	let selectedrow = groupdata.selectedRow.reduce((acc,r)=>{acc[r]='#e5d822';return acc},{})
            let colorMap = {...rowscolor,...selectedrow}
            //creat drag event for tableView
            let dragstart = function(){
    				let dview = d3.select(this)
    								.append('g')
    								.attr('id','dragview')
    								.style('opacity',0.5)
    								.attr('transform',d3.zoomIdentity.translate(0,0));
    				d3.select(this).selectAll('[id^=row]')
    								.filter((d,i)=>groupdata.selectedRow.includes(i))
    								.each(function(d){dview.insert(()=>this.cloneNode(true))})
    		};
    		let dragged = function(){ 
    				let dview = d3.select(this).select('#dragview');
                    let current = dview.node().transform.baseVal[0].matrix;
                    dview.attr('transform',d3.zoomIdentity.translate(current.e+d3.event.dx,current.f+d3.event.dy))
                };	
            let dragend = function(){d3.select(this).select('#dragview').remove()};    	
            let dragFn = d3.drag().on('start',dragstart).on('drag',dragged).on('end',dragend);

   	    	
   	    	tablePanel.call(tableFn.rowColor(colorMap).dragEvent(dragFn)).attr('transform',d3.zoomIdentity.translate(205,0));
   	    		groupPanel.call(groupFn.bindData(groupdata))
   	    })
	    
		
		return this;
    };
    
    exports.groupData = function(data){
    	if(!arguments.length) return groupdata;
    	groupdata=data;
    	return this;
    }

    exports.tabledata = function(data){
    	if(!arguments.length) return tabledata;
    	tabledata = data
    	return this;
    }


	return exports;
})();