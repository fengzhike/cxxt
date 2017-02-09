simpledatepickerJs = {
	init:function(){
		var me = simpledatepickerJs;
		jQuery.fn.extend({datepicker:me.extend});
	},extend:function(options){
		var nowDt,$el,now,sd,ed,y,i,y120,ct,c,min,max,bind,getY1,getY2,getM,getD,ymd,$selVal,$y1,m,mText,disp,toHide;
		mText = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
		$el = $(this);
		
		nowDt = new Date();
		now = {y:nowDt.getFullYear(), m:nowDt.getMonth()+1, d:nowDt.getDate()};

		ymd = $.extend({}, now);
		ct = $('<div class="smpDatePicker-overlay" style="display:none;"><div class="smpDatePicker"><div class="h"><a class="preBtn" direction="left"></a><a class="selVal">2008-2009</a><a class="nextBtn" direction="right"></a></div></div></div>')
		;
		// .appendTo(document.body);
		var c = $('<div class="c">').appendTo(ct.find('.smpDatePicker'));
		var showStack = [];
		sd = now.y - 120,ed = now.y+11;
		getY1 = function(){
			y120 = [];
			var i=0;
			for(y = sd; y <= now.y; y+=12){
				if( now.y+ 11 >= y && y >= now.y){
					y120.push([
					'<a class="sel">',
						y,
						'<br>|',
						'<br>',
						(y+11),
					'</a>'
					].join(''));
					continue;
				}
				y120.push([
					'<a>',
						y,
						'<br>|',
						'<br>',
						(y+11),
					'</a>'
				].join(''));
			}
			return $('<div class="y1" next="y2">'+y120.join('')+'</div>').appendTo(c);
		};
		var currentT;
		var show = function($p, $t, $lt){
			currentT = $t.show();
			showStack.push($t);
			if($t.is('.d')){
				$selVal.text([tmp.y,'年', tmp.m, '月'].join(''));
			} else {
				$selVal.text($lt.text().replace('|', '-'));	
			}
		};
		var tmp = {};
		$selVal = ct.find('.selVal').text([sd, ed].join('-'));
		var of;
		disp = function(){
			var initVal = $.trim($el.val());
			$selVal.text([sd, ed].join('-'));
			ct.find('.y2,.m,.d').remove();
			if(!of){
				of = $el.offset();
				of.top += $el.height()+10;
//				ct.find('.smpDatePicker').offset({top:of.top});
			}
			if(initVal != ''){
				initVal = initVal.split('-');
				tmp.y = Number(initVal[0]);
				tmp.m = Number(initVal[1]);
				var min = Number(sd+ Math.floor((tmp.y-sd)/12)*12);
				var max = min + 12;
				var y2 = getY2(min, max);
				var d  = getD();
				showStack.push($(y2).appendTo(c));
				showStack.push(m.appendTo(c));
				showStack.push($(d).appendTo(c).show());
				$selVal.text([tmp.y,'年', tmp.m, '月'].join(''));
			}
			ct.show();		
		};
		bind = function(isBind){
			$el.unbind('click');
			ct.unbind('click').undelegate();
			c.undelegate();
			if(!isBind){
				return;
			}
			setTimeout(function(){
				bind();
				$el.click(disp);
				ct.click(function(e){
					console.log([e.target.className, this.className]);
					if(e.target.className ==  "smpDatePicker-overlay"){
						ct.hide();
					}
				});
				c.delegate('a', 'vclick', function(){
				var $a = $(this),$t,val;
				var $p = $a.parent();
				var next = $p.attr('next'); 
				if(next != null){
					c.find('.'+next).remove();
				}
				$a.addClass('sel').siblings('.sel').removeClass('sel');
				val = $a.text();
				switch(next){
					case 'y2':
						val = val.split(/\D/g);
						var min = Number(val[0]);
						var max = Number(val[val.length-1]);
						$t = $(getY2(min, max)).appendTo(c);
						bind(true);
						break;
					case 'm':
						tmp.y = Number(val);
						$t = $(m).appendTo(c);
						bind(true);
						break;
					case 'd':
						tmp.m  = Number($a.attr('m'))+1;
						$t = $(getD()).appendTo(c);
						bind(true);
						break;
					default:
						$el.val([tmp.y, tmp.m, val].join('-'));
						 ct.fadeOut(500);
						return;
				}
				show($p, $t, $a);
			});
			ct.delegate('a[direction]', 'vclick', function(){
				var dr = $(this).attr('direction');
				var $d = showStack[showStack.length-1], $d2;
				if(!$d){
					return;
				}
				bind(true);
				var diff;
				if(dr == 'left'){
					diff = -1;
				
				} else {
					diff = 1;
				}
				if($d.is('.y2')){
					var min = Number($d.find('a:first').text())+diff*12;
					if(min < sd){
						return;
					}
					var max = Number($d.find('a:last').text())+diff*12;
					if(max > ed){
						return;
					}
					showStack[showStack.length-1] = $d2 = $(getY2(min, max));
					$d.replaceWith($d2);
					$selVal.text([min, max].join('-'));
				} else if($d.is('.m')){
					var val = tmp.y + diff;
					if(val < sd || val > ed){
						return;
					}
					tmp.y = val;
					$selVal.text(val);
				} else if($d.is('.d')){
					var val = tmp.m + diff;
					if(val == 0){
						val = 12;
						tmp.y -=1;
					} else if(val == 13){
						val = 1;
						tmp.y +=1;
					}
					tmp.m = val;
					showStack[showStack.length-1] = $d2 = $(getD());
					$d.replaceWith($d2);
					$selVal.text([tmp.y,'年', val, '月'].join(''));
				}
			});
			ct.delegate('.selVal', 'vclick', function(){
				var $d = showStack.pop();
				var $l;
				if($d!= null){
					bind(true);
					var $d2 = showStack[showStack.length-1];
					if($d2){
						var next = $d2.attr('next');
						switch(next){
							case 'm':
								var min = sd + Math.floor((tmp.y-sd)/12)*12;
								var max = min+11;
								$d2.html($(getY2(min, max)).html());
								$selVal.text([min, max].join('-'));
								break;
							case 'd':
								$selVal.text(tmp.y);
								break;	
						}
					} else {
						$selVal.text([sd, ed].join('-'));
					}
					$d.hide();
				}
			});
			}, 500);
		};
		getY2 = function(min, max){
			var y=min,html = ['<div class="y2" next="m">'];
			while(y <= max){
				html.push([
					'<a>',
						y++,
					'</a>'
				].join(''));
			}
			html.push('</div>');
			return html.join('');
		};
		getM = function(){
			var i = 0, html = ['<div class="m" next="d">'];
			while(i < 12){
				html.push([
					'<a m="',i,'">',
						mText[i++],
					'</a>'
				].join(''));
			}
			html.push('</div>');
			return html.join('');
		};
		getD = function(){
			var m = tmp.m, y = tmp.y;
			console.log(tmp);
			var maxD = new Date(y, m, 0).getDate();
			var i = 1, html = ['<div class="d">'];
			while(i <= maxD){
				html.push([
					'<a>',
						i++,
					'</a>'
				].join(''));
			}
			html.push('</div>');
			return html.join('');
		};
		bind(true);
		$y1 = getY1();
		m = $(getM());
		return ct;
	}
};