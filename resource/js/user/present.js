presentJs = {
	init:function(){
		this.toggleEvents(true);
        this.initPage();
	},initPage:function(){
		var $p = $.mobile.activePage;
		$(".ui-footer").remove();
		var params = mainJs.parseUrlSearch();
		params.random = Math.random();//避免缓冲
		$.get(mainJs.getApiUrl('/urming_quan/user/getPresent'), params, function(data){
			var r = $.parseJSON(data);
			if (null != r.error){
				var msgs = dmJs.i18n.getMsgs('msg_api');
				var msg;
				if(msgs == null){
					msg =  r.error;
				} else {
					msg = msgs[r.error_code] || r.error;
				}
				$(".content").empty();
				$(".content").html('<span>'+ msg +'</span>');
				$('.top > div').hide();
				$('.footer > span:first-child').hide();
			}else{
				$('.top > div > span:first-child').html(r.present.unitprice);
				$('.footer > span:nth-child(2)').html(r.present.regards);
				$('.footer > span:nth-child(3)').html(r.present.user.realname);
				$('.footer > span:nth-child(4) > span').html(r.present.amount-r.present.remainder);
			}
			$(".content").show();
		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});
		$("#present").height(document.body.clientHeight);
		dmJs._ajax({
			id:'getTempCode',
			url:'/urming_quan/system/getTempCode',
			callback:function(data){
				$p.find(".securityCode > img").data("tempCode",data.data.code);
				presentJs.createSecurityCode();
			}
		})
		$.get(mainJs.getApiUrl('/urming_quan/user/getWxJsApi'), {url:location.href.split('#')[0],random:Math.random()}, function(data){
			var r = $.parseJSON(data);
			wx.config({
				debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: 'wx3b462eee381207f3', // 必填，公众号的唯一标识
				timestamp: r.timestamp , // 必填，生成签名的时间戳
				nonceStr: r.noncestr, // 必填，生成签名的随机串
				signature: r.signature,// 必填，签名，见附录1
				jsApiList: ['onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});
			wx.ready(function(){
				wx.onMenuShareAppMessage({
					title: '创新学堂实践金', // 分享标题
					desc: '我们在创新学堂发了实践金给您，立刻来领吧', // 分享描述
					link: location.href.split('#')[0], // 分享链接
					imgUrl: 'http://m.edu.euming.com/resource/images/present/top100.png', // 分享图标
					type: 'link', // 分享类型,music、video或link，不填默认为link
					dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
					success: function () {
						// 用户确认分享后执行的回调函数
					},
					cancel: function () {
						// 用户取消分享后执行的回调函数
					}
				});
				wx.error(function(res){
					//alert(res);
					// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
				});
			});
		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});
    },toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = presentJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.vbt.submit', 'vclick', me.submit);
				$p.delegate('.goto-edu', 'vclick', me.gotoEdu);
				$p.delegate('.footer > span:nth-child(6)', 'vclick', me.explain);
				$p.delegate('.securityCode > img', 'vclick', me.createSecurityCode);
				$p.delegate('.vbt.sendCode:not(.busy)', 'vclick', me.getVerifyCode);
                $p.delegate('[data-format]', 'input', viewJs.validInput);
                $p.delegate('.phone input', 'input', me.onPhoneInput);
                $p.delegate('#register_term', 'vclick', function(){
                    window.open($(this).attr('data-href'));
                });
			}, 500);
		}
	},getVerifyCode:function(){
		var $p = $.mobile.activePage;
		var mobile = $p.find('.vTr.phone input').val();
		mobile = $.trim(mobile);
		if(mobile == ''){
			return;
		}
		var verifyCode = $p.find('.securityCode input').val();
		var tempCode = $p.find(".securityCode > img").data("tempCode");
		//viewJs.getVerifyCode();
		$.get(mainJs.getApiUrl('/urming_quan/user/getVerifyCodeTmp'), {mobile:mobile,verifyCode:verifyCode,tempCode:tempCode}, function(data){
			var r = $.parseJSON(data);
			if (null != r.error){
				var msgs = dmJs.i18n.getMsgs('msg_api');
				var msg;
				if(msgs == null){
					msg =  r.error;
				} else {
					msg = msgs[r.error_code] || r.error;
				}
				viewJs.showPopMsg(msg);
				return;
			}
			dmJs.sStore.save('tempAccessToken', r.tempAccessToken);
			dmJs.sStore.save('tempAccessToken_mobile', mobile);
			viewJs.setClock($p.find('.vbt.sendCode'), {html:'（{0}）重新获取', time:60});
			viewJs.showPopMsg('验证码已发送');
		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});

	},submit:function(){
		var me = presentJs;
		var f = me.validateBindMobileForm();
		if(f != null){
            me._submit(f);
		}
	},_submit:function(f){
		$.get(mainJs.getApiUrl('/urming_quan/user/receive'),f , function(data){
			var r = $.parseJSON(data);
			if (null != r.error) {
				var msgs = dmJs.i18n.getMsgs('msg_api');
				var msg;
				if(msgs == null){
					msg =  r.error;
				} else {
					msg = msgs[r.error_code] || r.error;
				}
				if(r.error_code < 20700){
					viewJs.showPopMsg(msg);
				}else{
					$(".content").empty();
					$(".content").html('<span>'+ msg +'</span>');
				}
				return;
			}
			var $p = $.mobile.activePage;
			var dlg = $('#dialogPopMsg');
			if(dlg.length == 0){
				dlg = $(
					['<div id="dialogPopMsg" class="dlgPop-overlay" style="background-color:rgba(0,0,0,.6);">',
						'<div class="dlgPop-box ui-corner-all ui-footer-fixed">',

						'<div class="dialog-content">',
						'<div class="dialog-mess">',
						'恭喜您<br>成功领取实践金<br>￥'+$('.top > div > span:first-child').html(),
						'</div>',
						'<div class="dialog-goto-edu">',
						'<a class="vbt submit goto-edu" style="margin-left: 20%;margin-right:20%;" data-role="button">立即使用</a>',
						'</div>',
						'</div>',

						'</div>',
						'</div>'].join('')).hide();
			}
			$p.append(dlg);
			var btn_close = dlg.find('.dialog-close').unbind('click');
			setTimeout(function(){
				btn_close.unbind('click').bind('click', function(){
					dlg.hide();
				});
			},500);
			dlg.show();
		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});

	},validateBindMobileForm:function(){
		var $f = $('#present .vForm');
        var $p = $.mobile.activePage;
		var maxLength = 20;
		var msg;
        var params = mainJs.parseUrlSearch();
		
		var verifyCode = $.trim($f.find('.vTr.verifyCode input').val());
		var tempAccessToken = $.trim(dmJs.sStore.get('tempAccessToken'));
        var accessTokenMobile = dmJs.sStore.get('tempAccessToken_mobile');
        var inputPhone = $.trim($f.find('.vTr.phone input').val());
		
		if(!msg){
			msg = viewJs.validate({name:'验证码', val:verifyCode, must:true});
		}
		if(!msg){
            if(tempAccessToken ==''){
                msg ="请获取验证码";
            }
		}
        if(!msg){
            if(inputPhone !== accessTokenMobile){
                msg ="手机号和获取验证码的手机号不符";
            }
        }

		if(msg){
			viewJs.showPopMsg(msg);
			return;
		}
		var f = {verifyCode:verifyCode,tempAccessToken:tempAccessToken,secretKey:params.secretKey,presentID:params.presentID};
		return f;
	},gotoEdu:function(){
		$.mobile.activePage.find("#dialogPopMsg").remove();
		viewJs.navigator.next({
			next: {
				url: "./",
				id: "startPage"
			}
		});
		//$('#dialogPopMsg').hide();
	},explain:function(){
		viewJs.navigator.next({
			next: {
				url: "./explain.html",
				id: "explain"
			},last: {
				url:'./present.html', id:'present',
				options:{data:mainJs.parseUrlSearch()}
			}
		});
		/*
		var $p = $.mobile.activePage;
		var dlg = $('#dialogPopMsg');
		dlg = $(
			['<div id="dialogPopMsg" class="dlgPop-overlay" style="background-color:rgba(0,0,0,.6);">',
				'<div class="dlgPop-explain dlgPop-box ui-corner-all ui-footer-fixed">',

				'<div class="dialog-close">',
				'<span class="close"></span>',
				'</div>',
				'<div class="dialog-content explain-content">',
				'<div class="dialog-mess">',
				'<p>活动说明：</p>',
				'<p>【实践金】创新学堂平台提供给创业者的资金，用于支持创业启动与开展实践学习。</p>',
				'<p>使用说明：</p>',
				'<p>1、接收到“实践金”卡的学员，点击领取，注册登录“创新学堂平台”，其现金账户余额获得基金。</p>',
				'<p>2、学员使用100元实践金，报名"创新思维与创业管理（成都）"课程，以实践金支付学费。余额进行课上互动实践训练（或购买其他课程、服务、需求等）。</p>',
				'<p>3、创新学堂平台4G创新课程上课期间进行互动交易，绩效得分最高学员，不但获得创业服务收益，而且获得奖学金与天使投资优先权。</p>',
				'<p>4、一个学员只能领取一次"实践金"，同一手机、微信号、支付账号等均视为一个学员用户。</p>',
				'<p>5、非正常途径获得"实践金"视为无效，创新学堂保留最终解释权。</p>',
				'</div>',
				'</div>',

				'</div>', '</div>'].join('')).hide();
		$p.append(dlg);
		var btn_close = dlg.find('.dialog-close').unbind('click');
		setTimeout(function(){
			btn_close.unbind('click').bind('click', function(){
				dlg.hide();
			});
		},500);
		dlg.show();
		*/
	},createSecurityCode:function(){
		var $p = $.mobile.activePage;
		var tempCode = $p.find(".securityCode > img").data("tempCode");
		$p.find(".securityCode > img").attr("src",mainJs.getApiUrl("/urming_quan/system/getImgVerifyCode")+"?code="+tempCode+"&width=78&height=30&random="+Math.random());
	},onPhoneInput:function(){
		var $p = $.mobile.activePage;
		var $el = $(this);
		var val = $.trim($el.val()).replace(/\D/g, '');
		$el.val(val);
		if(val == ''){
			$p.find('.sendCode').removeClass('enable')
		} else {
			$p.find('.sendCode').addClass('enable')
		}
	}
};

!function(a,b){"function"==typeof define&&(define.amd||define.cmd)?define(function(){return b(a)}):b(a,!0)}(this,function(a,b){function c(b,c,d){a.WeixinJSBridge?WeixinJSBridge.invoke(b,e(c),function(a){g(b,a,d)}):j(b,d)}function d(b,c,d){a.WeixinJSBridge?WeixinJSBridge.on(b,function(a){d&&d.trigger&&d.trigger(a),g(b,a,c)}):d?j(b,d):j(b,c)}function e(a){return a=a||{},a.appId=z.appId,a.verifyAppId=z.appId,a.verifySignType="sha1",a.verifyTimestamp=z.timestamp+"",a.verifyNonceStr=z.nonceStr,a.verifySignature=z.signature,a}function f(a){return{timeStamp:a.timestamp+"",nonceStr:a.nonceStr,"package":a.package,paySign:a.paySign,signType:a.signType||"SHA1"}}function g(a,b,c){var d,e,f;switch(delete b.err_code,delete b.err_desc,delete b.err_detail,d=b.errMsg,d||(d=b.err_msg,delete b.err_msg,d=h(a,d,c),b.errMsg=d),c=c||{},c._complete&&(c._complete(b),delete c._complete),d=b.errMsg||"",z.debug&&!c.isInnerInvoke&&alert(JSON.stringify(b)),e=d.indexOf(":"),f=d.substring(e+1)){case"ok":c.success&&c.success(b);break;case"cancel":c.cancel&&c.cancel(b);break;default:c.fail&&c.fail(b)}c.complete&&c.complete(b)}function h(a,b){var d,e,f,g;if(b){switch(d=b.indexOf(":"),a){case o.config:e="config";break;case o.openProductSpecificView:e="openProductSpecificView";break;default:e=b.substring(0,d),e=e.replace(/_/g," "),e=e.replace(/\b\w+\b/g,function(a){return a.substring(0,1).toUpperCase()+a.substring(1)}),e=e.substring(0,1).toLowerCase()+e.substring(1),e=e.replace(/ /g,""),-1!=e.indexOf("Wcpay")&&(e=e.replace("Wcpay","WCPay")),f=p[e],f&&(e=f)}g=b.substring(d+1),"confirm"==g&&(g="ok"),"failed"==g&&(g="fail"),-1!=g.indexOf("failed_")&&(g=g.substring(7)),-1!=g.indexOf("fail_")&&(g=g.substring(5)),g=g.replace(/_/g," "),g=g.toLowerCase(),("access denied"==g||"no permission to execute"==g)&&(g="permission denied"),"config"==e&&"function not exist"==g&&(g="ok"),b=e+":"+g}return b}function i(a){var b,c,d,e;if(a){for(b=0,c=a.length;c>b;++b)d=a[b],e=o[d],e&&(a[b]=e);return a}}function j(a,b){if(!(!z.debug||b&&b.isInnerInvoke)){var c=p[a];c&&(a=c),b&&b._complete&&delete b._complete,console.log('"'+a+'",',b||"")}}function k(){if(!("6.0.2">w||y.systemType<0)){var b=new Image;y.appId=z.appId,y.initTime=x.initEndTime-x.initStartTime,y.preVerifyTime=x.preVerifyEndTime-x.preVerifyStartTime,C.getNetworkType({isInnerInvoke:!0,success:function(a){y.networkType=a.networkType;var c="https://open.weixin.qq.com/sdk/report?v="+y.version+"&o="+y.isPreVerifyOk+"&s="+y.systemType+"&c="+y.clientVersion+"&a="+y.appId+"&n="+y.networkType+"&i="+y.initTime+"&p="+y.preVerifyTime+"&u="+y.url;b.src=c}})}}function l(){return(new Date).getTime()}function m(b){t&&(a.WeixinJSBridge?b():q.addEventListener&&q.addEventListener("WeixinJSBridgeReady",b,!1))}function n(){C.invoke||(C.invoke=function(b,c,d){a.WeixinJSBridge&&WeixinJSBridge.invoke(b,e(c),d)},C.on=function(b,c){a.WeixinJSBridge&&WeixinJSBridge.on(b,c)})}var o,p,q,r,s,t,u,v,w,x,y,z,A,B,C;if(!a.jWeixin)return o={config:"preVerifyJSAPI",onMenuShareTimeline:"menu:share:timeline",onMenuShareAppMessage:"menu:share:appmessage",onMenuShareQQ:"menu:share:qq",onMenuShareWeibo:"menu:share:weiboApp",onMenuShareQZone:"menu:share:QZone",previewImage:"imagePreview",getLocation:"geoLocation",openProductSpecificView:"openProductViewWithPid",addCard:"batchAddCard",openCard:"batchViewCard",chooseWXPay:"getBrandWCPayRequest"},p=function(){var b,a={};for(b in o)a[o[b]]=b;return a}(),q=a.document,r=q.title,s=navigator.userAgent.toLowerCase(),t=-1!=s.indexOf("micromessenger"),u=-1!=s.indexOf("android"),v=-1!=s.indexOf("iphone")||-1!=s.indexOf("ipad"),w=function(){var a=s.match(/micromessenger\/(\d+\.\d+\.\d+)/)||s.match(/micromessenger\/(\d+\.\d+)/);return a?a[1]:""}(),x={initStartTime:l(),initEndTime:0,preVerifyStartTime:0,preVerifyEndTime:0},y={version:1,appId:"",initTime:0,preVerifyTime:0,networkType:"",isPreVerifyOk:1,systemType:v?1:u?2:-1,clientVersion:w,url:encodeURIComponent(location.href)},z={},A={_completes:[]},B={state:0,res:{}},m(function(){x.initEndTime=l()}),C={config:function(a){z=a,j("config",a);var b=z.check===!1?!1:!0;m(function(){var a,d,e;if(b)c(o.config,{verifyJsApiList:i(z.jsApiList)},function(){A._complete=function(a){x.preVerifyEndTime=l(),B.state=1,B.res=a},A.success=function(){y.isPreVerifyOk=0},A.fail=function(a){A._fail?A._fail(a):B.state=-1};var a=A._completes;return a.push(function(){z.debug||k()}),A.complete=function(){for(var c=0,d=a.length;d>c;++c)a[c]();A._completes=[]},A}()),x.preVerifyStartTime=l();else{for(B.state=1,a=A._completes,d=0,e=a.length;e>d;++d)a[d]();A._completes=[]}}),z.beta&&n()},ready:function(a){0!=B.state?a():(A._completes.push(a),!t&&z.debug&&a())},error:function(a){"6.0.2">w||(-1==B.state?a(B.res):A._fail=a)},checkJsApi:function(a){var b=function(a){var c,d,b=a.checkResult;for(c in b)d=p[c],d&&(b[d]=b[c],delete b[c]);return a};c("checkJsApi",{jsApiList:i(a.jsApiList)},function(){return a._complete=function(a){if(u){var c=a.checkResult;c&&(a.checkResult=JSON.parse(c))}a=b(a)},a}())},onMenuShareTimeline:function(a){d(o.onMenuShareTimeline,{complete:function(){c("shareTimeline",{title:a.title||r,desc:a.title||r,img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},onMenuShareAppMessage:function(a){d(o.onMenuShareAppMessage,{complete:function(){c("sendAppMessage",{title:a.title||r,desc:a.desc||"",link:a.link||location.href,img_url:a.imgUrl||"",type:a.type||"link",data_url:a.dataUrl||""},a)}},a)},onMenuShareQQ:function(a){d(o.onMenuShareQQ,{complete:function(){c("shareQQ",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},onMenuShareWeibo:function(a){d(o.onMenuShareWeibo,{complete:function(){c("shareWeiboApp",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},onMenuShareQZone:function(a){d(o.onMenuShareQZone,{complete:function(){c("shareQZone",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},startRecord:function(a){c("startRecord",{},a)},stopRecord:function(a){c("stopRecord",{},a)},onVoiceRecordEnd:function(a){d("onVoiceRecordEnd",a)},playVoice:function(a){c("playVoice",{localId:a.localId},a)},pauseVoice:function(a){c("pauseVoice",{localId:a.localId},a)},stopVoice:function(a){c("stopVoice",{localId:a.localId},a)},onVoicePlayEnd:function(a){d("onVoicePlayEnd",a)},uploadVoice:function(a){c("uploadVoice",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},downloadVoice:function(a){c("downloadVoice",{serverId:a.serverId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},translateVoice:function(a){c("translateVoice",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},chooseImage:function(a){c("chooseImage",{scene:"1|2",count:a.count||9,sizeType:a.sizeType||["original","compressed"],sourceType:a.sourceType||["album","camera"]},function(){return a._complete=function(a){if(u){var b=a.localIds;b&&(a.localIds=JSON.parse(b))}},a}())},previewImage:function(a){c(o.previewImage,{current:a.current,urls:a.urls},a)},uploadImage:function(a){c("uploadImage",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},downloadImage:function(a){c("downloadImage",{serverId:a.serverId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},getNetworkType:function(a){var b=function(a){var c,d,e,b=a.errMsg;if(a.errMsg="getNetworkType:ok",c=a.subtype,delete a.subtype,c)a.networkType=c;else switch(d=b.indexOf(":"),e=b.substring(d+1)){case"wifi":case"edge":case"wwan":a.networkType=e;break;default:a.errMsg="getNetworkType:fail"}return a};c("getNetworkType",{},function(){return a._complete=function(a){a=b(a)},a}())},openLocation:function(a){c("openLocation",{latitude:a.latitude,longitude:a.longitude,name:a.name||"",address:a.address||"",scale:a.scale||28,infoUrl:a.infoUrl||""},a)},getLocation:function(a){a=a||{},c(o.getLocation,{type:a.type||"wgs84"},function(){return a._complete=function(a){delete a.type},a}())},hideOptionMenu:function(a){c("hideOptionMenu",{},a)},showOptionMenu:function(a){c("showOptionMenu",{},a)},closeWindow:function(a){a=a||{},c("closeWindow",{immediate_close:a.immediateClose||0},a)},hideMenuItems:function(a){c("hideMenuItems",{menuList:a.menuList},a)},showMenuItems:function(a){c("showMenuItems",{menuList:a.menuList},a)},hideAllNonBaseMenuItem:function(a){c("hideAllNonBaseMenuItem",{},a)},showAllNonBaseMenuItem:function(a){c("showAllNonBaseMenuItem",{},a)},scanQRCode:function(a){a=a||{},c("scanQRCode",{needResult:a.needResult||0,scanType:a.scanType||["qrCode","barCode"]},function(){return a._complete=function(a){var b,c;v&&(b=a.resultStr,b&&(c=JSON.parse(b),a.resultStr=c&&c.scan_code&&c.scan_code.scan_result))},a}())},openProductSpecificView:function(a){c(o.openProductSpecificView,{pid:a.productId,view_type:a.viewType||0},a)},addCard:function(a){var e,f,g,h,b=a.cardList,d=[];for(e=0,f=b.length;f>e;++e)g=b[e],h={card_id:g.cardId,card_ext:g.cardExt},d.push(h);c(o.addCard,{card_list:d},function(){return a._complete=function(a){var c,d,e,b=a.card_list;if(b){for(b=JSON.parse(b),c=0,d=b.length;d>c;++c)e=b[c],e.cardId=e.card_id,e.cardExt=e.card_ext,e.isSuccess=e.is_succ?!0:!1,delete e.card_id,delete e.card_ext,delete e.is_succ;a.cardList=b,delete a.card_list}},a}())},chooseCard:function(a){c("chooseCard",{app_id:z.appId,location_id:a.shopId||"",sign_type:a.signType||"SHA1",card_id:a.cardId||"",card_type:a.cardType||"",card_sign:a.cardSign,time_stamp:a.timestamp+"",nonce_str:a.nonceStr},function(){return a._complete=function(a){a.cardList=a.choose_card_info,delete a.choose_card_info},a}())},openCard:function(a){var e,f,g,h,b=a.cardList,d=[];for(e=0,f=b.length;f>e;++e)g=b[e],h={card_id:g.cardId,code:g.code},d.push(h);c(o.openCard,{card_list:d},a)},chooseWXPay:function(a){c(o.chooseWXPay,f(a),a)}},b&&(a.wx=a.jWeixin=C),C});