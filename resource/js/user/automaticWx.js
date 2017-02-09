automaticWxJs = {
	init:function(){
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger"){
			automaticWxJs.signInWx();
		}
	},initPage:function(){
		var params = mainJs.parseUrlSearch();
		this.fetchData(params);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = automaticWxJs;
		$p.undelegate();
		if(isBind){
			setTimeout(function(){
			}, 500);
		}
	},signInWx:function(){
		var params = mainJs.parseUrlSearch();
		var next = {url:'./'+params.autoHtml+'.html?'+params.state, id:params.autoId};
		var startPage = {url:'./', id:'startPage'};
		var last = {url:'./', id:'startPage'};
		
		var t = dmJs.sStore;
		var r = mainJs.getApiUrl("/urming_quan/user/loginByWechatCode");
		var e= {};
        e.systemType = "Pkuie";
        e.wechatCode = params.code;

        $.post(r, e, 
        function(e) {
			var n = "";
            var r = $.parseJSON(e);
            if (null != r.error) {
				viewJs.navigator.next({
					next:next,
					last:last
				});
				return;
			}
			
			if(typeof r.tempToken != "undefined"){
				viewJs.navigator.next({
					next:next,
					last:last
				});
				return;
				
			}else{
				t.saveLoginInfo(r),
				viewJs.afterToggleLogin();
				viewJs.navigator.next({
					next:next,
					last:last
				});
				return;
			}
        }).error(function() {
            viewJs.showPopMsg("网络错误")
        })
	}
};