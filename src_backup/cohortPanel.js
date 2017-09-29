	d3.cohortPanel = (function(){
		'use strict';
		var cellWidth = 250,
			cellHeight = 25;
		var groupData ={
			groupList:{},
			selectedRow:[],
			relationship:{},
			rowsViewID:d3.range(0,25)
		};

		var menus = [
			{'name':'Cohort Selector','color':'#0B3C5D'},
			{'name':'Volcano Plot','color':'#328CC1'}
			
		]

		var sampleData = new Array;
		var mavenData = new Array;
		var columnList = new Array;   	
		function exports(_selection){
            let dispatcher = d3.dispatch('CohortSelector','VolcanoPlot');
			let groupSelector = d3.groupSelector.groupData(groupData).tableData(sampleData).tableColumns(columnList)
            let plotPenal = d3.plotPanel.sampleData(sampleData).mavenData(mavenData).groupData(groupData)
            let menuBar = _selection.append('g').attr('id','menuBar')
			.selectAll('g')
			.data(menus)
			.enter()
			.append('g')
			.attr('id',(d)=>d.name)
			.each(function(d,i){
				d3.select(this).attr('transform','translate('+cellWidth*i+', 0)')
				d3.select(this).append('rect')
				.attr('width',cellWidth)
				.attr('height',cellHeight)
				.style('fill',d.color)
				d3.select(this).append('text')
				.text((d)=>d.name)
				.style('fill','#ffffff')	
				.attr('x',cellWidth/2)
				.attr('y',cellHeight/2)
				.style('dominant-baseline','middle')
				.style('text-anchor','middle')
			})
			.on('click',function(d){
				dispatcher.call(d.name.replace(' ',''),this);
			})

			let mainWin = _selection.append('g').attr('id','mainWin').attr('transform',d3.zoomIdentity.translate(5,30))
            dispatcher.on('CohortSelector',function(){
            	mainWin.selectAll('*').remove();
            	mainWin.call(groupSelector)
            })

            dispatcher.on('VolcanoPlot',function(){
            	mainWin.selectAll('*').remove();
            	mainWin.call(plotPenal);
            	
            })
			mainWin.call(groupSelector)
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