d3.groupSelector = (function(){
	'use strict';
	var groupdata={
		       groupList:{},
		       selectedRow:[],
		       relationship:{}
   	    	};
  groupdata.rowsViewID = d3.range(0,20);
       
  var rows = [];
  var tableColumns = new Array;
	for(let i=0;i<100;i++){rows.push(i)}
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
	    						acc[group]= typeof this.groupList[group] === 'undefined' ? {name:group,color:randomColor(),selected:false}:this.groupList[group]; 
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
        let addelmIDs = elmIDs===null?[...this.selectedRow]:[...elmIDs.map((rowviedid)=>this.rowViewID[rowviedid])]	
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
    var selectRow = function(rowViewID,type){
    	let rows = [];
      let rID = this.rowsViewID[rowViewID-1];
    	if(type==='single'){
    		rows.push(rID);
    	}else if(type==='multiple'){
	        rows = [...new Set([...this.selectedRow,rID])]
    	}else{
    		let ranges = getScale([...new Set([...this.selectedRow,rID])]);
    		
    		for(let i=ranges.min;i<=ranges.max;i++){rows.push(i)};
    		
    	}
    	this.selectedRow = [...rows];
    }

    var exports=function(_selection){
		
   	    var dispatcher = d3.dispatch('addGroup','rmGroup','addElm','rmElm','updateUI','selectRow')
   	    //UI initial
   	    var inputPanel = _selection.append('g').attr('id','inputPanel');
   	    var groupView = _selection.append('g').attr('id','groupView');
   	    var tablePanel = _selection.append('g').attr('id','tablePanel');
        //event FN
        tablePanel.on('mousewheel.zoom',function(d){
          let curMinRow = d3.min(groupdata.rowsViewID)
          let curMaxRow = d3.max(groupdata.rowsViewID)+1
          if(d3.event.wheelDelta>0){ curMinRow += 1;curMaxRow +=1 }
          else{curMinRow -= 1;curMaxRow -=1}
          groupdata.rowsViewID = (curMinRow >=0 && curMaxRow<=tabledata.length)?d3.range(curMinRow,curMaxRow):[...groupdata.rowsViewID]
          
          dispatcher.call('updateUI',null,groupdata);
        })
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

        var tableFn = d3.tableView.bindData(tabledata).columns(tableColumns).clickEvent(selectFn).rowFilter((d,i)=>groupdata.rowsViewID.includes(i));
        var groupFn = d3.groupView.horizontalLayOut(false).clickEvent(addElmFn).dblclickEvent(rmGroupFn)
   	    inputPanel.call(d3.inputPanel.getInputFn(function(value){dispatcher.call('addGroup',this,value)})).attr('transform',d3.zoomIdentity.translate(5,5));	
		    groupView.call(groupFn)
		          .attr('transform',(d,i)=>'translate(0,'+(inputPanel.node().getBBox().height+5)+')');
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
                let rmap = r.value.reduce((rs,rid)=>{
                  let rviewID = groupdata.rowsViewID.findIndex((d)=>d===rid)+1
                  if(rviewID>0) rs[rviewID]= rcolor; 
                  return rs;
                },{})
                return Object.assign(acc , rmap);
   	    	  },{})
   	    	  let selectedrow = groupdata.selectedRow.reduce((acc,r)=>{
              let rviewID = groupdata.rowsViewID.findIndex((d)=>d===r)+1;
              if(rviewID>0) acc[rviewID]='#e5d822';
              return acc;
            },{})
            let colorMap = Object.assign( rowscolor , selectedrow);
            //get groupname by cursor coordinate
            let groups=Object.keys(groupdata.groupList)

            //creat drag event for tableView
            let selectedRowViewID = groupdata.selectedRow.map((r)=>groupdata.rowsViewID.indexOf(r)+1).filter((d)=>d>0) 
            let dragstart = function(){
    				let dview = d3.select(this.parentNode)
    								.append('g')
    								.attr('id','dragview')
    								.style('opacity',0.5)
    								.attr('transform',d3.zoomIdentity.translate(0,0));
    				d3.select(this.parentNode).selectAll('[id^=row]')
    								.filter((d,i)=>selectedRowViewID.includes(i))
    								.each(function(d){dview.insert(()=>this.cloneNode(true))})
    		};
    		    let dragged = function(){ 
    				let dview = d3.select(this.parentNode).select('#dragview');
                    let current = dview.node().transform.baseVal[0].matrix;
                    dview.attr('transform',d3.zoomIdentity.translate(current.e+d3.event.dx,current.f+d3.event.dy))
                };	
            let dragend = function(){
             
              if( d3.event.x<=-5 && d3.event.y%30<=25 ){
                dispatcher.call('addElm',this,groups[Math.floor((d3.event.y-30)/30)]);
              }
              d3.select(this.parentNode).select('#dragview').remove()
            };    	
            let dragFn = d3.drag().filter((d,i)=>selectedRowViewID.includes(i)).on('start',dragstart).on('drag',dragged).on('end',dragend);

   	    	
   	    	  tablePanel.call(tableFn.rowColor(colorMap).dragEvent(dragFn)).attr('transform',d3.zoomIdentity.translate(205,0));
   	    		groupView.call(groupFn.bindData(groupdata))
   	    })
	    
		
		return this;
    };
    
    exports.groupData = function(data){
    	if(!arguments.length) return groupdata;
    	groupdata=data;
    	return this;
    }

    exports.tableData = function(data){
    	if(!arguments.length) return tabledata;
    	tabledata = data
    	return this;
    }
    
    exports.tableColumns = function(data){
      if(!arguments.length) return tableColumns;
      tableColumns = data
      return this;
    }

	return exports;
})();