//d3.pageTab table natiation bar
//d3.tableView table windows
//d3.tableModule encapsulate both

//table naviation bar
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
                        .style('cursor',"pointer")
                        .style('fill','#ffffff');
        button.append('rect')
              .attr('width',buttonWidth)
              .attr('height',buttonHeight)
            
              .style('stroke','#000000')
        button.filter((d)=>d.page===newTabs[0].page)
              .style('fill','#e0e2e5');

        pageClickEvent(newTabs[0].range);

        button.on('mouseover',function(g){
                 d3.select(this).select('rect').style('fill','#a4c5fc');
              }).on('mouseout',function(g){

                  d3.select(this).select('rect').style('fill',null);
              }).on('click',(g)=>{
                button.style('fill','#ffffff')
                if(typeof g.range === 'number'){
                    dispatcher.call('updateTab',this,g.range);
                    
                }else{
                    button.filter((d)=>d.page===g.page).style('fill','#e0e2e5')
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
        if(_x>0) rowInAll = _x;
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

//table windows View
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

    exports.rowColor = function(colorMap){
        if(!arguments.length) return rowColor;
        rowColor = (i) => colorMap[i]?colorMap[i]:((i)=>{return i%2?"ffffff":'#e0e2e5'})(i);
        return this;
    };

	return exports;

})();


//encapsulate above module
d3.tableModule = (function(){
    var tabFun = d3.pageTab,
        tableFun = d3.tableView,
        colorMap = {};

    
    function exports(_selection){
        if(!tableFun.tableData()) return;
        
        let tabNavigator = _selection.append('g').attr('id','tabs');
        let tableView = _selection.append('g').attr('id','tableView').attr('transform','translate(0,25)')
        
        tabFun = tabFun.pageclickFun((range)=>{
            let newColorMap = Object.keys(colorMap).filter((r)=>range.includes(+r)).reduce((acc,d)=>{acc[d%tabFun.row()]=colorMap[d]; return acc},{})
            
            tableView.call(tableFun.rowFilter((r,i)=>range.includes(i)).rowColor(newColorMap))
        });
        tabNavigator.call(tabFun);
    };

    //Getter and Setter;
    exports.tableData = function(data){
        if(!arguments.length) return tableFun.tableData();
        tableFun = tableFun.tableData(data);
        tabFun = tabFun.rowTotal(data.length).row(20).page(10);
        return this;
    };
    //Getter and Setter;
    exports.columnList = function(cols){
        if(!arguments.length) return tableFun.columnList();
        tableFun = tableFun.columnList(cols);
        return this;
    }

    exports.rowColor = function(colorMaps){
        if(!arguments.length) return colorMap;
        colorMap = colorMaps;
        return this;
    }

    return exports

})()
