/**
 * Created by lchysh on 14-12-17.
 */

(function(module){
    (function() {

        var lastTime = 0;
        var vendors = ['webkit', 'moz','ms','o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // name has changed in Webkit
            window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }());
})(window.jQuery || window);
/**
 * Created by lchysh on 14-12-16.
 */
(function (module) {
    function drawLine(ctx, points, opt) {
        ctx.save();
        ctx.beginPath();

        var point = points[0];
        var count = points.length;

        ctx.moveTo(point[0], point[1]);
        var i = 1;
        for (; i < count; i++) {
            point = points[i];
            ctx.lineTo(point[0], point[1]);
        }

        if (count > 2) {
            point = points[0];
            ctx.lineTo(point[0], point[1]);
        }

        ctx.closePath();
        if (!opt.fill) {
            ctx.strokeStyle = opt.color;
            ctx.stroke();
        } else {
            ctx.fillStyle = opt.color;
            ctx.fill();
        }

        ctx.restore();
    }

    function getPoints(d, a, l) {
        var points = [], i = 0, tx, ty, ta;
        for (; i < l; i++) {
            ta = -Math.PI / 2 + i * a;
            tx = formatNum(d * Math.cos(ta));
            ty = formatNum(d * Math.sin(ta));
            points.push([tx, ty]);
        }
        return points;
    }

    function formatNum(val) {
        return Number(val.toFixed(2));
    }

    function getScales(vals) {
        var i = 1, l = vals.length;
        var max = vals[0];
        var tmp;
        for (; i < l; i++) {
            tmp = vals[i];
            max = Math.max(max, tmp);
        }
        var steps = 5, unitStep = 10;
        var step = Math.ceil(max / (unitStep * (steps - 1))) * unitStep;
        max = step * (steps - 1);
        return {max: max, step: step, steps: steps};
    }

    function getRealPoints(a, l, vals, scaleCfg) {
        var i, d = scaleCfg.outD;
        var max;
        max = scaleCfg.max;
        var points = [], tx, ty, ta, td;
        i = 0;
        for (; i < l; i++) {
            ta = -Math.PI / 2 + i * a;
            td = d * vals[i] / max;
            tx = formatNum(td * Math.cos(ta));
            ty = formatNum(td * Math.sin(ta));
            points.push([tx, ty]);
        }
        return points;
    }

    function drawSteps(ctx, stepDs, cfg) {
        ctx.save();
        var steps = cfg.steps, i = 0;
        var step = cfg.step, txt, point;
        for (; i < steps; i++) {
            txt = Math.floor(step * i) + '';
            point = [0, -stepDs[i] + 5];
            ctx.fillText(txt, 10, point[1]);
        }
        ctx.restore();
    }

    function drawLables(ctx, points, opt) {
        var labels = opt.labels;
        var font = opt.font;
        ctx.save();
        var i = 0, count = points.length, label, point, w, x, y;
        for (; i < count; i++) {
            label = labels[i];
            w = ctx.measureText(label.txt).width;
            point = points[i];
            x = point[0];
            y = point[1];
            if (x < 0) {
                x -= w;
            } else if (x > 0) {
                x += 0;
            } else {
                x = -w / 2;
            }
            var dy = font.offset.y;
            if (y > 0) {
                y += font.size + dy;
            } else if (y < 0) {
                y -= dy;
            }
            ctx.font = opt.fontStyle;
            ctx.fillStyle = label.color;
            ctx.fillText(label.txt, x, y);
        }
        ctx.restore();
    }

    module.radarChartJs = {
        init: function (opt) {
            var ret = {};
            var size = opt.size || {};
            var labelWidth = opt.labelWidth;
            var outD, cx, cy, data, vCount, steps = opt.steps, angle, ctx, i;
            var canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
            var font = opt.font;
            opt.fontStyle = ctx.font = [font.size, 'px', ' ', font.family].join('');
            console.log(ctx.font);
            canvas.width = size[0] || 0;
            canvas.height = size[1] || 0;
            outD = Math.ceil(Math.min(canvas.width - labelWidth * 2,
                canvas.height - (font.size + font.offset.y) * 2) / 2);
            cx = (canvas.width) / 2;
            cy = (canvas.height) / 2;
            ctx.translate(cx, cy);
            data = opt.data;
            var list = data[0];
            // 顶点数目
            vCount = list.length;
            var stepDs = [0], stepD;
            // steps 圈正多边形线
            var points;
            angle = 2 * Math.PI / vCount;
            i = 1;
            var polygons = [];

            for (; i <= steps; i++) {
                stepD = formatNum(outD * i / steps);
                stepDs.push(stepD);
                points = getPoints(stepD, angle, vCount);
                polygons.push(points);
            }
            var outPolygon = points;
            // 刻度距中心距离
            var outDLines = [];
            // 外层顶点到中心连线
            i = points.length - 1;
            for (; i > -1; i--) {
                outDLines.push([[0, 0], points[i]]);
            }
            var scaleCfg = getScales(list);
            scaleCfg.outD = outD;
            // 实际值
            var realPoints = getRealPoints(angle, vCount, list, scaleCfg);
            ret.canvas = canvas;
            ret.draw = function (animateCfg) {
                if(animateCfg){
                    ctx.clearRect(-cx, -cy, size[0], size[1]);
                }

                var i;
                // 绘制多边形
                i = polygons.length - 1;
                for (; i > -1; i--) {
                    drawLine(ctx, polygons[i], {color: opt.baseColor});
                }
                // 绘制legend
                drawLables(ctx, outPolygon, opt);
                // 绘制外径线
                i = outPolygon.length - 1;
                for (; i > -1; i--) {
                    drawLine(ctx, outDLines[i], {color: opt.baseColor});
                }
                // 刻度值
                drawSteps(ctx, stepDs, scaleCfg);
                if (animateCfg) {
                    var speed = animateCfg.speed || 0.01, tmpD = animateCfg.tmpD || speed * outD;
                    //i =0;

                    var aCount = animateCfg.aCount || 0;
                    if (tmpD >= outD) {
                        tmpD = outD;
                    }
                    aCount++;
                    scaleCfg.outD = tmpD;
                    realPoints = getRealPoints(angle, vCount, list, scaleCfg);
                    drawLine(ctx, realPoints, {color: opt.chartColor, fill: true});
                    if (tmpD >= outD) {
                        return;
                    }
                    tmpD += speed * outD + 0.1 * aCount * aCount;
                    animateCfg.tmpD = tmpD;
                    animateCfg.speed = speed;
                    animateCfg.aCount = aCount;
                    ret.animateId = requestAnimationFrame(function () {
                        ret.draw(animateCfg);
                    });
                } else {
                    // 绘制实际数据线
                    drawLine(ctx, realPoints, {color: opt.chartColor, fill: true});
                }

                return ret;
            };
            return ret;
        }
    };
})(window.jQuery || window);
// 智能机浏览器版本信息:
var browser={
    versions:function(){ 
           var u = navigator.userAgent; 
			var ret = {};
			ret.webKit = u.indexOf('AppleWebKit') > -1;
            ret.uc = u.indexOf('UCBrowser') > -1;
			ret.android = u.indexOf('Android') > -1 || (u.indexOf('UCBrowser')> -1 && u.indexOf('Linux;')> -1);
			ret.iosMobile = !!navigator.userAgent.match(/iPhone|iPad|iPod/i);
			ret.mobile = ret.iosMobile || ret.android || !!navigator.userAgent.match(/IEMobile/i) 
			|| !!navigator.userAgent.match(/Opera Mini/i) 
			|| !!navigator.userAgent.match(/BlackBerry/i);
			return ret;
         }()
};
// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});
    while (length--) {
        method = methods[length];
        // Only stub undefined methods.
        if(location.host == "m.euming.com"){
            console[method] = noop;
        } else {
            if (!console[method]) {
                console[method] = noop;
            }
        }
    }
}());

// 命名空间 viewJs
(function($) {
	$.support.filereader = !!(window.File && window.FileReader && window.FileList && window.Blob);
	$.getJs = function(options){
		var ns = options.ns || window;
		var varName = options.varName;
		var ajaxOpt = options.ajaxOpt;
		if(ns[varName]){
			if($.isFunction(ajaxOpt.success)){
				ajaxOpt.success();
			}
		} else {
			$.cachedScript(options.url, ajaxOpt);
		}
	};
	$.cachedScript = function( url, options ) {
	  options = $.extend( options || {}, {
		dataType: "script",
		cache: true,
		url: url
	  });
	  return $.ajax( options );
	};
	$.getCss = function(options){
		var id = options.id;
		var ajaxOpt = options.ajaxOpt;
		if(document.getElementById(id) != null){
			if($.isFunction(ajaxOpt.success)){
				ajaxOpt.success();
			}
		} else {
			var success = ajaxOpt.success;
			ajaxOpt.success = function(text){
				$([
					'<style type="text/css" id="',id,'">',
						text,
					'</style>'
				].join('')).appendTo(document.head)
				if($.isFunction(success)){
					success();
				}
			};
			$.cachedCss(options.url, ajaxOpt);
		}
	};
	$.cachedCss = function( url, options ) {
	  var options = $.extend( options || {}, {
		dataType: "text",
		cache: true,
		url: url
	  });
	  return $.ajax( options );
	};
}(jQuery));
jQuery.fn.extend({
    clearVal:function(val)
    {
        // for IE, Opera, Safari, Chrome
		var el = this[0];
		if (el.outerHTML) {
			 el.outerHTML = el.outerHTML;
		 } else { // FF(包括3.5)
			 el.value = "";
		 }	
    }
})
$(function(){
	var getResizeStyle = function(){
		var WH = $(window).height();
		return [
		'.fullScreen.ui-page,.fullScreen{min-height:',WH,'px;}',
		'.ui-page>.ui-content{min-height:',WH-120,'px;}',
		'.fullScreen.ui-page .content{min-height:',WH-80,'px;}',
		'.fullScreen.ui-page .content textarea.single{min-height:280px;width:100%;}'
		].join('');
	};
	$(['<style id="fullScreenStyle">',getResizeStyle(), '</style>'].join('')).appendTo(document.head);
	$(window).on( "throttledresize", function(){
		$('#fullScreenStyle').html(getResizeStyle());
			//var $p = $.mobile == null ? null : $.mobile.activePage;
			//if($p != null){
			//	$p.find('.fullScreen.ui-page .content textarea.single').css('min-height', $p.height()-80);
			//}
			
	});
});
var viewJs = {};
viewJs.typesetting=function(str){
	if(str == null){
		return '';
	}
	return '&nbsp;&nbsp;&nbsp;'+(str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
};
viewJs.setRem = function($oP){
    var $oHtml = $oP.parents('html');
    var iWidth = document.documentElement.clientWidth;
    (iWidth > 600) && (iWidth = 480);
    $oHtml.css('font-size',iWidth/16);
}
$(function(){
	var $oHtml = $('html');
	var iWidth = document.documentElement.clientWidth;
    (iWidth > 600) && (iWidth = 480);
    $oHtml.css('font-size',iWidth/16);

}())
viewJs.parseTime = function(time){
    var now = new Date(),
        creTime = new Date(time);
    var distance = parseInt((now.getTime() -  creTime.getTime())/1000);
        if(distance < 60){
            return '刚刚';
        }else if(distance < 3600){
            return Math.floor(distance/60) + '分钟前';
        }else if(distance < 3600*24 ){
        	if(now.getDate() - creTime.getDate() === 1){
        		return '昨天'
        	}
            return Math.floor(distance/3600) + '小时前';
        }else if(distance >= 3600*24 && distance < 3600*24*2){
        	if(now.getDate() - creTime.getDate() === 1){
        		return '昨天'
        	}
        	return time.substring(5,10);
        }else if(distance >= 3600*24*2 && now.getYear() === creTime.getYear()){
        	return time.substring(5,10);
        }else{
            return time.substring(0,10);
        }
    
}
viewJs.setSexMarkCls =function(info, $el){
    return ;
	var sexWord;
    //console.log(info);
	if(info.type == '2'){
		sexWord = 'isEnterprise';
	} else {
		sexWord = mainJs.parseSexToWord(info.sex);
	}
	if($el == null){
		return sexWord;
	}
	//$el.removeClass('man woman unkown isEnterprise').addClass(sexWord);
};
viewJs.maskBusy = function(msg, key){
	var showKeys = arguments.callee.showKeys;
	var $a = $('#maskBusy-overlay');
	if($a.length == 0){
		$a = $('<div class="modalWindow" id="maskBusy-overlay"></div>');
		$(document.body).append($a);
		
	}
	var map = arguments.callee.maskMap
	
	var bMsg,sShowKey,bShowkey;
	for(var i = showKeys.length-1; i > -1; i--){
		sShowKey = showKeys[i];
		if(map[sShowKey]){
			bShowkey = true;
			break;
		}
	}
	for(var i = showKeys.length-1; i > -1; i--){
		sShowKey = showKeys[i];
		if(sShowKey == key){
			bMsg = true;
			break;
		}
	}
	if(!bShowkey){
		$a.find('.modal-loading').remove();
	}
	if(bMsg){
        $a.append(['<div id="mask_',sShowKey,'" class="modal-loading ui-footer-fixed">',(msg || '加载中'),'</div>'].join(''));
	}
	$a.show();
	if(key != null){
		map[key] = new Date().getTime();
	}

};
viewJs.maskBusy.maskMap = {};
viewJs.maskBusy.showKeys = ['watchPosition','reading-img','ajaxForm','submitService','pre-reading'];
viewJs.hideBusyMask = function(key){
	var st,bHide=true;
	if(key != null){
		if(viewJs.maskBusy.maskMap != null){
			st = viewJs.maskBusy.maskMap[key];
			delete viewJs.maskBusy.maskMap[key];
		}
		if(viewJs.maskBusy.maskMap != null && !$.isEmptyObject(viewJs.maskBusy.maskMap)){
			bHide = false;
		}
	}
	var difft;
	if(st != null){
		difft = new Date().getTime() - st;
	}
	if(difft != null){
		console.log(key+' cost '+ difft+'ms');
		difft = Math.max(500, 1000 - difft);
	} else {
		difft = 0;
	}
	if(bHide){
		viewJs.maskBusy.maskMap = {};
		$(".modalWindow").hide(difft);
	}
};
$(function(){
	viewJs.loadJs({varName:'loadingJs', url:'/js/plugin/loading/loading.js',title:'loading组件'});
});
viewJs._formatUrlRegex = /https?:\/\/[^(\s)]+\s/g;
viewJs._formatUrlRegex2 = /< ?:\/\/[^(\s)]+\s/g;
viewJs.formatUrl = function(strs) {
		return strs;
 };
viewJs.isLockVerifyIdentity=function(status){
	// 0未验证；1已验证；2等待审核；3验证失败
	return (status == 0 || status == 3) ? null : (status == 1 ? '您已通过身份认证' : '身份认证正在审核中');
};
viewJs.isEnterpriseVerifyIdentity=function(){
	// 0未验证；1已验证；2等待审核；3验证失败
	var user = dmJs.sStore.getUserInfo();
	if(user == null){
		return false;
	}
	user = user.user;
	return user.isIdcardValidated == 1 && user.type ==2;
};
 viewJs.getReviewCmp = function(reviewNumbers, svrGrade, extra){
	var reviewInfo = dmJs.calGrade(reviewNumbers);
	if(reviewInfo.user > 0){
		svrGrade.addClass('isBtn');
	} else {
		svrGrade.removeClass('isBtn');
	}
	var star = svrGrade.find('.star');
	star.empty();
	var i = 0;
	var htmls = viewJs.getStars(reviewInfo);
	star.append($(htmls.join('')));
    if(reviewInfo.grade > 0){
        svrGrade.find('.score').html(Number(reviewInfo.grade).toFixed(1));
    }
    if(reviewInfo.user > 0){
        svrGrade.find('.reviewNumbers').html(reviewInfo.user+'人评价');
    } else {
        svrGrade.find('.reviewNumbers').html('暂无评价');
    }

	svrGrade.data('reviewNumbers', reviewNumbers);
	svrGrade.data('extra', extra);
	return svrGrade;
 };
 viewJs.keepHeight = function(){};
 viewJs.setDfReviewNumbers = function(obj){};
 viewJs.getStars = function(reviewInfo){
	var i = 0, htmls=[];
	for(; i < 5; i++){
		if(i <= reviewInfo.grade-1){
			htmls.push('<div class="starImg full"></div>');
		} else if(i == reviewInfo.halfStar){
			htmls.push('<div class="starImg half"></div>');
		} else {
			htmls.push('<div class="starImg empty"></div>');
		}
	}
	return htmls;
 };
viewJs.formatMoney = function(val){
	return Number(val).toFixed(2);
};
viewJs.fSyncVeryUserStatus = function(newNotify){
    var nl = newNotify.length,type,item;
    if(nl == 0){
        return;
    }
        var userInfo = dmJs.sStore.getUserInfo();
    if(!userInfo){
        return;
    }
    var user = userInfo.user;
    var latestVeryUserStatus = {};
    for(var j = nl-1; j > -1; j--){
        item = newNotify[j];
        type = item.type;
        if(type == 10 || type == 11){
            latestVeryUserStatus = viewJs.fCompareVeryUserCreTime(latestVeryUserStatus, item);
        }
    }
    if(latestVeryUserStatus.creTime){
        dmJs.sStore.syncUser(userInfo.accessToken);
    }
};
viewJs.fCompareVeryUserCreTime = function(item1, item2){
    var t1 = item1.creTime;
    var t2 = item2.creTime;
    // 2014-07-25 14:23:58
    if(!t1){
        return item2;
    }
    if(!t2 || t1 > t2){
        return item1;
    }
    return item2;
};
viewJs.onVRadioChange= function(el){
	var $el = $(el);
	$el.parents('.vRadioGrp:first').find('.selected').removeClass('selected');
	$el.addClass('selected');
};
viewJs.showConfirmFinishPay=function(params, callback, error){
	viewJs.dialogPop('支付已完成？', function(isOK){
            viewJs.afterConfirmFinishPay(params,callback,{isOK:isOK,error:error});
        },'支付确认',
		{noText:'遇到问题',okText:'完成'});
};
viewJs.showUnionPay=function(params, callback){
	var $m = $('#unionPayDialog');
	if($m.length == 0){
		$m = $(['<div id="unionPayDialog"  class="dlgunionPayPop-overlay">',
		'<div class="dlgPop-box ui-footer-fixed">',
		  '<div class="dlg-header">',
			'银联支付',
		  '</div>',
		  '<div class="dlg-content">',
			'<a data-role="button" data-theme="b" id="payByUnionPluginBtn"></a>',
			'<a href="',unionSupport.pluginUrl,'" data-role="button" data-theme="b">下载银联控件</a>',
			'<a data-role="button" data-theme="b" id="finishUnionPayButton">支付完成</a>',
		  '</div>',
		    '</div>',
		'</div>'].join('')).appendTo(document.body);
	}
	
	var tag = unionSupport.generateTag(params.unionpayTn, location.protocol+'//'+location.host+ '/', false);
	$m.find('#payByUnionPluginBtn').replaceWith(tag.attr('id', 'payByUnionPluginBtn'));
	$m.appendTo($.mobile.activePage).enhanceWithin();
	$m.data('params', params);
	$m.find('#finishUnionPayButton').unbind('click').bind('click', function(){
        var _self = arguments.callee;
        if(_self.busy){
            return;
        }
        _self.busy = true;
        setTimeout(function(){ _self.busy = false;},700);
		$m.fadeOut();
		if($.isFunction(callback)){
			viewJs.afterConfirmFinishPay(null, callback);
		} else {
			viewJs.navigator.pre();
		}
	});
	viewJs.top();
	$m.show();
};
viewJs.top = function(){
	$(window).scrollTop(1);
};
viewJs.afterConfirmFinishPay = function(params, callback, opt) {
    var args = arguments;
	dmJs.sStore.syncBalance(function(){
        if(opt){
            if(opt.isOK){
                if($.isFunction(callback)){
                    callback();
                    return;
                }
            } else {
                if($.isFunction(opt.error)){
                    opt.error();
                    return;
                }
            }
            return;
        }
		if($.isFunction(callback)){
            callback.apply(null, args);
			return;
		}
		if(params != null && params.serviceID!= null){
			viewJs.navigator.next({next:{url:'./service.html', id:'startPage',options:{
				data:{serviceID:params.serviceID}
			}}});
		} else {
			viewJs.navigator.next({next:{url:'./', id:'startPage'}});
		}
	});
};
viewJs.createSlideImgs = function(imgs, $ctr, key, orginalSize, isManual){
	var reBind;
	var sliderMap = window['sliderMap'];
	if(sliderMap == null){
		sliderMap = window['sliderMap'] = {};
	}
	var slider = sliderMap[key];
	if(slider == null){
		slider = sliderMap[key] = {};
	} else {
		slider.remove();
		delete sliderMap[key];
		slider = sliderMap[key] = {};
	}
	slider.remove = function(){
		clearTimeout(this.toggleImgHandler);
	};
	var l = imgs.length, i= 0,item, html=[];
	$ctr.empty().html([
			'<div class="slideImgsCtr" style="width:100%">',
			'<div class="slideImgs">',
			'</div>',
			l == 1 ? '' :
			['<table class="imgSliderBtns">',
					'<tbody>',
					'<tr></tr></tbody>',
				'</table>'].join(''),
			'</div>'
		].join(''));
	var $ct = $ctr.find('.slideImgs');
	var w = $(window).width();
	var ci =  0;
	var $ct1 = $ctr.find('.imgSliderBtns tr');
	$ct1.empty();
	var w = $(window).width();
	var h = Math.floor(Math.min(w/orginalSize.width*orginalSize.height,orginalSize.height));
	$ct.height(h);
	for(; i < l; i++){
		item = imgs[i];
		html.push('<div class="slide slider item" style="height:',h,
			'px;left:', 100*0,'%;background-image:url(',item,')" iIndex="',i,'"></div>');
		if(l > 1){
			$ct1.append(['<td class="svrImgSlider',(i==0? " current":""),'" iIndex="',i,'"></td>'].join(''));
		}
	}
	$ct.append(html.join(''));
    function setTrans(val, time){
        var val = val ? val : 0;
        var time = time ? time : 0;
        $(this).css({
            'z-index':9,
            '-webkit-transition':' all '+time,
            '-moz-transition':' all '+time,
            '-ms-transition':' all '+time,
            '-o-transition':' all '+time,
            'transition':' all '+time,
            '-ms-transform':'translateX('+val+')',
            '-moz-transform':'translateX('+val+')',
            '-webkit-transform':'translateX('+val+')',
            'transform':'translateX('+val+')'
        });
    }
	function toggleImg(reverse){
		if($ct.is(':hidden')){clearTimeout(slider.toggleImgHandler);slider.toggleImgHandler = setTimeout(toggleImg, 5000);return;}
		if(reverse){
			var dif = l-1;
			var w  = $(window).width();
            var item_now = $ct.find('[iIndex="'+(ci%l)+'"]');
            var item_next = $ct.find('[iIndex="'+((ci+dif)%l)+'"]');
            setTrans.apply(item_now);
            setTrans.apply(item_next,['-100%']);
            setTimeout(function(){
                setTrans.apply(item_now,['100%', '.5s']);
                setTrans.apply(item_next,[0, '.5s']);
            },  50);
			if(l > 1){
				$ct1.find('.current').removeClass('current');
				$ct1.find('[iIndex="'+((ci+dif)%l)+'"]').addClass('current');
			}
			ci = ci+dif;
		} else{
			var w  = $(window).width();
            var item_now = $ct.find('[iIndex="'+(ci%l)+'"]');
            var item_next = $ct.find('[iIndex="'+((ci+1)%l)+'"]');
            setTrans.apply(item_now);
            setTrans.apply(item_next,['100%']);
            setTimeout(function(){
                setTrans.apply(item_now,['-100%', '.5s']);
                setTrans.apply(item_next,[0, '.5s']);
            },  50);
			if(l > 1){
				$ct1.find('.current').removeClass('current');
				$ct1.find('[iIndex="'+((ci+1)%l)+'"]').addClass('current');
			}
			++ci;
		}
		if(l > 1){
            clearTimeout(slider.toggleImgHandler);
			slider.toggleImgHandler = setTimeout(toggleImg, 5000);
		}
	}
    var isBusy = false;
    var busyHandler;
    function notBusy(){
        setBusy();
        busyHandler = setTimeout(function(){
            isBusy = false;
        }, 600);
    }
    function setBusy(){
        clearTimeout(busyHandler);
        isBusy = true;
    }
	reBind =  function(bBind){
        $ctr.unbind('touchstart touchend');
        $ctr.find('.slide.item').unbind('swipeleft swiperight touchend vclick');
        if(bBind){
            $ctr.on('touchstart touchend', function(e){
                e.preventDefault();
                //e.stopPropagation();
            });
            $ctr.find('.slide.item').on('swipeleft swiperight', function(e){
                setBusy();
                clearTimeout(slider.toggleImgHandler);
                toggleImg(e.type == 'swiperight');
                notBusy();

            }).on('touchend vclick', function(e){
                e.preventDefault();
                //e.stopPropagation();
                if(isBusy){
                    return;
                }
                $(this).trigger('sliderClick');
            });
        }


	};
	if(l > 1){
		slider.toggleImgHandler = setTimeout(toggleImg, 5000);
		$ct.slider = slider;
		reBind(true);
	} else{
        reBind();
    }
	return $ct;

};
viewJs.toConfirmLogout = function(){
	// TODO
	viewJs.dialogPop('确定退出？', function(res){
		if(res){
			dmJs.sStore.logout(function(){
				$('#account .backBtn').click();
				viewJs.afterToggleLogin();
               var next = {id:'startpage', url:'./'};
                viewJs.navigator.next({next:next});
//                if(viewJs.chkPermission()){
//                    var next =  {id: $.mobile.activePage.id, url: location.href.replace(/\?.+/, ''), options: {data: mainJs.parseUrlSearch()}};
//                    next = {id:'startpage', url:'./'};
//                    viewJs.navigator.next({next:next});
//                }
			});
		}
	});

};
viewJs.chkPermission = function(id){
    var id = $.trim(id || $.mobile.activePage.attr('id'));
    return viewJs.jsConfig.__needNotLogin.search(','+id+',') == -1;
};
viewJs.getVerifyCode = function(callback){
	var $p = $.mobile.activePage;
	var mobile = $p.find('.phone input').val();
	var verifyCode = $p.find('.securityCode input').val();
	var tempCode = $p.find(".securityCode > img").data("tempCode");
	mobile = $.trim(mobile);
	dmJs.getVerifyCode({mobile:mobile,verifyCode:verifyCode,tempCode:tempCode}, function(data){
		dmJs.sStore.save('tempAccessToken', data.tempAccessToken);
        dmJs.sStore.save('tempAccessToken_mobile', mobile);
		viewJs.setClock($p.find('.vbt.sendCode'), {html:'（{0}）重新获取', time:60});
        viewJs.showPopMsg('验证码已发送');
	});
};
viewJs.clearRegister = function(){
	var $p = $.mobile.activePage;
	viewJs.clearClock($p.find('.vbt.sendCode'), '获取验证码');
};
viewJs.clearClock = function($el, html){
	clearInterval($el.data('clockHandler'));
	$el.html(html || $el.data('normalHtml')).removeClass('busy');
};
viewJs.setClock = function($el, options,callBack){
    var html = options.html;
    var time = options.time;
	$el.html(html.replace('{0}',''+time));
    $el.addClass('busy').data('normalHtml', '获取验证码');
	$el.data('clockHandler', setInterval(function(){
		--time;
		if(time <= 0){
            typeof callBack =='function'&& callBack();
			viewJs.clearClock($el);
			return;
		}
		$el.html(html.replace('{0}',''+time));
	}, 1000))
};
viewJs.delayCancelBusy = function(domain){
    setTimeout(function(){
        domain.busy = false;
    }, 500);
};
viewJs.showPopMsg = function(msg){
	var $p = $(document.body);
    $p.find('.popMsg.ui-footer-fixed>.popCt').remove();
	//var exist;
	//var l = $p.find('.popMsg.ui-footer-fixed>.popCt').each(function(i, item){
	//	console.log([msg,item]);
	//	if(msg == $(item).text()){
	//		 exist = true;
	//		return false;
	//	}
	//}).length;
	//if(exist){return;};
	var $m = $(['<div class="popMsg ui-footer-fixed">','<span class="popCt">',msg,'</span>','</div>'].join('')).prependTo($p);
    var first =  $p.find('.popMsg.ui-footer-fixed:visible:eq(0)');
    var top;
    //if(first.length == 0){
       top = $(window).height()*0.7;
    //} else {
    //   top = first.offset().top - $m.height() - 15;
    //}
	$m.css({top:top}).show()
        .fadeOut(5000);
	setTimeout(function(){$m.remove();}, 5000);
};
viewJs.validInput = function(){
    var $el = $(this);
    var val = $el.val()+'';
    var format = $el.attr('data-format');
    var maxlength = $.trim($el.attr('maxlength'));
    switch (format){
        case 'alphanumeric':
            val = val.replace(/[^0-9a-zA-Z]/g,'');
            break;
        case 'decimal':
            val = val.replace(/[^\d\.]/g,'').replace(/.*\./g, '0.').replace(/^0{2,}/, '0');
            if(Number(val) > 1){
                val = ('0.'+val).substring(0, 2);
            }
            break;
        case 'number':
            val = val.replace(/[^\d]/g,'');
            break;
    }
    if($.isNumeric(maxlength)){
        var maxlength = Number(maxlength);
        if(format){
            val = val.substring(0,maxlength);
        } else{
            clearTimeout($el.data('maxLengthHandler'));
            $el.data('maxLengthHandler', setTimeout(function(){
                var val = $el.val()+'';
                val = viewJs.subStr(val, maxlength);
                $el.val(val);
            },300));
        }
    }
    if(format){
        $el.val(val);
    }
};
viewJs.showPopTip = function(options){
	var $p = $.mobile.activePage;
	var $base = $(options.el);
	$base.siblings('.elTip').remove();
	var $m = $([
		'<div class="popMsg elTip" style="width:auto;height:40px;position:absolute;">',
			'<span class="popCt" style="border-radius:5px;">',options.msg,'</span>',
		'</div>'].join('')).insertBefore($base);
	var offset = $base.offset();
	$m.offset({top:offset.top+$base.height(), left:offset.left}).show();
	$m.delay(1500)
//        .slideUp(500);
	return $m;
};

viewJs._repSymbolLists =[
	{
		r:/</g,
		t:'＜'
	},{
		r:/>/g,
		t:'＞'
	},{
		r:/\[/g,
		t:'［'
	},{
		r:/\]/g,
		t:'］'
	}
];

viewJs.replaceSymbol = function(val){
var list = viewJs._repSymbolLists,item;
	for(var i = list.length-1;i >-1; i--){
		item = list[i];
		val = val.replace(item.r,item.t);
	}
	return val;
};
viewJs.formateVideoUrl = function($el){
	//var ret;
	$el.undelegate().delegate('a[video-youku]','vclick',function(e){
		e.preventDefault();
		viewJs.showVideo($(this).attr('video-youku'));
	});
	$el.find('a').each(function(i,lnk){
		var $lnk = $(lnk);
		var url = $.trim($lnk.attr('href'));
		if(url==''){
			return;
		}

		// http://player.youku.com/embed/XNDE1OTc1MDE2.html
		if(url.indexOf('player.youku.com/embed')<0){
			return;
		}
		var youKuId = url.replace(/^.*\//,'').replace(/\..*$/,'');
		$lnk.attr('video-youku',youKuId).attr('href','#');
			//.attr('href',['video.html?from=youku&id=',youKuId].join(''))
	});

	return;
};
viewJs.showVideo = function(id){
	viewJs.dialogPop('<iframe id="video_frame" src="http://player.youku.com/embed/'+id+'" height=225 width=236  frameborder=0 allowfullscreen></iframe>',
		function(){
			$('#video_frame').remove();
		},'视频播放',{
			onlyBtnOk:true,
			okText:'关闭'
		}
	);
};
viewJs.dialogPop = function(msg, callback, title, options){
    //console.log(msg)
	var $p = $.mobile.activePage;
	if($p != null){
		var dlg = $('#dialogPopMsg');
		if(dlg.length == 0){
			dlg = $(
			['<div id="dialogPopMsg" class="dlgPop-overlay" style="background-color:rgba(0,0,0,.3);">',
				'<div class="dlgPop-box ui-corner-all ui-footer-fixed">',
                    '<div class = "dlgPop-img">' ,
                    '<div class="delete" ></div></div>',
					'<div class="dlgPop-title">确认</div>',
					'<div class="dlgPop-content "></div>',
					'<div class="dlgPop-btn-bar">',
                    '<a class="dlgPop-btn cancel">取消</a>',
						'<a class="dlgPop-btn confirm">确认</a>',

					'</div>',
				'</div>',
			'</div>'].join('')).hide();
		}
		$p.append(dlg);
		var options = options || {};
		if(options.onlyBtnOk){
			dlg.find('.dlgPop-btn-bar').addClass('onlyBtnOk');
		} else {
			dlg.find('.dlgPop-btn-bar').removeClass('onlyBtnOk');
			dlg.find('.dlgPop-btn.cancel').text(options.noText || '取消').show();
		}
		dlg.find('.dlgPop-btn.confirm').text(options.okText || '确认');
		dlg.find('.dlgPop-title').html(title || '提示');
		dlg.find('.dlgPop-content').html(msg);
		var btn = dlg.find('.dlgPop-btn').unbind('click');
		setTimeout(function(){
				btn.unbind('click').bind('click', function(){
					dlg.hide();
					if($.isFunction(callback)){
						callback($(this).is('.confirm'));
					}
				});
                dlg.find('.delete').bind('click',function(){
                    setTimeout(function(){
                        dlg.remove();
                    },100)
                })
		},500);

		viewJs.top();
		if(options.front){
			dlg.addClass('front');
		} else {
			dlg.removeClass('front');
		}
		dlg.removeClass(dlg.data('cls'));
		if(options.cls){
			dlg.addClass(options.cls);
			dlg.data('cls', options.cls);
		} else {
			dlg.data('cls', null);
		}

		dlg.show();
	} else {
		alert(msg);
	}
};
viewJs.validate = function(options){
	var val = options.val;
	var name = options.name;
	if(val == '' || val == null){
		if(options.must){
			return  name+'不能为空';
		}
	} else {
		var l = val.length;
		if(options.minLength && l < options.minLength){
			return name + ' '+options.minLength+'~' + options.maxLength + '位';
		}
		if(options.maxLength && l > options.maxLength){
			return name + ' '+options.minLength+'~' + options.maxLength + '位';
		}
	}
};
viewJs.onPhoneInput = function(el){
	var $el = $(el);
	var val = $.trim($el.val()).replace(/\D/g, '');
    $el.val(val);
	if(val == ''){
		$el.parent().siblings('.vbt.sendCode').removeClass('enable')
	} else {
		$el.parent().siblings('.vbt.sendCode').addClass('enable')
	}
};
viewJs.navigator = {
	extraParams:{},
	histroy:{},
	transition:'fade',
	init:function(){
//		var browser = window.browser.versions;
		this.transition ='none';
	},
	setExtraParam:function(pageId, params){
		var old = this.extraParams[pageId];
		if(old == null){
			old = this.extraParams[pageId] = {};
		}
		$.extend(old, params);
	},
	getExtraParams:function(pageId){
		return this.extraParams[pageId];
	},
	clearExtraParam:function(pageId){
		delete this.extraParams[pageId];
	},
	df:{
		orderDetail:{url:'./buyorder.html'},
		services:{url:'./'},
		account:{url:'./mine.html'},
		myOrders:{url:'./mine.html'},
		favorite:{url:'./mine.html'},
		mine:{url:'./'},
		search:{url:'./'},
		changeCity:{url:'./'},
		changePwd:{url:'./account.html'},
		addService:{url:'./'},
		selCategories:{url:'./addService.html',navigate:'#addService'},
		selServiceTags:{url:'./addService.html',navigate:'#addService'},
		addServiceWantDesc:{url:'./addService.html',navigate:'#addService'},
		verifyUser:{url:'./account.html'}
	},
	next:function(options){
		this.init();
		var activePage = $.mobile.activePage;
		var next = options.next;
		if(options.lastAuto){
			options.last = this.getLastByCurrent();
		}
		if(options.last){
			var lastId = options.last.id;
			if(lastId =="confirmOrder" && next.id == "service"){
				console.log('sss');
			} else {
				dmJs.sStore.save('pre-'+next.id, options.last);
				// this.histroy['pre-'+next.id] =  options.last;
			}
		}
		var extra = options.extra;
		if(extra == null || !extra.params){
			$('#'+next.id).remove();
			this.clearExtraParam(next.id);
		} else {
			viewJs.navigator.setExtraParam(next.id, extra.params);
		}

		var newOptions = $.extend({transition:this.transition}, next.options);
        //console.log(newOptions)

		$.mobile.changePage(next.url || next.href, newOptions);
	},pre:function(options){
		this.init();
		var activePage = $.mobile.activePage;
		var id = activePage.attr('id');
		var last = dmJs.sStore.get('pre-'+id);
		if(last == null){
			last = this.df[id];
			if(last == null){
					console.log(id+':前一个页面不存在');
					last = {url:'./'};
			} else {
					console.log(id+':默认前一个页面：'+ last);
			}
		} else {
			$('#'+last.id).remove();
			console.log([id, last]);
			dmJs.sStore.remove('pre-'+id);
		}
		if(last.navigate!= null){
			$.mobile.navigate(last.navigate);
		} else {
			var newOptions = $.extend({transition:this.transition}, last.options);
			newOptions.reverse = "true";
			try {
				$.mobile.changePage(last.url || last.href, newOptions);
			} catch (e){
				console.log(e);
				loaction.reload();
			}
		}
	},getLastByCurrent:function(){
		var $p = $.mobile.activePage;
		var path = $.mobile.path.parseUrl(location.href);
		return {id:$p.attr('id'), href:path.hrefNoSearch, options:{data:mainJs.parseUrlSearch()}};
	}
};
viewJs.afterToggleLogin = function(){
	var user = dmJs.sStore.getUserInfo();
	if(user == null){
		$(document.body).removeClass('login');
	} else {
		$(document.body).addClass('login');
		$('.loginName').html(user.user.realname);
	}
};
viewJs.maskReadImg = function(msg){
	viewJs.maskBusy(msg || '图片读取中', 'reading-img');
};
viewJs.finishReadImg = function(){
	viewJs.hideBusyMask('reading-img');
};

viewJs.initPublishPage = function(){
	var user = dmJs.sStore.getUserInfo();
	if(user == null){
		dmJs.sStore.toLogin();
		return;
	}
	viewJs.toggleAddServiceEvents(true);
};


viewJs.showApiError =  function(errObj){
    dmJs.sStore.accessInvalid(errObj);
	var msgs = dmJs.i18n.getMsgs('msg_api');
    //console.log(msgs)
	var msg;
	if(msgs == null){
		msg =  errObj.error;
	} else {
		msg = msgs[errObj.error_code] || errObj.error;
		if(errObj.error_code=='20002'){
			msg = '验证码失效';
		}
	}
    //console.log(msg)
	var callback = errObj.callback;
    if(!callback){
        switch (errObj.error_code){
            case '20201':
            case '20101':
            case '20503':
            case '20248':
            case '20249':
                callback = function(){viewJs.navigator.pre()};
        }
    }

	viewJs.dialogPop(msg, function(){
		var $p = $.mobile == null ? null : $.mobile.activePage;
		if($p != null){
			$p.find('input[autofocus]:first').focus();
		}
		if(callback != null){
			callback();
		}	
	}, '错误', {onlyBtnOk:true});
};
viewJs.testbroswer=function(){
    //检测浏览器
    var iUserAgent = navigator.userAgent;
    var iAppVersion = parseFloat(navigator.appVersion);
    var isOpera = iUserAgent.indexOf("Opera") > -1;
    var isKHTML = iUserAgent.indexOf("KHTML") > -1 || iUserAgent.indexOf("Konqueror") > -1 || iUserAgent.indexOf("AppleWebKit") > -1;
    if(isKHTML){
        var isChrome = iUserAgent.indexOf("Chrome") > -1;
        var isSafari = iUserAgent.indexOf("AppleWebKit") > -1 && !isChrome;
        var isKonq = iUserAgent.indexOf("Konqueror") > -1;
    }
    var isIE = iUserAgent.indexOf("compatible") > -1 && iUserAgent.indexOf("MSIE") > -1 && !isOpera;
    var isMoz = iUserAgent.indexOf("Gecko") > -1 && !isKHTML;
    var isNS4 = !isOpera && !isMoz && !isKHTML && !isIE && (iUserAgent.indexOf("Mozilla") ==0) && (navigator.appName == "Netscape") && (fAppVersion >=4.0 && fAppVersion <= 5.0);
    //此处为检测平台
    var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
    var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh");
    var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
    if(isOpera){
        return "opera";
    } else if(isChrome) {
        return "chrome";
    } else if(isSafari){
        return "safari";
    } else if(isKonq){
        return "konq";
    } else if(isIE){
        //此处没用userAgent来检测，主要是考虑IE9浏览器按F12可以切换到IE7，IE8;用userAgent会检测不出来
        if (parseInt($.browser.version, 10) <= 6) {
            return "IE6";
        } else if (document.all && !document.querySelector) {
            return "IE7";
        } else if (document.all && document.querySelector && !document.addEventListener) {
            return "IE8";
        } else {
            return "IE9+";
        }
    } else if(isMoz){
        return "mozilla";
    } else if(isNS4){
        return "ns4";
    }
}
viewJs.jsConfig = {
    __needNotLogin:',doSearchSvr,services,service,startpage,changeCity,reviews,u,moreServices,moreWants,register,signIn,',
	verifyUser: {url: "/js/user/verifyUser.js", varName: "verifyUserJs", title: "身份认证"},
	verifyTeacher: {url: "/js/user/verifyTeacher.js", varName: "verifyTeacherJs", title: "认证"},
	verifyTeacherIDCard: {url: "/js/user/verifyTeacherIDCard.js", varName: "verifyTeacherIDCardJs", title: "认证"},
	verifyEnterprise: {url: "/js/user/verifyEnterprise.js", varName: "verifyEnterpriseJs", title: "认证"},
	validateBankCard: [{
		url: "/js/common/validCard.js",
		varName: "validCardJs",
		title: "银行卡格式验证"
	}, {url: "/js/user/validateBankCard.js", varName: "validateBankCardJs", title: "银行卡认证"}],
	courseTypes:{varName: "courseTypesJs", url: "/js/system/courseTypes.js", title: "课程分类"},
	market:{varName: "marketJs", url: "/js/service/market.js", title: "市场实践"},
	withdraw: [{
		url: "/js/common/validCard.js",
		varName: "validCardJs",
		title: "银行卡格式验证"
	},{varName: "withdrawJs", url: "/js/user/withdraw.js", title: "提现"}],
	resetPwd: {varName: "resetPwdJs", url: "/js/user/resetPwd.js", title: "重置密码"},
	recommend: {varName: "recSvrsJs", url: "/js/search/recSvrs.js", title: "推荐的服务"},
	signup: {varName: "signupJs", url: "/js/user/signup.js", title: "报名申请"},
    treasuresBox: {varName: "treasuresBoxJs", url: "/js/user/treasuresBox.js", title: "创新创业实践课程学习卡"},
	myWants: {varName: "myWantsJs", url: "/js/want/myWants.js", title: "我发布的需求"},
	myQuestions: {varName: "myQuestionsJs", url: "/js/want/myQuestions.js", title: "我发布的问题"},
    interact: {varName: "interactJs", url: "/js/want/interact.js", title: "直播互动"},
	myServices: {varName: "myServicesJs", url: "/js/service/myServices.js", title: "我发布的服务"},
	myDiplomas: {varName: "myDiplomasJs", url: "/js/user/myDiplomas.js", title: "成绩证书"},
	myTeachers: {varName: "myTeachersJs", url: "/js/user/myTeachers.js", title: "我的师资"},
	joinEnterprise: {varName: "joinEnterpriseJs", url: "/js/user/joinEnterprise.js", title: "师资邀请"},
	diploma: {varName: "diplomaJs", url: "/js/user/diploma.js", title: "成绩证书"},
	updateInfo: [{
		varName: "simpledatepickerJs",
		url: "/js/plugin/datepicker/simpledatepicker2.js",
		title: "日历"
	}, {varName: "uploadAvatarJs", url: "/js/common/uploadAvatar.js", title: "头像插件"}, {
		varName: "updateInfoJs",
		url: "/js/user/updateInfo.js",
		title: "修改用户信息"
	}],
	changeContactInfo: {varName: "changeContactInfoJs", url: "/js/user/changeContactInfo.js", title: "修改联系人"},
	recharge: {varName: "rechargeJs", url: "/js/user/recharge.js", title: "充值"},
	rechargeCourse: {varName: "rechargeCourseJs", url: "/js/user/rechargeCourse.js", title: "充值卡购课"},
	accountDetails: {varName: "accountDetailsJs", url: "/js/user/accountDetails.js", title: "充值"},
	doSearchSvr: {varName: "doSearchSvrJs", url: "/js/search/doSearchSvr.js", title: "搜素页面"},
	searchAll: {varName: "searchAllJs", url: "/js/search/searchAll.js", title: "搜素页面"},
	want: {varName: "wantJs", url: "/js/want/want.js", title: "需求详情"},
	question: {varName: "questionJs", url: "/js/want/question.js", title: "问题详情"},
	addService: [{varName: "publishJs", url: "/js/common/publish.js", title: "发布服务"}, {
        varName: "addServiceJs",
        url: "/js/service/addService.js",
        title: "发布服务"
    }],
	addWant: [{varName: "publishJs", url: "/js/common/publish.js", title: "发布需求"}, {
		varName: "addWantJs",
		url: "/js/want/addWant.js",
		title: "发布需求"
	}],
	addQuestion: [{varName: "publishJs", url: "/js/common/publish.js", title: "发布问题"}, {
		varName: "addQuestionJs",
		url: "/js/want/addQuestion.js",
		title: "发布问题"
	}],
    addProgress: [{varName: "publishJs", url: "/js/common/publish.js", title: "发布问题"}, {
        varName: "addProgressJs",
        url: "/js/service/addProgress.js",
        title: "添加众筹进展"
    }],
	addAnswer: [{varName: "publishJs", url: "/js/common/publish.js", title: "发布问题"}, {
		varName: "addAnswerJs",
		url: "/js/service/addAnswer.js",
		title: "发布答案"
	}],
	a123456789:{}
	selectVeifyType: {varName: "selectVeifyTypeJs", url: "/js/user/selectVeifyType.js", title: "选择认证类型"},
	submitOrder: {varName: "submitOrderJs", url: "/js/service/submitOrder.js", title: "提交订单"},
	addReview: {varName: "addReviewJs", url: "/js/service/addReview.js", title: "评价"},
	sysMessage: {varName: "sysMessageJs", url: "/js/message/sysMessage.js", title: "系统消息"},
	services: {varName: "searchResultJs", url: "/js/search/searchResult.js", title: "搜索结果"},
    liveList: {varName: "liveListJs", url: "/js/search/liveList.js", title: "直播列表"},
    //liveCast2: {varName: "liveCast2Js",url: "/js/live/liveCast2.js", title: "直播课堂奥点 "},
	service: {varName: "serviceJs", url: "/js/service/service.js", title: "服务详情"},
    course: [{varName: "courseJs", url: "/js/service/course.js", title: "课程详情"}],
    funding: [{varName: "fundingJs", url: "/js/service/funding.js", title: "众筹详情"}],
	report: {varName: "reportJs", url: "/js/service/report.js", title: "举报服务"},
	orderDetail: {varName: "orderDetailJs", url: "/js/service/orderDetail.js", title: "订单详情"},
    showReview: {varName: "showReviewJs", url: "/js/service/showReview.js", title: "评价详情"},
    buyorderDetail: {varName: "buyorderDetailJs", url: "/js/service/buyorderDetail.js", title: "订单详情new"},
	account: {varName: "accountJs", url: "/js/user/account.js", title: "账户管理"},
	mine: {varName: "mineJs", url: "/js/user/mine.js", title: "账户管理"},
	changeCity: {varName: "changeCityJs", url: "/js/system/changeCity.js", title: "城市列表"},
	startpage: {varName: "startpageJs", url: "/js/system/startpage.js", title: "首页"},
	reviews: {varName: "reviewsJs", url: "/js/service/reviews.js", title: "评价"},
	confirmOrder: {varName: "confirmOrderJs", url: "/js/service/confirmOrder.js", title: "支付"},
	u: {varName: "uJs", url: "/js/user/u.js", title: "用户详情"},
	moreServices: {varName: "moreServicesJs", url: "/js/user/moreServices.js", title: "用户服务"},
	moreWants: {varName: "moreWantsJs", url: "/js/user/moreWants.js", title: "用户需求"},
	favorite: {varName: "favoriteJs", url: "/js/user/favorite.js", title: "我的收藏"},
	follow: {varName: "followJs", url: "/js/user/follow.js", title: "我的关注"},
    myGroup1: {varName: "myGroup1Js", url: "/js/user/myGroup1.js", title: "我的团队成员"},
	mygroup: {varName: "mygroupJs", url: "/js/user/mygroup.js", title: "我的团队"},
    myProject: {varName: "myProjectJs", url: "/js/user/myProject.js", title: "我的项目组"},
    myLessons: {varName: "myLessonsJs", url: "/js/user/myLessons.js", title: "我的团队"},
	fans: {varName: "fansJs", url: "/js/user/fans.js", title: "我的粉丝"},
	userKPI: {varName: "userKPIJs", url: "/js/user/userKPI.js", title: "绩效指标"},
	selectPublish: {varName: "selectPublishJs", url: "/js/common/selectPublish.js", title: "选择发布类型"},
	calendar: {varName: "calendarJs", url: "/js/user/calendar.js", title: "日程表"},
	found: {varName: "foundJs", url: "/js/user/found.js", title: "发现"},
	myOrders: {varName: "myOrdersJs", url: "/js/user/myOrders.js", title: "我的订单"},
    buyorder: {varName: "buyorderJs", url: "/js/user/buyorder.js", title: "购买订单"},
	paySuccess: {varName: "paySuccessJs", url: "/js/service/paySuccess.js", title: "支付成功"},
	selectRegister: {varName: "selectRegisterJs", url: "/js/user/selectRegister.js", title: "注册"},
	register: {varName: "registerJs", url: "/js/user/register.js", title: "注册"},
	changePwd: {varName: "changePwdJs", url: "/js/user/changePwd.js", title: "修改密码"},
	matchWants: {varName: "matchWantsJs", url: "/js/search/matchWants.js", title: "匹配需求"},
	matchServices: {varName: "matchServicesJs", url: "/js/search/matchServices.js", title: "匹配服务"},
	wantResponses: {varName: "wantResponsesJs", url: "/js/service/wantResponses.js", title: "响应列表"},
	signIn: {varName: "signInJs", url: "/js/user/signIn.js", title: "登录"},
	loginWx: {varName: "loginWxJs", url: "/js/user/loginWx.js", title: "关联账号"},
	bindWx: {varName: "bindWxJs", url: "/js/user/bindWx.js", title: "关联账号"},
	bindPassword: {varName: "bindPasswordJs", url: "/js/user/bindPassword.js", title: "关联账号"},
	bindMobile: {varName: "bindMobileJs", url: "/js/user/bindMobile.js", title: "绑定手机号"},
	automaticWx: {varName: "automaticWxJs",url: "/js/user/automaticWx.js",title: "自动登录"},
	myInvitations: {varName: "myInvitationsJs", url: "/js/user/myInvitations.js", title: "我的邀请"},
	waitList: {varName: "waitListJs", url: "/js/user/waitList.js", title: "待付款/待确认/待评价"},
	blanceDetail: {varName: "blanceDetailJs", url: "/js/user/blanceDetail.js", title: "账单详情"},
	changePrice: {varName: "changePriceJs", url: "/js/user/changePrice.js", title: "修改订单"},
	present: {varName: "presentJs", url: "/js/user/present.js", title: "活动"},
	explain: {varName: "explainJs", url: "/js/user/explain.js", title: "活动规则"},
	teacherday: {varName: "teacherdayJs", url: "/js/user/teacherday.js", title: "活动"},
	teacherdayReceive: {varName: "teacherdayReceiveJs", url: "/js/user/teacherdayReceive.js", title: "活动"},
	teacherdayReceiveSucc: {varName: "teacherdayReceiveSuccJs", url: "/js/user/teacherdayReceiveSucc.js", title: "活动"},
	teacherdayShare: {varName: "teacherdayShareJs", url: "/js/user/teacherdayShare.js", title: "活动"},
	teacherdayExplain: {varName: "teacherdayExplainJs", url: "/js/user/teacherdayExplain.js", title: "活动"},
	learningCardReceive: {varName: "learningCardReceiveJs", url: "/js/user/learningCardReceive.js", title: "活动"},
	learningCardReceiveSucc: {varName: "learningCardReceiveSuccJs", url: "/js/user/learningCardReceiveSucc.js", title: "活动"},
	userRankDescribe: {varName: "userRankDescribeJs", url: "/js/user/userRankDescribe.js", title: "说明"},
	virtualCurrReceive: {varName: "virtualCurrReceiveJs", url: "/js/user/virtualCurrReceive.js", title: "活动"},
	virtualCurrReceiveSucc: {varName: "virtualCurrReceiveSuccJs", url: "/js/user/virtualCurrReceiveSucc.js", title: "活动"},
	operateByTeacher: {varName: "operateByTeacherJs", url: "/js/user/operateByTeacher.js", title: "活动"},
	schoolmaster: {varName: "schoolmasterJs", url: "/js/user/schoolmaster.js", title: "活动"},
	christmas: {varName: "christmasJs", url: "/js/user/christmas.js", title: "活动"},
	christmasQuestion: {varName: "christmasQuestionJs", url: "/js/user/christmasQuestion.js", title: "活动"},
	christmasExplain: {varName: "christmasExplainJs", url: "/js/user/christmasExplain.js", title: "活动说明"},
	innovationEvaluate: {varName: "innovationEvaluateJs", url: "/js/user/innovationEvaluate.js", title: "活动"},
	innovationEvaluateExplain: {varName: "innovationEvaluateExplainJs", url: "/js/user/innovationEvaluateExplain.js", title: "活动说明"},
	innovationEvaluateDetail: {varName: "innovationEvaluateDetailJs", url: "/js/user/innovationEvaluateDetail.js", title: "证书"},
	share: {varName: "shareJs", url: "/js/user/share.js", title: "分享" },
    jinDaoLecture: {varName: "jinDaoLectureJs", url: "/js/active/jinDaoLecture.js", title: "晋道大讲堂"},
    comActivity: {varName: "comActivityJs", url: "/js/active/comActivity.js", title: "公共活动"},
    puTianLecture: {varName: "puTianLectureJs", url: "/js/active/puTianLecture.js", title: "莆田会议讲座"},
    healthLecture: {varName: "healthLectureJs", url: "/js/active/healthLecture.js", title: "健康产学研"},
    pubSection: {varName: "pubSectionJs", url: "/js/active/pubSection.js", title: "十大公众号评选"},
    liveAoDian: {varName: "liveAoDianJs", url: "/js/live/liveAoDian.js", title: "创新学堂直播课程"},
	"five-color": {varName: "fiveColorJs", url: "/js/user/five-color.js", title: "五色思维" }
};

viewJs.loadJs = function(cfgs, options){
	var cfgList = cfgs;
	if(!$.isArray(cfgList)){
		cfgList = [cfgList];
	}
	var options = options ? options : {};
	var l = cfgList.length, i= options.index == null ? (options.index = 0) : options.index;
	var cfg = $.extend({}, cfgList[i]);
	viewJs.maskBusy('初始化', cfg.varName);
	cfg.ns = cfg.ns || window;
	if(!/^https?:/.test(cfg.url)){
		cfg.url = mainJs.getResourceURL(cfg.url)+'?ver='+mainJs.publishVer;
	}
	cfg.ajaxOpt = {
		success:function() {
			viewJs.hideBusyMask(cfg.varName);
			var jsObj = cfg.ns[cfg.varName];
			if($.isFunction(jsObj.init)){
				jsObj.init();
			}
			if(i < l-1){
				options.index +=1;
				viewJs.loadJs(cfgList,options);
			} else{
				if($.isFunction(options.success)){
					options.success();
				}
			}
		}, error:function(){
			viewJs.hideBusyMask(cfg.varName);
			viewJs.dialogPop('加载'+(cfg.title || '组件')+'失败！', function(){
				if($.isFunction(options.error)){
					options.error();
				}
			}, '错误', {onlyBtnOk:true});
		}
	};
	$.getJs(cfg);
};
viewJs.renderPage = function(pageId){
	var dfCfg = viewJs.jsConfig[pageId];
	if(dfCfg != null){
		viewJs.loadJs(dfCfg,{error:function(){
			viewJs.navigator.pre();
		}});
	}
};
viewJs._maskLoadingMore = function(){
	var maskEl  = $('#maskLoadingMore');
	if(maskEl.length == 0){
		$(document.body).append(['<div id="maskLoadingMore" class="loading-dots-container ng-hide ui-footer-fixed">',
			'<div class="background">&nbsp;</div>',
			'<div class="line-wrapper">',
				'<div class="line">',
						'<div class="loading-dots horizontal one"></div>',
						'<div class="loading-dots horizontal two"></div>',
						'<div class="loading-dots horizontal three"></div>',
						'<div class="loading-dots horizontal four"></div>',
				'</div>',
			'</div>',
		'</div>'].join('')).show();
	} else {
		maskEl.show();
	}
};
viewJs.applyTpl_reg = /_tpl-[a-zA-Z\d\.]*/g;
viewJs.applyTpl_fParse2 = function(k, obj){
  var index = k.indexOf('.');
  if(index > -1){
      return arguments.callee.call(null, k.substring(index+1), obj[k.substring(0, index)])
  } else {
	  var val = obj[k];
      return val == null ? '' : val;
  }
};
viewJs.applyTpl = function(tpl, data){
	return tpl.replace(viewJs.applyTpl_reg,
        function(w){
            var k1 =  w.substring(5);
            return viewJs.applyTpl_fParse2(k1, data);
        }
    );
};
viewJs.addPaperFooter = function(html, offset, total, l,paperTpl){
    if(l > 0){
        var _PAGE_SIZE = mainJs.PAGE_SIZE;
        var pageInfo = {};
        pageInfo.hasPre = offset > 0 ? '' : 'disabled';
        pageInfo.hasNext = (offset+_PAGE_SIZE) < total ? '' : 'disabled';
        var pageCurrent = Math.ceil(offset/_PAGE_SIZE+0.1);
        pageInfo.pagePre = pageCurrent-1;
        pageInfo.pageNext = pageCurrent+1;
        pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
        html.push(viewJs.applyTpl(paperTpl, pageInfo));
    } else {
        html.push('<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>');
    }
};
viewJs._endLoadingMore = function(){
	$('#maskLoadingMore').fadeOut(2000);
};
viewJs.noloadingMore = function(){
	$('#maskLoadingMore').hide();
	viewJs.showPopMsg('客官，已经没有了，别费劲了');
};
viewJs.loadPage = function(opt){
    var _self = opt.domain;
    var evt = opt.evt;
    var bLogin = opt.bLogin;
    var optPram = opt.param;
    var optUrl = opt.url;
    var accessToken;
    if(bLogin){
        accessToken = dmJs.getAccessToken();
        if(accessToken == null){
            dmJs.sStore.toLogin({href:location.href});
            return;
        }
    }
    var offset = 0;
    if(evt && evt.type == 'vclick'){
        var $el = $(evt.target);
        if($el.is('.disabled')){
            return;
        }
        offset = (Number($el.attr('data-page-num'))-1)*mainJs.PAGE_SIZE;
    }
    if(_self.busy){
        return;
    }
    _self.busy = true;
    var params = {};
    if(bLogin){
        params.accessToken = accessToken;
    }
    params.pageSize = mainJs.PAGE_SIZE;
    $.extend(params, optPram);
    params.offset = offset;
    var reqId = optUrl.substring(optUrl.indexOf('/')+1);
    dmJs._ajax({
        method:opt.reqMethod,
        id:reqId,
        url:optUrl,
        params:params,
        accessInvalid:function(){
            dmJs.sStore.toLogin({href:location.href});
        },
        callback:function(res){
            viewJs.parseList(res, $.extend(opt, params));
        },error:function(){
        }
    }).complete(function(){
        viewJs.delayCancelBusy(_self);
    });
};
viewJs.typesetting=function(str){
		if(str == null){
			return '';
		}
		return '&nbsp;&nbsp;&nbsp;'+(str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
	}
viewJs.parseList= function(data, opt){
    //console.log(data)
    viewJs.top()
    var $content = opt.$content;
    var tpl = opt.tpl;
    var paperTpl = opt.paperTpl;
    var itemParser = opt.itemParser;
    var offset = Number(opt.offset);
    var dataKey = opt.dataKey;
    var list = data[dataKey];
    var total = data.total;
    var l = list.length;
    var $p = $.mobile.activePage;
    var html = [];
    var i=0,item;
    //console.log(data)
    for(; i < l; i++){
        item = list[i];
        html.push(viewJs.applyTpl(tpl, itemParser(item, opt)));
    }
    if(l > 0){
        var _PAGE_SIZE = mainJs.PAGE_SIZE;
        var pageInfo = {};
        pageInfo.hasPre = offset > 0 ? '' : 'disabled';
        pageInfo.hasNext = (offset+_PAGE_SIZE) < total ? '' : 'disabled';
        var pageCurrent = Math.ceil(offset/_PAGE_SIZE+0.1);
        pageInfo.pagePre = pageCurrent-1;
        pageInfo.pageNext = pageCurrent+1;
        pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
        html.push(viewJs.applyTpl(paperTpl, pageInfo));
    }else{
        if(!opt.not_found){
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>'];
        }

    }
    $content.html(html.join(''));

    var search =  mainJs.parseUrlSearch();
    if(search.keyword == '2016大赛'){
        var lang = sessionStorage.getItem('lang');
        var pubData = lang == 'en'? pubEnJs:pubCnJs;

        $p.find('.pagePre').html(pubData.pagePrev);
        $p.find('.pageNext').html(pubData.pageNext) ;
    }


};
viewJs.subStr = function(str, length){
        if(str == null || str == ''){
            return str;
        }
        var len = str.length;
        var valLen = viewJs.getStrLen(str),c;
        while(valLen > length){
            if(len < 1){
                break;
            }
            c = str.charAt(len - 1);
            str = str.substring(0, len-1);
            valLen -= viewJs.getStrLen(c);
            len--;
        }
    return str;
};
viewJs.getStrLen = function(str){
    var strVal = $.trim(str),nL1,nL2,strVal2,len;
    // 半角
    // 基本拉丁字母（即键盘上可见的，空格、数字、字母、符号）
    // \u0020-\u007f
    // 日文半角片假名和符号
    // \uff61-\uff9f
    nL1 = strVal.length;
    nL2 = strVal.replace(/[\u0020-\u007f\uff61-\uff9f]/g, '').length;
    len = nL1 + nL2;
    return len;
};
viewJs.chkLogin = function(next) {
    var user = dmJs.sStore.getUserInfo();
    if (user == null) {
		dmJs.sStore.toLogin(next || {id: $.mobile.activePage.id, url: location.href.replace(/\?.+/, ''), options: {data: mainJs.parseUrlSearch()}});
		/*
        viewJs.dialogPop('未登录或登录失效！', function () {
            dmJs.sStore.toLogin(next || {id: $.mobile.activePage.id, url: location.href.replace(/\?.+/, ''), options: {data: mainJs.parseUrlSearch()}});
        }, '错误', {onlyBtnOk: true});
		*/
        return;
    }
    return user;
};
viewJs.validate. _regExps = {
		url:/^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        email:/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    };
viewJs.validate.email = function(val){
        return this._regExps.email.test(val);
    };
viewJs.validate.url = function(val){
	return this._regExps.url.test(val);
};
viewJs.getFocus  =  function (elem) {
	var index = 0;
	if (document.selection) {// IE Support
		elem.focus();
		var Sel = document.selection.createRange();
		if (elem.nodeName === 'TEXTAREA') {//textarea
			var Sel2 = Sel.duplicate();
			Sel2.moveToElementText(elem);
			var index = -1;
			while (Sel2.inRange(Sel)) {
				Sel2.moveStart('character');
				index++;
			}
			;
		}
		else if (elem.nodeName === 'INPUT') {// input
			Sel.moveStart('character', -elem.value.length);
			index = Sel.text.length;
		}
	}
	else if (elem.selectionStart || elem.selectionStart == '0') { // Firefox support
		index = elem.selectionStart;
	}
	return (index);
};

	viewJs.bLoan = function(tag){
    if($.isArray(tag)){
        var bLoan;
        for(var i = tag.length - 1; i > -1; i--){
                if($.trim(tag[i].tagName) == "创新学堂贷款"){
                    bLoan = true;
                }
        }
        return bLoan;
    } else {
        return $.trim(tag.tagName) == "创新学堂贷款";
    }

};
viewJs.setTitle = function(title, $p){
    var $p = $p || $.mobile.activePage;
    document.title = title;
    $p.find('.ui-title:first').html(title);
};
var unionSupport = {};
(function(){
	var userAgent = navigator.userAgent;
	if(/UCBrowser/.test(userAgent)){
		unionSupport.tag = 'embed';
	} else {
		unionSupport.tag = 'a';
	}
	if (!browser.versions.android) {
		unionSupport.pluginUrl = 'http://mobile.unionpay.com/getclient?platform=ios&type=securepayplugin';
	} else {
		unionSupport.pluginUrl = 'http://mobile.unionpay.com/getclient?platform=android&type=securepayplugin';
	}
})();
unionSupport.generateTag = function(tn, resultURL, usetestmode){
	var data = [
		'tn='+tn,
		'resultURL='+encodeURIComponent('http://m.euming.com/union'),
		'usetestmode='+usetestmode
	].join(',');
	var paydata = encodeURIComponent(Base64.encode(data));
	var tag = '';
	if(unionSupport.tag == 'a'){
		tag = '<a data-role="button" data-ajax="false" href="uppay://uppayservice/?style=token&paydata='+paydata+'">银联</a>'
	} else {
		tag = '<embed type="application/x-unionpayplugin" uc_plugin_id="unionpay" height="53" width="178"  paydata="'+ paydata +'"></embed>';
	}
	return $(tag);
};

// 命名空间 dmJs
$(function(){
    var dmJs = window.dmJs = {};
    dmJs.isAndroid = /(Android)/i.test(navigator.userAgent);
    dmJs.isIos = /(ios)/i.test(navigator.userAgent);
    dmJs.params ={
        geolocation:{
            id:1,
            city:'北京',
            longitude:'116.319784',
            latitude:'40.00496'
        }
    };
    dmJs.i18n = {
        getMsgs:function(key){
            return dmJs.i18n[key + '_' + 'zh-CN'];
        }
    };
    dmJs.data = {
        categories:null,
        hasNext:true,
        offset:0
    };
    dmJs.getCategories = function(callback, error){
        var _self = arguments.callee;
        _self.busy = true;
        if(dmJs.data.categories == null){
            $.get(mainJs.getApiUrl('/urming_quan/system/getCategories')).success(function(data, statusText, jqhr){
                var res = $.parseJSON(data);
                dmJs.data.categories = res.categories;
                if($.isFunction(callback)){
                    callback(res.categories);
                }
                _self.busy = false;
                return res.categories;
            }).error(function(){
                viewJs.showPopMsg('网络错误');
                if($.isFunction(error)){
                    error();
                }
                _self.busy = false;
            });
            return;
        } else if($.isFunction(callback)){
            callback(dmJs.data.categories);
            _self.busy = false;
        }
        return dmJs.data.categories;
    };
    dmJs.getVerifyCode = function(params, callback){
        if(params.mobile == ''){
            return;
        }
        dmJs._ajax({id:'getVerifyCodeTmp',method:'POST',params:params,url:'/urming_quan/user/getVerifyCodeTmp',callback:callback});
    };
    dmJs.confirmService = function(serviceOwnID, callback){
        var currentUser = dmJs.sStore.getUserInfo();
        /*if(currentUser == null){
            dmJs.sStore.toLogin({
                url:'./myOrders.html'
            });
            return;
        }*/
        var params = {serviceOwnID:serviceOwnID,accessToken:currentUser.accessToken};
        dmJs._ajax({
            id:'useService',
            accessInvalid:function(){
                dmJs.sStore.toLogin({
                    url:'./buyorder.html'
                });
            },
            params:params,
            url:'/urming_quan/service/useService',
            callback:callback
        });
    };
    // /urming_quan/system/getCategoryTags
    dmJs.getCategoryTags = function(params, callback){
        dmJs._ajax({params:params, dataType:'html',callback:callback, id:'getCategoryTags', url:'/urming_quan/system/getCategoryTags'});
    };
    dmJs._ajax = function(options){
        //console.log(options)
        //viewJs.maskBusy(options.maskText, options.id);
        return $.ajax({
            cache:false,
            url:mainJs.getApiUrl(options.url),
            type:options.method =='POST' ? 'POST' : 'GET',
            data:options.params,
            dataType:options.dataType,
            success:function(data, statusText, jqhr){
                //console.log(data)
                viewJs.hideBusyMask(options.id);
                try {
                    var res = $.parseJSON(data);
                } catch(ex){
                    var res = data;
                }
                if(res.error){
                    if(dmJs.sStore.accessInvalid(res)){
                        if($.isFunction(options.accessInvalid)){
                            options.accessInvalid();
                        } else {
                            dmJs.sStore.logout();
                            dmJs.sStore.toLogin();
                        }
                        return;
                    }
                    //console.log(res);

                    if( res.error_code >= 20257&& res.error_code <= 20261 ||res.error_code == 20265 ){
                        viewJs.navigator.next({
                            next:{
                                url:'./index.html',
                                id:'startpage',
                                options:{}
                            },lastAuto:false
                        });
                    }else{
                        viewJs.showApiError(options.preError ? options.preError(res) : res);
                    }

                    return;
                }
                if($.isFunction(options.callback)){
                    options.callback(res);
                }
            },error:function(){
                viewJs.hideBusyMask(options.id);
                viewJs.showPopMsg('网络错误');
                if($.isFunction(options.error)){
                    options.error();
                }
            }
        });
    };
    dmJs.getAccessToken = function(){
        var userInfo = dmJs.sStore.getUserInfo();
        if(userInfo != null){
            return userInfo.accessToken;
        }
        return null;
    };
    dmJs.findCatById = function(id, callback){
        viewJs.maskBusy(null, 'findCatById');
        dmJs.getCategories(function(lst){
            viewJs.hideBusyMask(null, 'findCatById');
            var cat;
            for(var i = lst.length-1; i > -1; i--){
                cat = lst[i];
                if(cat.id == id){
                    break ;
                }
            }
            if($.isFunction(callback)){
                callback(cat);
            }
        }, function(){
            viewJs.hideBusyMask(null, 'findCatById');
            viewJs.showPopMsg('加载分类错误');
        });
    };
    dmJs.calGrade = function(reviewNumbers){
        var numbers = $.trim(reviewNumbers).split(',');
        var total = 0;
        var user = 0,num,maxNum = -1,maxScore = -1,nums=[];
        for(var i = 0; i < 5; i++){
            num = Number(numbers[i]);
            if(num > maxNum){
                maxNum = num;
                maxScore = i+1;
            }
            nums[i] = num;
            total += num*(i+1);
            user+=num;
        }
        if(user == 0 ){
            return {user:user, grade:0,maxNum:maxNum, maxScore:maxScore,nums:nums};
        }
        var grade = (Math.round(total*10/user))/10;
        var halfStar = grade - Math.floor(grade);
        if(halfStar > 0){
            halfStar = grade- halfStar;
        }
        return {user:user, grade:grade,halfStar:halfStar,maxNum:maxNum, maxScore:maxScore,nums:nums}
    };
    dmJs.ajaxForm = function(formData, url, callback, options){
        //ajax 提交form
        var options = options || {};
        var reqId = options.reqId || 'ajaxForm';
        //viewJs.maskBusy(options.busyDesc || '提交中', reqId);
        return $.ajax({
            url : url,
            type : "POST",
            data : formData,
            dataType:"text",
            // 告诉jQuery不要去处理发送的数据
            processData : false,
            // 告诉jQuery不要去设置Content-Type请求头
            contentType : false,
            success:function(data){
                viewJs.hideBusyMask(reqId);
                var res = $.parseJSON(data);
                var accessInvalid = dmJs.sStore.accessInvalid(res);
                if(accessInvalid){
                    viewJs.showApiError(res);
                    dmJs.sStore.toLogin();
                    return;
                }
                if(res.error){
                    viewJs.showApiError(res);
                    return;
                }
                if($.isFunction(callback)){
                    callback(res);
                }
            },
            error:function(){
                viewJs.showPopMsg('网络错误');
                viewJs.hideBusyMask(reqId);
            },
            xhr:function(){            //在jquery函数中直接使用ajax的XMLHttpRequest对象
                var xhr = new XMLHttpRequest();

                /*  xhr.upload.addEventListener("progress", function(evt){
                 if (evt.lengthComputable) {
                 var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                 $('#mask_ajaxForm,#submitService').html("正在提交."+percentComplete.toString() + '%');
                 console.log("正在提交."+percentComplete.toString() + '%');        //在控制台打印上传进度
                 }
                 }, false);*/

                return xhr;
            }
        });
    };
    // 根据父区域ID获取区域列表
    dmJs.getAreasByParentId = function(parentID, success, error) {
        var key = 'childCity_'+parentID;
        localStorage.getItem(key);
        if(localStorage.getItem(key) == null){
            viewJs.maskBusy(null, 'getAreasByParentId');
            $.get(mainJs.getApiUrl('/urming_quan/system/getAreasByParentId?_d='+Date.now()),{parentID:parentID})
                .success(function(data){

                    localStorage.setItem(key, data);
                    if($.isFunction(success)){
                        success($.parseJSON(data));
                    }
                    viewJs.hideBusyMask('getAreasByParentId');
                }).error(function(){
                    //console.log(arguments);
                    if($.isFunction(error)){
                        error(arguments);
                    }
                    viewJs.hideBusyMask('getAreasByParentId');
                });
        } else {
            if($.isFunction(success)){
                success($.parseJSON(localStorage.getItem(key)));
            }
        }
    };
    dmJs.initData = function(){
        localStorage.removeItem('cities');
        // 定位
        var geolocation = dmJs.sStore.get('geolocation');
        if( geolocation != null){
            dmJs.params.geolocation = geolocation;
        } else {
            mainJs.getPos();
        }
        dmJs.loadI18n();
        // 2.定位
        // 3.获取定位城市id
        viewJs.afterToggleLogin();

    };

    dmJs.loadI18n = function(){
        var ver = 10;
        localStorage.removeItem('msg_api_zh-CN');
        localStorage.removeItem('msg_api_zh-CN_v2');
        localStorage.removeItem('TFLDic2');
        var localMsgs = localStorage.getItem('msg_api_zh-CN_ver');
        if(localMsgs){
            localMsgs =  $.parseJSON(localMsgs);
            if(localMsgs.ver  < ver){
                localMsgs = null;
                localStorage.removeItem('msg_api_zh-CN_ver');
            }
        }
        if(localMsgs == null){
            $.getJSON(mainJs.getResourceURL('/i18n/zh-CN/msg_api_v2.txt?ver='+ver), function(data, status, jqhr){
                dmJs.i18n['msg_api_zh-CN'] = data;
                localStorage.setItem('msg_api_zh-CN_ver', jqhr.responseText);
            }).error(function(){
            });
        } else {
            if(dmJs.i18n['msg_api_zh-CN'] == null){
                dmJs.i18n['msg_api_zh-CN'] = localMsgs;
            }
        }
    };
    dmJs.fetchDataforLoginUser = function(callback){
        if($.isFunction(callback)){
            callback();
        }
    };
    dmJs.lStore = {
        data:{},
        save:function(key, value){
            var realKey = 'ls-'+ key;
            this.data[realKey] = value;
            localStorage.setItem(realKey, JSON.stringify(value));
        },get:function(key){
            var me = this;
            var realKey = 'ls-'+ key;
            var val = me.data[realKey];
            if(val == null || val == ''){
                val = me.formatVal(realKey);
                if(val!= null){
                    val = $.parseJSON(val);
                    me.data[realKey] = val;
                }
            }
            return val;
        },formatVal:function(key){
            var val = localStorage.getItem(key);
            if(val == 'null' || val == 'undefined'){
                var me = this;
                me.data[key] = value;
                val =  null;
            }
            return val;
        },remove:function(key){
            var me = this;
            var realKey = 'ls-'+ key;
            delete me.data[realKey];
            localStorage.removeItem(realKey);
        }
    };
    // 用户认证模块
    dmJs.hasLogin = function(){
        return this.sStore.getStr('currentUser') != null;
    };
    dmJs.sStore = {
        data:{},
        save:function(key, value){
            if($.isEmptyObject(value)){
                //console.log(key+':为空对象');
                return;
            }
            var realKey = 'authz-'+ key;
            // TODO
            // dmJs.sStore.data[realKey] = value;
            sessionStorage.setItem(realKey, JSON.stringify(value));
        },
        getLoginUser:function(callback){
            var me = this,cookieAccessToken;
            if(me.alreadySyncByCookie){
                if($.isFunction(callback)){
                    callback();
                    return;
                }
            }
            var accessToken = dmJs.getAccessToken();
            if($.trim(accessToken) != ''){
                callback();
                return;
            }
            cookieAccessToken = dmJs.lStore.get('cookieAccessToken');
            if(!cookieAccessToken){
                callback();
                return;
            }
            cookieAccessToken = cookieAccessToken.val;
            me.syncUser(cookieAccessToken, function(data){
                me.alreadySyncByCookie = true;
                if($.isFunction(callback)){
                    callback();
                }
            },function(){
                dmJs.lStore.remove('cookieAccessToken');
                me.alreadySyncByCookie = true;
                if($.isFunction(callback)){
                    callback();
                }
            });

        },syncUser:function(accessToken,callback,accessInvalid){
            var me = this;
            dmJs._ajax({
                id:'getLoginUserInfo',
                url:'urming_quan/user/getUserByAccessToken',
                params:{accessToken:accessToken},
                accessInvalid:function(){
                    if($.isFunction(accessInvalid)){
                        accessInvalid();
                    }
                },callback:function(data){
                    data.accessToken = accessToken;
                    me.saveLoginInfo(data);
                    if($.isFunction(callback)){
                        callback();
                    }
                }
            });
        },get:function(key){
            var me = this;
            var realKey = 'authz-'+ key;
            var val = dmJs.sStore.data[realKey];
            if(val == null || val == ''){
                val = me.formatVal(realKey);
                if(val!= null){
                    val = $.parseJSON(val);
                    // TODO
                    // dmJs.sStore.data[realKey] = val;
                }
            }
            return val;
        },
        getStr:function(key){
            var me = this;
            var realKey = 'authz-'+ key;
            return sessionStorage.getItem(realKey);
        },
        remove:function(key){
            var me = this;
            var realKey = 'authz-'+ key;
            delete dmJs.sStore.data[realKey];
            sessionStorage.removeItem(realKey);
        },
        saveLoginInfo:function(user){
            var me = this;
            dmJs.lStore.save('cookieAccessToken', {val:user.accessToken});
            me.save('currentUser', user);
        },logout:function(callback){
            var me = this;
            var userInfo = me.getUserInfo();
            if(userInfo != null){
                var url = $.get(mainJs.getApiUrl('/urming_quan/user/logout'), {accessToken:userInfo.accessToken}).complete(function(){
                    me.remove('currentUser');
                    dmJs.lStore.remove('cookieAccessToken');
                    if($.isFunction(callback)){
                        callback();
                    }
                });
            } else {
                dmJs.lStore.remove('cookieAccessToken');
                me.remove('currentUser');
                if($.isFunction(callback)){
                    callback();
                }
            }
            viewJs.afterToggleLogin();

        },getUserInfo:function(){
            var me = this;
            var userInfo = me.get('currentUser');
            if(userInfo != null){
                userInfo.saveSelf = function(){
                    me.saveLoginInfo(this);
                };
            }
            return userInfo;
        },formatVal:function(key){
            var val = sessionStorage.getItem(key);
            if(val == 'null' || val == 'undefined'){
                var me = this;
                // TODO
                // dmJs.sStore.data[key] = value;
                val =  null;
            }
            return val;
        },reLogin:function(options){
            this.logout();
            this.toLogin(options);
        },login:function(params, callback){
            var me = this;
            me.remove('currentUser');
            me.logout(function(){
                var url = mainJs.getApiUrl('/urming_quan/user/login');
                params.password = mainJs.md5(params.password);
                $.post(url, params, function(data, statusText, jqhr){
                        var res = $.parseJSON(data);
                        //console.log(res)
                        if(res.error != null){
                            viewJs.showApiError(res);
                            return;
                        }
                        me.saveLoginInfo(res);
                        viewJs.afterToggleLogin();
                        var successTo = me.getSuccessTo('successTo');
                        if(successTo == null){
                            // $.mobile.changePage('./');
                            viewJs.navigator.next({next:{url:'./', id:'startPage'}});
                            return;
                        }
                        me.clearSuccessTo();
                        if(successTo.url != null || successTo.href != null){
                            viewJs.navigator.next({next:{url:successTo.url || successTo.href,
                                id:successTo.id,
                                options:successTo.options},
                                last:successTo.last});
                            // $.mobile.changePage(successTo.url, successTo.options);
                        } else {
                            viewJs.navigator.next({next:{url:'./', id:'startPage'}});
                            return;
                        }

                    }
                ).error(function(){
                        viewJs.showPopMsg('网络错误');
                    });
            });

        },clearSuccessTo:function(){
            var me = this;
            me.remove('successTo');
        },getSuccessTo:function(){
            var me = this;
            return me.get('successTo');
        },saveSuccessTo:function(successTo){
            if(!$.isEmptyObject(successTo)){
                var me = this;
                me.save('successTo', successTo);
            } else {
                //console.log('登录成功转向参数为空！');
            }
        },accessInvalid:function(res){
            var me = this;
            var ret = res.error_code == '20001' || res.error_code == '20003';
            if(ret){
                dmJs.lStore.remove('cookieAccessToken');
                me.remove('currentUser');
                viewJs.showPopMsg(urmingTips.accessInvalid);
            }
            return ret;
        },toLogin:function(successTo){
            var me = this;
            if(successTo != null){
                me.saveSuccessTo(successTo);
            } else {
                me.saveSuccessTo({url:'./'});
            }
            if (navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == "micromessenger") {
                window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3b462eee381207f3&redirect_uri=http%3A%2F%2Fm.edu.euming.com%2Flogin.html%3F&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
                return;
            }else{
                viewJs.navigator.next({next:{url:'./login.html', id:'signIn'}});
            }
            // $.mobile.changePage('./login.html');
        },syncBalance:function(callback){
            var me = this;
            var currentUser = me.getUserInfo();
            if(currentUser == null){
                me.toLogin();
                return
            }
            dmJs._ajax({
                maskText:'同步用户信息',
                id:'syncBalance',
                url:'/urming_quan/user/getUserPageByAccessToken',
                params:{accessToken:currentUser.accessToken,type:2},
                callback:function(data){
                    currentUser.user = data.user;
                    me.saveLoginInfo(currentUser);
                    if($.isFunction(callback)){
                        callback();
                    }
                }
            });
        }
    };
    dmJs.initData();
});
pubCnJs= {
    publishTitle:'发布赛事项目',
    namedec:'2到30个字',
    projectName:'项目名称',
    categories:'项目分类',
    contact:'联系方式',
    contactCon:'联系方式',
    introduction:'项目介绍',
    introdec:'详细的介绍，能吸引更多支持者呦',
    phone:'电话',
    email:'邮箱',
    WeChat:'微信',
    picture:'添加图片',
    insertLink:'插入链接',
    decmore:'附件请上传至第三方网盘供应商，然后在项目介绍中填入加密下载链接',
    dec:'描述',
    submit:'完成',
    pubSub:'发布',
    catPlaceh:'利于查找和管理哦~例:创新、实践',
    exit:'退出',
    chioseTag:'选择分类',
    tagTip:'点击<span class="v-fill-tag-icon">　</span>才能完成标签的输入哦！',
    tag:'手动输入标签',
    setTag:'选择标签',
    searchTitle:'赛事项目',
    pagePrev:'上一页',
    pageNext:'下一页',
    linkNamePlace:'请输入链接名称',
    linkValuePlace:'请输入链接地址',
    linkValue:'链接地址',
    linkName:'链接名称',



    turnLang:'To English'
}
pubEnJs= {
    publishTitle:'Publish',
    namedec:'a maximum of 30 characters',
    projectName:'Title',
    categories:'category',
    contact:'Contact',
    contactCon:'contact content',
    introduction:'Project introduction',
    introdec:'detailed description',
    phone:'Phone',
    email:'Email',
    WeChat:'WeChat ID',
    picture:'Add Pic',
    insertLink:'Insert link',
    decmore:'Annexes please upload to third-party Web site provider, Then fill in the introduction to encrypt download links',
    dec:'Desc.',
    submit:'submit',
    pubSub:'submit',
    catPlaceh:'tags',
    exit:'Exit',
    chioseTag:'Chiose Tags',
    tagTip:'Check<span class="v-fill-tag-icon">　</span> to chiose this tag！',
    tag:'write a tag',
    setTag:'Set Tag',
    searchTitle:'Event Project',
    pagePrev:'Prev',
    pageNext:'Next',
    linkNamePlace:'Name Of Link ',
    linkValuePlace:'Address Of Link',
    linkValue:'Address',
    linkName:'Name',

    turnLang:'切换到中文'
}
serviceCnJs={
    title :'参赛项目详情',
    buy:'支持',
    collect:'收藏',
    categories:'分 类',
    creTime:'发布时间',
    reviewNumbers:'暂无评价',
    provider:'<span class="prePageTitle">参赛项目提供者</span>',
    svrDetail:'<span class="prePageTitle">参赛项目描述</span>',
    report:'举报',
    exit:'退出',
    pubSub:'确定',



    turnLang:'To English'

}
serviceEnJs={
    title:'Project',
    buy:'Support',
    collect:'Collect ',
    categories:'Category',
    creTime:'Published Time',
    reviewNumbers:'No Review',
    provider:'<span class="prePageTitle">Provider</span>',
    svrDetail:'<span class="prePageTitle">Project Introduction</span>',
    report:'Report',
    exit:'Exit',
    pubSub:'submit',



    turnLang:'切换到中文'

}
registCnjs = {
    signUp:'公众号注册',
    group:'公司/机构/学校',
    project:'项目/团队',
    userName:'用户名',
    userNameP:'4-20位字母、数字或下划线',
    realname:'公众号',
    realnameP:'机构、企业名称',
    contactRealname:'联系人',
    contactRealnameP:'联系人姓名',
    securityCode:'验证码',
    securityCodeP:'图片验证码',
    phoneName:'手机号',
    phoneNameP:'联系人手机号',
    phoneCodeR:'获取验证码',
    phoneCode:'验证码',
    phoneCodeP:'短信验证码',
    passWord:'密码',
    passWordP:'密码',
    hide:'隐藏',
    agree:'我已阅读并接受',
    term:'《创新学堂使用协议》',
    submit:'提交',
    toLogin:'登录',
    toRegister:'注册',

    tip:'手机号仅作为公众号消息接收、联络，不能用于登录'
}
registEnjs = {
    signUp:'Sign Up',
    group:'Co./Org./School',
    project:'Project/Group',
    userName:'User Name',
    userNameP:'4-20letters,numbers,or underscores',
    realname:'Name',
    realnameP:'Name of organizations',
    contactRealname:'Contact',
    contactRealnameP:'Contact Name',
    securityCode:'ReCaptcha',
    securityCodeP:'Please enter the graphical verification code',
    phoneName:'Mobile phone',
    phoneNameP:'Mobile phone',
    phoneCodeR:'Get Code',
    phoneCode:'ReCaptcha',
    phoneCodeP:'SMS verification code',
    passWord:'Password',
    passWordP:'Password',
    hide:'Hide',
    agree:'By signing up, you agree to our <br/>',
    term:'《Terms Of Use&Privacy Policy》',
    submit:'Submit',
    toLogin:'Sign In',
    toRegister:'Sign Up',

    tip:'Mobile phone are used only for receiving account information,cannot be used to log on'
}


var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};
var urmingTips = {
	html5NotSpport:'请选择现代浏览器(chrome,uc)并保证版本较新。',
	webStorageLimit:'本地存储受限，请关闭无痕浏览模式。',
	accessInvalid:'登录失效：过期或其它设备登录'
};
var urmingLabels = {
	dfUserDesc:'暂时还没有填写'
};
// 命名空间 mainJs
var isEnableDebug = true;
var mainJs = {};
!function(a){"use strict";function b(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function c(a,b){return a<<b|a>>>32-b}function d(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)}function e(a,b,c,e,f,g,h){return d(b&c|~b&e,a,b,f,g,h)}function f(a,b,c,e,f,g,h){return d(b&e|c&~e,a,b,f,g,h)}function g(a,b,c,e,f,g,h){return d(b^c^e,a,b,f,g,h)}function h(a,b,c,e,f,g,h){return d(c^(b|~e),a,b,f,g,h)}function i(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;var d,i,j,k,l,m=1732584193,n=-271733879,o=-1732584194,p=271733878;for(d=0;d<a.length;d+=16)i=m,j=n,k=o,l=p,m=e(m,n,o,p,a[d],7,-680876936),p=e(p,m,n,o,a[d+1],12,-389564586),o=e(o,p,m,n,a[d+2],17,606105819),n=e(n,o,p,m,a[d+3],22,-1044525330),m=e(m,n,o,p,a[d+4],7,-176418897),p=e(p,m,n,o,a[d+5],12,1200080426),o=e(o,p,m,n,a[d+6],17,-1473231341),n=e(n,o,p,m,a[d+7],22,-45705983),m=e(m,n,o,p,a[d+8],7,1770035416),p=e(p,m,n,o,a[d+9],12,-1958414417),o=e(o,p,m,n,a[d+10],17,-42063),n=e(n,o,p,m,a[d+11],22,-1990404162),m=e(m,n,o,p,a[d+12],7,1804603682),p=e(p,m,n,o,a[d+13],12,-40341101),o=e(o,p,m,n,a[d+14],17,-1502002290),n=e(n,o,p,m,a[d+15],22,1236535329),m=f(m,n,o,p,a[d+1],5,-165796510),p=f(p,m,n,o,a[d+6],9,-1069501632),o=f(o,p,m,n,a[d+11],14,643717713),n=f(n,o,p,m,a[d],20,-373897302),m=f(m,n,o,p,a[d+5],5,-701558691),p=f(p,m,n,o,a[d+10],9,38016083),o=f(o,p,m,n,a[d+15],14,-660478335),n=f(n,o,p,m,a[d+4],20,-405537848),m=f(m,n,o,p,a[d+9],5,568446438),p=f(p,m,n,o,a[d+14],9,-1019803690),o=f(o,p,m,n,a[d+3],14,-187363961),n=f(n,o,p,m,a[d+8],20,1163531501),m=f(m,n,o,p,a[d+13],5,-1444681467),p=f(p,m,n,o,a[d+2],9,-51403784),o=f(o,p,m,n,a[d+7],14,1735328473),n=f(n,o,p,m,a[d+12],20,-1926607734),m=g(m,n,o,p,a[d+5],4,-378558),p=g(p,m,n,o,a[d+8],11,-2022574463),o=g(o,p,m,n,a[d+11],16,1839030562),n=g(n,o,p,m,a[d+14],23,-35309556),m=g(m,n,o,p,a[d+1],4,-1530992060),p=g(p,m,n,o,a[d+4],11,1272893353),o=g(o,p,m,n,a[d+7],16,-155497632),n=g(n,o,p,m,a[d+10],23,-1094730640),m=g(m,n,o,p,a[d+13],4,681279174),p=g(p,m,n,o,a[d],11,-358537222),o=g(o,p,m,n,a[d+3],16,-722521979),n=g(n,o,p,m,a[d+6],23,76029189),m=g(m,n,o,p,a[d+9],4,-640364487),p=g(p,m,n,o,a[d+12],11,-421815835),o=g(o,p,m,n,a[d+15],16,530742520),n=g(n,o,p,m,a[d+2],23,-995338651),m=h(m,n,o,p,a[d],6,-198630844),p=h(p,m,n,o,a[d+7],10,1126891415),o=h(o,p,m,n,a[d+14],15,-1416354905),n=h(n,o,p,m,a[d+5],21,-57434055),m=h(m,n,o,p,a[d+12],6,1700485571),p=h(p,m,n,o,a[d+3],10,-1894986606),o=h(o,p,m,n,a[d+10],15,-1051523),n=h(n,o,p,m,a[d+1],21,-2054922799),m=h(m,n,o,p,a[d+8],6,1873313359),p=h(p,m,n,o,a[d+15],10,-30611744),o=h(o,p,m,n,a[d+6],15,-1560198380),n=h(n,o,p,m,a[d+13],21,1309151649),m=h(m,n,o,p,a[d+4],6,-145523070),p=h(p,m,n,o,a[d+11],10,-1120210379),o=h(o,p,m,n,a[d+2],15,718787259),n=h(n,o,p,m,a[d+9],21,-343485551),m=b(m,i),n=b(n,j),o=b(o,k),p=b(p,l);return[m,n,o,p]}function j(a){var b,c="";for(b=0;b<32*a.length;b+=8)c+=String.fromCharCode(a[b>>5]>>>b%32&255);return c}function k(a){var b,c=[];for(c[(a.length>>2)-1]=void 0,b=0;b<c.length;b+=1)c[b]=0;for(b=0;b<8*a.length;b+=8)c[b>>5]|=(255&a.charCodeAt(b/8))<<b%32;return c}function l(a){return j(i(k(a),8*a.length))}function m(a,b){var c,d,e=k(a),f=[],g=[];for(f[15]=g[15]=void 0,e.length>16&&(e=i(e,8*a.length)),c=0;16>c;c+=1)f[c]=909522486^e[c],g[c]=1549556828^e[c];return d=i(f.concat(k(b)),512+8*b.length),j(i(g.concat(d),640))}function n(a){var b,c,d="0123456789abcdef",e="";for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),e+=d.charAt(b>>>4&15)+d.charAt(15&b);return e}function o(a){return unescape(encodeURIComponent(a))}function p(a){return l(o(a))}function q(a){return n(p(a))}function r(a,b){return m(o(a),o(b))}function s(a,b){return n(r(a,b))}function t(a,b,c){return b?c?r(b,a):s(b,a):c?p(a):q(a)}"function"==typeof define&&define.amd?define(function(){return t}):a.md5=t}(mainJs);
mainJs.PAGE_SIZE = 20;
mainJs.publishVer =261;
mainJs.MATCH_WAIT = 5;
mainJs.vars = {
	// apiRootURL:'http://pkuie.euming.com/',
	// imgRootUrl:'http://pkuie.euming.com/quan_img/',
	apiRootURL:'http://192.168.50.110:8081/',
    //124.205.35.186

	imgRootUrl:'http://cdnimg2.edu.euming.com/pkuie',
	imgUserRootUrl:'http://cdnimg2.edu.euming.com/pkuie/userInfo',
	resourceURL:'./resource',

	defaultSvrImg:'./resource/images/defaultImg/serviceB.png',
	defaultSvrImgs:'./resource/images/defaultImg/service.png',
	defaultSaiImg:'./resource/images/bigsai.png',

	defaultActImg:'./resource/images/defaultImg/activeB.png',
	defaultActImgs:'./resource/images/defaultImg/active.png',


	defaultCourImg:'./resource/images/defaultImg/courseB.png',
	defaultCourImgs:'./resource/images/defaultImg/course.png',


	defaultFundingImg:'./resource/images/defaultImg/fundingB.png',
	defaultFundingImgs:'./resource/images/defaultImg/funding.png',

	defaultManImg:'/systemdefault/mobile/man_profile.png',
	defaultWomenImg:'/systemdefault/mobile/women_profile.png',
	bigImg:'@480w',
	defautImg:'',
	smallImg:'@160w',
	reloadPage:false
};
if(isEnableDebug && location.hostname.search('euming.com') == -1 || location.hostname.search('test') > -1){
	mainJs.vars.apiRootURL = 'http://192.168.50.110:8081/';
	mainJs.vars.imgRootUrl = 'http://cdnimg2.edu.euming.com/pkuie';
	mainJs.vars.imgUserRootUrl = 'http://cdnimg2.edu.euming.com/pkuie/userInfo/';
	$(function(){$.getScript('resource/js/system/beta.js');});
}
mainJs._getUrl = function(urlParts){
		return urlParts.join('/').replace(/\/{2,}/g, '/').replace(/:\//, '://');
};

mainJs.getResourceURL = function(url){
	return mainJs._getUrl([mainJs.vars.resourceURL, url]);
};
mainJs.getApiUrl = function(url){
	return mainJs._getUrl([mainJs.vars.apiRootURL, url]).replace('urming_quan','urming_pkuie');
};

mainJs.getSvrPicUrl = function(options,bSai){
	var root1;
    var defroot;
	if(options.url != null && options.url != ''){
        options.url = options.url.split(',')[0];
		if(options.size == '1'){
			root1  = mainJs.vars.bigImg;
		} else if(options.size == '2'){
			root1  = mainJs.vars.smallImg;
		} else{
			root1  = mainJs.vars.defautImg;
		}
        var url = options.url+root1;
        return mainJs._getUrl([mainJs.vars.imgRootUrl,url]);
	}else{
        var url;
        if(bSai){
            url =  mainJs.vars.defaultSaiImg;
            return url;
        }
        if(options.size == '2'){
            url = mainJs.vars.defaultSvrImgs;
        }else{
            url=mainJs.vars.defaultSvrImg;
        }



        return url;
    }
};
mainJs.getFunPicUrl = function(options){
    var root1;
    var defroot;
    if(options.url != null && options.url != ''){
        options.url = options.url.split(',')[0];
        if(options.size == '1'){
            root1  = mainJs.vars.bigImg;
        } else if(options.size == '2'){
            root1  = mainJs.vars.smallImg;
        } else{
            root1  = mainJs.vars.defautImg;
        }
        var url = options.url+root1;
        return mainJs._getUrl([mainJs.vars.imgRootUrl,url]);
    }else{

        var url ;
        if(options.size == '2'){
            url = mainJs.vars.defaultFundingImgs;
        }else{
            url=mainJs.vars.defaultFundingImg;
        }
        return url;
    }
};
mainJs.getActPicUrl = function(options){
    var root1;
    var defroot;
    if(options.url != null && options.url != ''){
        options.url = options.url.split(',')[0];
        if(options.size == '1'){
            root1  = mainJs.vars.bigImg;
        } else if(options.size == '2'){
            root1  = mainJs.vars.smallImg;
        } else if(options.size == 0){
            root1  = mainJs.vars.defautImg;
        }
        var url = options.url+root1;
        return mainJs._getUrl([mainJs.vars.imgRootUrl,url]);
    }else{
        var url ;
        if(options.size == '2'){
            url = mainJs.vars.defaultActImgs;
        }else{
            url=mainJs.vars.defaultActImg;
        }
        //console.log(url)
        return url;
    }
};
mainJs.getCoursPicUrl = function(options){
    var root1;
    var defroot;

    //console.log(mainJs.vars.imgRootUrl)
    if(options.url != null && options.url != ''){
        options.url = options.url.split(',')[0];
        if(options.size == '1'){
            root1  = mainJs.vars.bigImg;
        } else if(options.size == '2'){
            root1  = mainJs.vars.smallImg;
        } else if(options.size == 0){
            root1  = mainJs.vars.defautImg;
        }
        var url = options.url +root1;
        return mainJs._getUrl([mainJs.vars.imgRootUrl,url]);

    }else{
        var url ;
        if(options.size == '2'){
            url = mainJs.vars.defaultCourImgs;
        }else{
            url=mainJs.vars.defaultCourImg;
        }

        return url;
    }
};

$(function(){
	var regExp = /pageSize=/;
    var regExp1 = /(getInteractionList)|(publishInteraction)/;

	var isLoadingNext = function(options){

		if(options.type =="POST" && regExp.test(options.data)&&!regExp1.test(options.url) ){
			return true;
		}
		if(options.type =="GET" && regExp.test(options.url)&&!regExp1.test(options.url)){
			return true;
		}
        return false;

	};
	$(document).ajaxSend(function(e, jqxhr, options){
		if(isLoadingNext(options)){
			viewJs._maskLoadingMore();
		}

	}).ajaxComplete(function(e, jqxhr, options){
		if(isLoadingNext(options)){
			viewJs._endLoadingMore();
		}
	});
});
mainJs.getProfilePicUrl = function(options){
		var url = $.trim(options.url);
		var root1 = '';
		if(url == ''){
			root1 = '';
			if(options.sex == '1'){
				url = mainJs.vars.defaultManImg;
			} else if(options.sex == '2'){
				url = mainJs.vars.defaultWomenImg;
			}  else {
				return 'resource/images/404-user.png';
			}
		}
		return mainJs._getUrl([mainJs.vars.imgUserRootUrl, root1, url]);
};

mainJs.parseSexToWord = function(sex){
	switch($.trim(sex)){
		case '1':
			return 'man';
		case '2':
		 return 'woman';
	}
	return 'unknow';
};
mainJs.watchPosition=function(){
	var watcher = null, options={
		enableHighAccuracy:true,
		timeout:4000
	};
	window.urmingGeolocation = 1;
	if(browser.versions.mobile && window.navigator.geolocation){
		// 创建地理编码实例
		var getAddressDescription = function(data){
			 if (data && data.status == 0){
				 var result = data.result;
				 dmJs.params.geolocation.city = (result.addressComponent.city).replace(/市$/, '');
				 dmJs.params.geolocation.district = result.addressComponent.district;
				 dmJs.params.geolocation.street = result.addressComponent.street;
				 dmJs.params.geolocation.area2 = result.addressComponent.area2;
				 dmJs.params.geolocation.area3 = result.addressComponent.area3;
				 dmJs.params.geolocation.latitude = result.location.lat;
				 dmJs.params.geolocation.longitude = result.location.lng;
			 }
			 viewJs.hideBusyMask('watchPosition');
		};
		//viewJs.maskBusy('定位中', 'watchPosition');
		watcher = navigator.geolocation.getCurrentPosition(function(position){ 
			var coords = position.coords;
			// 根据坐标得到地址描述  
			var params = [coords.latitude,coords.longitude].join(',');
			var url = 'http://api.map.baidu.com/geocoder/v2/?ak=1NdP3HNjGyuesNmTLEK10Gx8&location='+params+'&output=json&pois=0';
			$.ajax({url:url, dataType:'jsonp', success:getAddressDescription, error:
				function(){
					//viewJs.hideBusyMask('watchPosition');
					//viewJs.showPopMsg('定位失败！');
					}

            });
		}, function(){
			console.log(arguments);
			console.log('更新地理位置失败！');
			//viewJs.hideBusyMask('watchPosition');
			//viewJs.showPopMsg('定位失败！');
			// viewJs.hideBusyMask();
		}, options);
	} else {
		if(!window.navigator.geolocation){
			viewJs.showPopMsg('浏览器不支持地理位置！');
		} else{
			viewJs.showPopMsg('对于您的设备暂不支持定位！');
		}
	}
};
mainJs.isPageShow = function(args){
	// return true;
	return args[0].currentTarget.tagName == "HTML";
};
mainJs.bindClick = function(){

		// 增加手动输入标签
	$.mobile.document.on('vclick', '.tagIcon', function(){
		viewJs.clickManuallyEnterIcon(this);
	});
	// TODO
	// 发布服务
	$.mobile.document.on('vclick', '.radioGrp .radioItem:not(.sel)', function(){
		var $el = $(this);
		$el.addClass('sel').siblings('.radioItem').removeClass('sel');
		// TODO
		if($el.is('.person')){
			$el.parents('.vForm').addClass('person').removeClass('enterprise');
		} else{
			$el.parents('.vForm').addClass('enterprise').removeClass('person');
		}
	});
	// 已购买服务tab
	$.mobile.document.on('vclick', '.tabHeader .header:not(.current)', function(){
		var $m = $(this);
		var tabi = $m.attr('tabi');
		var current = $m.parents('.tabCtr').find('[tabi='+tabi+']');
		var last = $m.parents('.tabCtr').find('[tabi='+(3-tabi)+']');
		var lastCt  = last.end().find('[tabi='+(3-tabi)+'].content');
		var currentCt  = last.end().find('[tabi='+tabi+'].content');
		last.removeClass('current');
		if(tabi == 1){
			currentCt.css({left:"100%"});
		} else {
			currentCt.css({left:"-100%"});
		}
		current.addClass('current');
		currentCt.animate({left:"0"},{queue:true});	
        $m.trigger('tabchange');
	});
	$.mobile.document.on( 'vclick', '.vRadioGrp .vRadio:not(.selected)', function() {
		viewJs.onVRadioChange(this);
	});
    //console.log($.mobile.document.find('.navigateBackBtn'))
	$.mobile.document.on( 'vclick', '.navigateBackBtn', function() {
        //console.log('back')
		viewJs.navigator.pre();
	});
	$.mobile.document.on('vclick', '.toLogin', function(){
		dmJs.sStore.toLogin({url:'./mine.html'});
	});
	$.mobile.document.on('vclick', '.toSearchPage', function(){
		viewJs.navigator.next({next:{url:'./search.html', id:'doSearchSvr'}});
	});
	// 服务评价详情
	$.mobile.document.on( 'vclick', '.svrGrade.isBtn', function() {
		var params = mainJs.parseUrlSearch();
		var $m = $(this);
		var reviewNumbers = $m.data('reviewNumbers');
		var extra = $m.data('extra');
		viewJs.navigator.next({
			next:{url:'./reviews.html', id:'reviews',
				options:{
					data:$.extend({offset:0, pageSize:20,reviewNumbers:reviewNumbers
							}, extra)
				}},
			lastAuto:true
		});
	});
};
mainJs.checkHtml5Support = function(){
	if(!window.localStorage || !window.sessionStorage){
		return  urmingTips.html5NotSpport;
	}
};
mainJs.checkWebStorage = function(){
	try {
		localStorage.setItem('checkWebStorage', 'a');
		localStorage.removeItem('checkWebStorage');
		return;
	} catch(ex){
		return urmingTips.webStorageLimit;
	}
};
mainJs.checkSupport = function(){
	var msg = mainJs.checkHtml5Support();
	if(!msg){
		msg = mainJs.checkWebStorage();
	}
	if(msg){
		viewJs.dialogPop(msg, null, '错误', {onlyBtnOk:true,front:true});
		return false;
	}
	return true;
};
mainJs.isPageBeforeShow = function(el){
	return el.tagName =='DIV';
};
$( document ).on( "mobileinit", function(){
    $.mobile.pageLoadErrorMessage = "页面加载失败";
    $.event.special.swipe.horizontalDistanceThreshold = 5;
    $.event.special.swipe.durationThreshold = 500;
    $.mobile.page.prototype.options.domCache = false;
    $.getJs({varName:'notifyJs',ns:window,ajaxOpt:{success:function(){
        notifyJs.init();
    }},url:mainJs.getResourceURL('/js/system/notify.js')+'?ver='+mainJs.publishVer});


	var $input = $('<input>');
	$.mobile.document.on('pagebeforehide', '*', function(){
		$.mobile.document.unbind('vclick');
		$input.focus();
	});
	$.mobile.document.on('pageshow', '*', function(e, obj){
		$.mobile.document.unbind('vclick');
		if(!mainJs.isPageShow(arguments)){
			return;
		}
		setTimeout(mainJs.bindClick, 500);
		viewJs.maskBusy(null, 'pagechange');
		//mainJs.bindClick();
	});
	$.mobile.document.on( 'pageshow', '*', function() {
		if(!mainJs.checkSupport()){
			return;
		}
		viewJs.hideBusyMask('pagechange');
	});
    var initPage = function(){
        viewJs.loadJs({varName:'headerFooterJs', url:'/js/common/headerFooter.js',title:'页眉页脚'});
        var $p = $.mobile.activePage;
        if($p.is('.ui-page')){

            viewJs.renderPage($p.attr('id'));
        }
    };
	$.mobile.document.on( 'pagebeforeshow', '*', function() {
		if(!mainJs.isPageBeforeShow(this)){return;}
        var browserInfo = browser.versions;
        var classes = [];
        for(var k in browserInfo){
            if(browserInfo[k] == true){
                classes.push('urming-'+k);
            }
        }
        classes = classes.join(' ');
        //console.log('sss:'+classes);
        $(document.body).addClass(classes);
        if(browserInfo.iosMobile){
            $.mobile.activePage.find('file').attr('camera', null);
        }
        dmJs.sStore.getLoginUser(initPage);

	});
});
mainJs.parseUrlSearch = function(url){
	var keyValues = decodeURIComponent(url || location.search).replace(/^.*\?/,'').split('&');
	var l = keyValues.length,i = 0, params = {}, kv,index;
	for(; i < l; i++){
        kv = keyValues[i];
        index = kv.indexOf('=');
        if(index == -1){
            index = kv.length;
        }
        params[$.trim(kv.substring(0, index))] = $.trim(kv.substring(index+1));
	}
    //console.log(params);
	return params;
};
mainJs.parseUrlSearchTop = function(url){
    var keyValues = decodeURIComponent(url || window.top.location.search).replace(/^.*\?/,'').split('&');
    var l = keyValues.length,i = 0, params = {}, kv,index;
    for(; i < l; i++){
        kv = keyValues[i];
        index = kv.indexOf('=');
        if(index == -1){
            index = kv.length;
        }
        params[$.trim(kv.substring(0, index))] = $.trim(kv.substring(index+1));
    }
    return params;
};
mainJs.getPos =function(){
	if(window.urmingGeolocation == null){
		mainJs.watchPosition();
	}
};
mainJs.encode = function(val){
    return Base64.encode(encodeURIComponent(val));
};
mainJs.decode = function(val){
    return decodeURIComponent(Base64.decode(val));
};
function isScrollBottom(){
	if($.mobile == null || $.mobile.activePage == null){
		return;
	}
	 var $w = $(window);
	 if($w.scrollTop() == $(document).height()-$w.height()){
		return true;
	 }
}
$(function(){
	$(document).on("scrollstop", function (e) {
		var scrollTop = $(this).scrollTop();
		var $p = $.mobile.activePage;
		if($p != null){
			var $top = $('#toTop');
			if($top.length > 0){
				if(scrollTop > 2){
					$top.show();
				} else {
					$top.hide();
				}
			}
		}
	});
});