d3.groupEditor = (function(){
  
  var metaData = {
  	   groupList:{},
       selectedRow:[],
       relationship:{},
  	  },
  	  cellWidth = 200,
  	  cellHeight = 25;
  
  var dispatcher = d3.dispatch('updateUI')

  dispatcher.on('updateUI',function(){
  	 this.selectAll('*').remove();
  	 that=this;
  	 this.append('g')
  	          .attr('id','inputBox')
  			  .append('foreignObject')
  			  .attr("width", cellWidth)
              .attr("height", cellHeight)
  			  .append('xhtml:input')
  			  .on('keydown',function(){
  			  	if(d3.event.keyCode===13){
  			  	 addGroup(this.value);
  			  	 dispatcher.call('updateUI',that)  			  	 			
  			  	}
  	    	   });
    this.append('g')
    	.attr('id','groupList')
      .attr('transform',(d,i)=>'translate( 0 , '+cellHeight+')')
    	.selectAll('g')
    	.data(d3.entries(metaData.relationship))
    	.enter()
    	.append('g')
    	.attr('id',(d,i)=>d.key)
    	.attr('transform',(d,i)=>'translate('+(cellWidth+5)*i+' , 0)')
    	.each(function(d,i){
    		d3.select(this).append('rect')
				    	   .attr("width", cellWidth)
				          .attr("height", cellHeight)
				           .attr("fill",metaData.groupList[d.key].color);

		    d3.select(this).append('text')
		    			   .text(d.key+' has '+d.value.length.toString()+' samples')
		    			   .style('fill','#000000')	
    				       .attr('x',cellWidth/2)
    					   .attr('y',cellHeight/2)
    				       .style('dominant-baseline','middle')
    				       .style('text-anchor','middle')		           

    	})


  })
  	  
  var randomColor = ()=>'#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
  
  var addGroup = function(name){
    	
	    if( !Object.keys(metaData.groupList).includes(name) ){
	    	
	    	    	
	    	metaData.groupList = [...Object.keys(metaData.groupList),name]
	    					.reduce((acc,group)=>{ 
	    						acc[group]= typeof metaData.groupList[group] === 'undefined' ? {name:group,color:randomColor()}:metaData.groupList[group]; 
	    						return acc;
	    					},{})
	    	metaData.relationship = [...Object.keys(metaData.relationship),name]
	    					.reduce((acc,group)=>{ 
	    						acc[group]= typeof metaData.relationship[group] === 'undefined'?[]:metaData.relationship[group]; 
	    						return acc;
	    					},{})				
	    	}
    }


  

  function exports(_selection){
  	if(!arguments.length) return;
  	dispatcher.call('updateUI',_selection);
  	return metaData;
  };

  //Getter and Setter
  exports.updateData=function(newData){
  	if(!arguments.length) return metaData;
  	metaData = {...newData}
    return this;
  }

  return exports
})();