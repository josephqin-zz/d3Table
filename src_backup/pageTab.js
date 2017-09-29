d3.pageTab=(function(){
	//default values:
    var rowInAll = 1,
    	rowInPage = 10,
    	pageInTab = 10,
    	currentTab = 0,
    	currentPage = 0,
    	pageTotal = 0,
    	buttonWidth = 40,
    	buttonHeight = 20;


    var dispatcher = d3.dispatch('updateTab');
    var pageClickEvent = function(d){
    	console.log(d);
    }

    	
    //get rows/pages range on current page/tab by given current page/tab and rows/pages per page/tab with total rows/pages  
    var getRange = (current,per,total) => {
    	let range=[]
    	for(i=Math.max(current * per,0);i<Math.min((current+1) * per, total);i++){
    		range.push(i);
    	}
    	return range;
    };

    dispatcher.on('updateTab',function(currentT){
        
    	let newTabs = getRange(currentT,pageInTab,Math.ceil(rowInAll/rowInPage)).map((p)=>{return {page:p,range:getRange(p,rowInPage,rowInAll)}})
    	let backButtons = currentT<=0?[]:[{page:'<',range:0},{page:'<<',range:currentT-1}]
    	let forwardButtons = currentT===Math.ceil(rowInAll/(rowInPage*pageInTab))-1?[]:[{page:'>>',range:currentT+1},{page:'>',range:Math.ceil(rowInAll/(rowInPage*pageInTab))-1}]
    	this.selectAll('*').remove();
    	let button = this.selectAll('g')
			    		.data([...backButtons,...newTabs,...forwardButtons])
			    		.enter()
			    		.append('g')
			    		.attr('transform',(g,i)=>'translate('+buttonWidth*i+', 0)')
		button.append('rect')
			  .attr('width',buttonWidth)
			  .attr('height',buttonHeight)
			  .style('fill','#ffffff')
			  .style('stroke','#000000')
			  .filter((d)=>d.page===newTabs[0].page)
			  .style('fill','#e0e2e5');

		pageClickEvent(newTabs[0].range);

	    button.on('click',(g)=>{
	    		let rect = button.selectAll('rect').style('fill','#ffffff')
			  	if(typeof g.range === 'number'){
			  		dispatcher.call('updateTab',this,g.range);
			  		
			  	}else{
			  	    rect.filter((d)=>d.page===g.page).style('fill','#e0e2e5')
			  		pageClickEvent(g.range);
			  	}
			  });

	    button.append('text')
	    	  .text((g)=>typeof g.page==='number'?g.page+1:g.page)
	    	  .style('fill','#000000')	
    		  .attr('x',buttonWidth/2)
    		  .attr('y',buttonHeight/2)
    		  .style('dominant-baseline','middle')
    		  .style('text-anchor','middle');	  		    		

    	});
    


	function exports(_selection){ 

		dispatcher.call('updateTab',_selection,currentTab);

	};

	//Getters and Setters
    exports.rowTotal=function(_x){
    	if(!arguments.length) return rowInAll;
    	rowInAll = _x;
    	return this;
    };

    exports.row=function(_x){
    	if(!arguments.length) return rowInPage;
    	rowInPage = _x;
    	return this;
    };

    exports.page=function(_x){
    	if(!arguments.length) return pageInTab;
    	pageInTab = _x;
    	return this;
    };

    exports.updateTab=function(_x){
    	if(!arguments.length) return currentTab;
    	currentTab = _x;
    	
    	return this;

    };

    exports.pageclickFun=function(_x){
    	if(!arguments.length) return pageClickEvent;
    	pageClickEvent = _x;
    	return this;

    };




	return exports;
})()