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