//t.value = (mean(data) - 10) / (sd(data) / sqrt(length(data))) 
//p.value = 2*pt(-abs(t.value), df=length(data)-1)
//
//
	function find_lesser_in_arr(needle,haystack){
		for(var i=haystack.length-1;i>=0;i--){
			if(needle>=haystack[i])return haystack[i];
		}return haystack[0];
	}

	function round4(num){
		var num_digs = 3;
		if(num>=100000000)return 'Inf';
		else if(num<=-100000000)return '-Inf';
		else if(Math.abs(num)>=100) num_digs -= 2;
		else if(Math.abs(num)>=10) num_digs -= 1;
		return Math.round(num*Math.pow(10,num_digs))/Math.pow(10,num_digs);
	}

	function trapezoid_reverse(inp_func,a,p,max_p,max_stat,add_prec){
		var max_p = (max_p == null) ? 0.5 : max_p;
		var max_stat = (max_stat == null) ? 300 : max_stat;
		var add_prec = (add_prec == null) ? 1 : add_prec;
		if(p==max_p)return 'Inf';

		var trap_sum = 0, gap_width = p / (add_prec * 1250.0);
		var i = a, last_func = inp_func(a);
		while(trap_sum < 2500 * add_prec && i < max_stat){
			i += gap_width;
			trap_sum += last_func;
			last_func = inp_func(i);
			trap_sum += last_func;
		}
		return i;
	}

	function trapezoid_rule(inp_func,a,b,df){
		//console.log("in trapezoid_rule: a="+a+" b="+b+" df="+df);

		if(a==b)return 0;

		var trap_sum = 0;
		for(var i=1;i<1000;i++) {
			//console.log("i="+i+" trap_sum="+trap_sum);
			trap_sum += inp_func(a + i*(b-a)*0.001, df);
		}
		return 0.0005*Math.abs(b-a)*(inp_func(a, df)+inp_func(b, df)+2*trap_sum);
	}


//--------------------------------------------------
	function convertTvalue2Pvalue(df, tval) {
		if(tval.length==0) tval = 0;
      if(!isNaN(tval)) {
			cur_tval = Math.min(Math.max(parseFloat(tval),-500),500);
         //std_p = compute_pvalue(cur_t);
         //console.log("in convertTvalue2Pvalue: cur_tval="+cur_tval);
         std_p = trapezoid_rule(cur_dist,0,cur_tval,df);
			//console.log("std_p="+std_p);
			pval = post_adjust_pvalue(std_p, 2, cur_tval);
			//console.log("pval="+pval);
         return pval;
		}
	}

	function post_adjust_pvalue(inp_p, tails, tval){
      if(tails==1) cur_p = 1-2*inp_p;
      else if((tails==2 && tval>=0) || (tails==3 && tval<=0)) cur_p = 0.5-inp_p;
      else if((tails==3 && tval>=0) || (tails==2 && tval<=0)) cur_p = 0.5+inp_p;
      else if( tails==4) cur_p = inp_p;
      else cur_p = 2*inp_p;
      //document.getElementById('pValue').value = round4(cur_p);
		//return round4(cur_p);

		if(tval < 0) 
			cur_p = 1 - cur_p;
	
		if(cur_p <=0) {
			return -10;
		} else {
			return 0 - Math.log10(cur_p);
		}
   }


	function double_fac(n){
      if((n <= 1)) return 1;
      else return n*double_fac(n-2);
   }

	var cur_dist = function(x,df){
		//console.log("in cur_dist: x="+x+" df="+df);

      if(df>300){
         return 0.3989422804014326779*Math.exp(-x*x*0.5);
      }else{
         var coeff = double_fac(df-1) / (Math.sqrt(df) * double_fac(df-2) * (df % 2 == 0 ? 2 : Math.PI));
         return coeff*Math.pow(1+x*x/df,-0.5*(df+1));
      }
   }

