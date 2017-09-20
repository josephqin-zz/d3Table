d3.plotPanel = (function(){
	'use strict';
	//predefiend the data for test 
	var groupData ={
		groupList:{},
		selectedRow:[],
		relationship:{},
		rowsViewID:d3.range(0,25)
		},
		sampleData = new Array,
		mavenData = new Array,
		groupMap = {},
		getDataURL = "http://10.4.1.60/mtb/getData.php"

	var randomColor = ()=>'#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);

    //private function calculate the cohor groups resulte on fly
	function getVolcanoData(cohorGroups,groups){

		return cohorGroups.map((g)=>{

			let volc_item = {};	
			let vals1 = g.values.filter((l)=>l.key===groups[0])
			let vals2 = g.values.filter((l)=>l.key===groups[1])

			if( vals1.length>0 && vals2.length>0 ) {


				let cohor1 = vals1[0].values.map((v)=>Number(v.areatop)).filter((t)=>typeof t !=='undefined' && !isNaN(t) )
				let cohor2 = vals2[0].values.map((v)=>Number(v.areatop)).filter((t)=>typeof t !=='undefined' && !isNaN(t) )

				if( cohor1.length>0 && cohor2.length>0){
					volc_item.name = g.key
					volc_item.rawdata = [...vals1[0].values,...vals2[0].values];
					let mean1 = d3.mean(cohor1);
					let mean2 = d3.mean(cohor2);
					if(mean2 != 0 && Math.abs(mean2)>0) {
						volc_item.x = Math.log2(mean1/mean2);
						let tval = ss.tTestTwoSample(cohor1, cohor2, 0);
						let logPvalue = convertTvalue2Pvalue(cohor1.length-1, tval);
						volc_item.y = logPvalue;

					} else {
						volc_item.x = 0;
						volc_item.y = 0;
					}

				}

			}
			return volc_item; 
		}).filter((v)=> Object.keys(v).length>0 && typeof v.y !== 'undefined');
	}
     
	function exports(_selection){
		//default setting the chosed group as the first two groups
		if (Object.keys(groupData.groupList).length>=2 && Object.values(groupData.groupList).filter((d)=>d.selected).length<2){
			Object.keys(groupData.groupList).slice(0,2).map((d)=>groupData.groupList[d].selected=true);
		};
        
        //groupMap keeps the sample_id=>group_name relationship
        //chohorData stores the selected mavendataset
		// let groupMap = d3.entries(groupData.relationship).reduce((acc,rl)=>{
		// 	let sampleMap = sampleData
		// 	.filter((d,i)=>rl.value.includes(i)).map((d)=>d.sample_id)
		// 	.filter((d,i,self)=>self.indexOf(d)===i)
		// 	.reduce((a,s)=>{a[s]=rl.key;return a},{});
		// 	return Object.assign(acc , sampleMap);
		// },{})
		

		//define panel dispatcher
		let dispatcher = d3.dispatch('updateUI','selectGroup','unselectGroup','barUI','lineUI')
		
		dispatcher.on('selectGroup',function(groupName){
			if (Object.values(groupData.groupList).filter((d)=>d.selected).length<2) groupData.groupList[groupName].selected=true;
			dispatcher.call('updateUI',this,groupData);
		});

		dispatcher.on('unselectGroup',function(groupName){
			groupData.groupList[groupName].selected=false;
			dispatcher.call('updateUI',this,groupData);

		})

		dispatcher.on('barUI',function(bardata){
        	barView.selectAll('*').remove();
        	lineView.selectAll('*').remove();
        	
        	barView.call(barFn.bindData(bardata));
        })

        dispatcher.on('lineUI',function(rawdata){
        	lineView.selectAll('*').remove();
        	//get peakIds from choosen group
        	let peakIds = rawdata.map((d)=>d.peak_id).filter((d,i,self)=>self.indexOf(d)===i)
        	d3.json(getDataURL+'?type=mtb_chromat&peak_ids='+peakIds.join(','),function(error,data){
        		if(error) return;
        		let lines = data.data.values.map((d)=>{
            				  	let line = {};
            				  	line.name = d.sample_name;
            				  	let x = d.eic_rt.split(',').map((d)=>Number(d))
            				  	let y = d.eic_intensity.split(',').map((d)=>Number(d))
            				  	line.values = x.map((t,i)=>{
            				  		return {x:t,y:y[i]}
            				  	}).filter((c)=>c.x>=Number(d.min_rt)&&c.x<=Number(d.max_rt))
            				  	return line;
            				  });
        		lineView.call(lineFn.bindData(lines));
        	})
        	
        })

		

   
		groupMap = Object.keys(groupData.relationship).reduce((acc,g)=>groupData.relationship[g].reduce((a,s)=>{a[s]=g;return a},acc),{})
        
        //append UI framework
        let groupView = _selection.append('g').attr('id','groupSelectView');
		let vlcView = _selection.append('g').attr('id','vlcView').attr('transform',d3.zoomIdentity.translate(0,30))
		let barView = _selection.append('g').attr('id','barView').attr('transform',d3.zoomIdentity.translate(800,30))
		let lineView = _selection.append('g').attr('id','lineView').attr('transform',d3.zoomIdentity.translate(1600,30))
		
		//prepare the UI Fn
		let vlcFn = d3.volcanoPlot.clickEvent(function(d,i){dispatcher.call('barUI',this,d.rawdata)})
        let barFn = d3.barPlot.groupMap(groupMap).groupList(groupData.groupList).clickEvent(function(d,i){dispatcher.call('lineUI',this,d.rawdata)})
        let lineFn = d3.linePlot
        let groupViewFn = d3.groupView.bindData(groupData)
							.horizontalLayOut(true)
							.clickEvent(function(d,i){dispatcher.call('selectGroup',this,d.key)})
							.dblclickEvent(function(d,i){dispatcher.call('unselectGroup',this,d.key)});
        
        //default view
        groupView.call(groupViewFn)
       
        d3.json(getDataURL+'?type=maven_dataset_by_sample_id&sample_ids='+Object.values(groupData.relationship).reduce((acc,d)=>[...acc,...d],[]).join(','),function(data){
        	let cohortData = d3.nest()
							.key((d)=>d.hasOwnProperty('compound')?d.compound:d.group_id)
							.key((d)=>groupMap[d.sample_id])
							.entries(data.data.values.filter((d)=>Object.keys(groupMap).map((d)=>+d).includes(d.sample_id)))
        	
            dispatcher.on('updateUI',function(groupData){
			groupView.selectAll('*').remove();
			vlcView.selectAll('*').remove();
			barView.selectAll('*').remove();
			lineView.selectAll('*').remove();
			//which two groups are selected by user
			let groups = Object.values(groupData.groupList).filter((d)=>d.selected).map((d)=>d.name)
			groupView.call(groupViewFn.bindData(groupData));
            //only two groups are selected the volcanPlot would be intrigered
            if(groups.length===2){vlcView.call(vlcFn.bindData(getVolcanoData(cohortData,groups)))}
			})
            

        	
        	vlcView.call(vlcFn.bindData(getVolcanoData(cohortData,Object.values(groupData.groupList).filter((d)=>d.selected).map((d)=>d.name))))
        })
         
        
		
       
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
    exports.getdataURL = function(url){
    	if(!arguments.length){return getdataURL;}
		getdataURL = data;
		return this;
    }

	exports.groupData = function(data){
		if(!arguments.length){return groupData;}
		data.forEach((d,i)=>{
			groupData.groupList[d.cohort]={name: d.cohort, color: randomColor(i), selected: false};
			groupData.relationship[d.cohort]=d.sample_id.split(',').map((t)=>Number(t));
		})
		
		return this;
	};	

	return exports;
})()