bindPasswordJs = {
	init:function(){
		this.toggleEvents(true);
	},initPage:function(){
		var params = mainJs.parseUrlSearch();
		//this.fetchData(params);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = bindPasswordJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('#bindAndLoginByWx', 'vclick', me.bindAndLoginByWx);
			}, 500);
		}
	},bindAndLoginByWx:function(){
		//hw
		if(typeof WeixinJSBridge != "undefined"){//weixin
			var t = dmJs.sStore;
			var r = mainJs.getApiUrl("/urming_quan/user/registerByTempToken");
			var e= {};
			e.password = mainJs.md5($("#passwordWx").val());
            e.systemType = "Pkuie";
            e.tempPwdToken = dmJs.sStore.get("tempPwdToken");
            $.post(r, e, 
            function(e) {
                var r = $.parseJSON(e);
                if (null != r.error) return void viewJs.showApiError(r);
                t.saveLoginInfo(r),
                viewJs.afterToggleLogin();
                var n = t.getSuccessTo("successTo");
                return null == n ? void viewJs.navigator.next({
                    next: {
                        url: "./",
                        id: "startPage"
                    }
                }) : (t.clearSuccessTo(), null == n.url && null == n.href ? void viewJs.navigator.next({
                    next: {
                        url: "./",
                        id: "startPage"
                    }
                }) : void viewJs.navigator.next({
                    next: {
                        url: n.url || n.href,
                        id: n.id,
                        options: n.options
                    },
                    last: n.last
                }))
            }).error(function() {
                viewJs.showPopMsg("网络错误")
            })
		}else{
			alert("请在微信环境中打开!");
		}
		//hw
	}
};