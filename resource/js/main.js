

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