import d3 from 'd3';
var groupData = {
		       groupList:{},
		       selectedRow:[],
		       relationship:{}
   	    	};
var cellWidth = 200,
  	cellHeight = 25,
  	horizontalLayOut = false;


  	function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
	}

    //distinguish click && doubleclick
		function clickcancel() {
		 
		  var dispatcher = d3.dispatch('click', 'dblclick');
		  function cc(selection) {
		      var down, tolerance = 5, last, wait = null, args;
		      // euclidean distance
		      function dist(a, b) {
		          return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
		      }
		      selection.on('mousedown', function() {
		          down = d3.mouse(document.body);
		          last = +new Date();
		          args = arguments;
		      });
		      selection.on('mouseup', function() {
		          if (dist(down, d3.mouse(document.body)) > tolerance) {
		              return;
		          } else {
		              if (wait) {
		                  window.clearTimeout(wait);
		                  wait = null;
		                  dispatcher.apply("dblclick", this, args);
		              } else {
		                  wait = window.setTimeout((function() {
		                      return function() {
		                          dispatcher.apply("click", this, args);
		                          wait = null;
		                      };
		                  })(), 300);
		              }
		          }
		      });
		  };
		  // Copies a variable number of methods from source to target.
		  var d3rebind = function(target, source) {
		    var i = 1, n = arguments.length, method;
		    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
		    return target;
		  };

		  // Method is assumed to be a standard D3 getter-setter:
		  // If passed with no arguments, gets the value.
		  // If passed with arguments, sets the value and returns the target.
		  function d3_rebind(target, source, method) {
		    return function() {
		      var value = method.apply(source, arguments);
		      return value === source ? target : value;
		    };
		  }
		  return d3rebind(cc, dispatcher, 'on');
		}


	//module behavior
	var clickEventFn = function(d,i){console.log('single click')} 
    var dblclickEventFn = function(d,i){console.log('double click')}	    	

	var groupView = function (_selection){
		_selection.selectAll('*').remove()
		var cc = clickcancel();
		cc.on('click',clickEventFn);
		cc.on('dblclick',dblclickEventFn);
		let rowTransform = d3.zoomIdentity;
		let group = _selection.selectAll('g')
				  .data(d3.entries(groupData.relationship))
				  .enter()
				  .append('g')
				  .attr('id',(g)=>g.key)
				  .attr('transform',(d,i)=>horizontalLayOut?rowTransform.translate((cellWidth+5)*i,0):rowTransform.translate(0,(cellHeight+5)*i))
				  
				  .each(function(g,i){
				  	let rectColor = groupData.groupList[g.key].color;
				  	let textColor = invertColor(rectColor,true);
				  	let rectBox = d3.select(this).append('rect')
				    	   .attr("width", cellWidth)
				           .attr("height", cellHeight)
				           .style("fill",rectColor)
				    if(horizontalLayOut){
				    	rectBox.style('stroke-width',(d,i)=>groupData.groupList[d.key].selected?3:null)
				  			   .style('stroke',(d,i)=>groupData.groupList[d.key].selected?'#000000':null);
				    }       
				           

				    d3.select(this).append('text')
				    			   .text(g.key+' has '+g.value.length.toString()+' samples')
				    			   .style('fill',textColor)	
		    				       .attr('x',cellWidth/2)
		    					   .attr('y',cellHeight/2)
		    				       .style('dominant-baseline','middle')
		    				       .style('text-anchor','middle')
				  })
				  .call(cc);
				 

	}
    
    groupView.bindData = function(data){
    	if(!arguments.length) return groupData;
    	groupData = data;
    	return this;
    }
    groupView.clickEvent = function(fn){
    	if(!arguments.length) return clickEventFn;
    	clickEventFn=fn;
    	return this;
    }
    groupView.dblclickEvent = function(fn){
        if(!arguments.length) return dblclickEventFn;
        dblclickEventFn=fn
        return this;
    }
    groupView.horizontalLayOut = function(flag){
    	if(!arguments.length) return horizontalLayOut;
        horizontalLayOut = flag;
        return this;
    }

export default groupView;