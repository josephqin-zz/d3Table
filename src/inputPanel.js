d3.inputPanel = (function(){
	'use strict';
	
	var cellWidth = 200,
  	  	cellHeight = 25;
    //module events defination
    var dispatcher = d3.dispatch('getInput','reset');
    
    dispatcher.on('getInput',function(value){console.log(this)});
	dispatcher.on('reset',()=>{});
	
	function exports(_selection){
		var inputBox = _selection.append('g')
				.attr('id','inputBox')
  			  	.append('foreignObject')
  			  	.attr("width", cellWidth)
              	.attr("height", cellHeight)
  			  	.append('xhtml:input')
  			  	.on('keydown',function(){
  			  		if(d3.event.keyCode===13){
  			 	    if(this.value) dispatcher.call('getInput',this,this.value);
  			 	    this.value = null;  			  	 			
  			  		}
  	    	   	});
	};

	exports.getInputFn = function(fn){
		dispatcher.on('getInput',fn);
		return this;
	};

	exports.resetFn = function(fn){
        dispatcher.on('reset',fn);
		return this;
	};

	return exports;
})()