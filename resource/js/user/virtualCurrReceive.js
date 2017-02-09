virtualCurrReceiveJs = {
	init:function(){
		this.toggleEvents(true);
		this.initPage();
	},initPage:function(){
		$(".ui-footer").remove();
		virtualCurrReceiveJs.submit();
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = virtualCurrReceiveJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
			}, 500);
		}
	},submit:function(){
		$('.spinner').show();
		$('#maskLoadingMore').show();
		var params = mainJs.parseUrlSearch();
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger"){//weixin
			var t = dmJs.sStore;
			var r = mainJs.getApiUrl("/urming_quan/user/loginByWechatCode");
			var e= {};
			e.systemType = "Pkuie";
			e.wechatCode = params.code;
			var next = {url:'./virtualCurrReceiveSucc.html', id:'virtualCurrReceiveSucc', options:{data:params}};
			$.post(r, e,
				function(e) {
					var r = $.parseJSON(e);
					if (null != r.error) return void viewJs.showApiError(r);
					if(typeof r.tempToken != "undefined"){
						dmJs.sStore.save("tempToken",r.tempToken);
						dmJs.sStore.save("nickname",r.nickname);
						t.saveSuccessTo(next);
						viewJs.navigator.next({
							next:{url:'./loginWx.html', id:'loginWx'}
						});
					}else{
						t.saveLoginInfo(r);
						viewJs.afterToggleLogin();
						viewJs.navigator.next({
							next: next
						})
					}
				}).error(function() {
					viewJs.showPopMsg("网络错误")
				})
		}else{
			alert("请在微信环境中打开!");
		}
	}
};
