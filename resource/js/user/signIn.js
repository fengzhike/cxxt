signInJs = {
	init:function(){
		this.toggleEvents(true);
		//hw
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger"){
			$("#signInBtnWx").show();
			$("#otherMembers").show();
		}else{
			$("#signInBtnWx").hide();
			$("#otherMembers").hide();
		}
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
			$("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
				'<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
		}
		$("#learningCardReceive").parent().parent().css("font-size",'16px');//兼容
		$("#signIn").parent().css("font-size",'16px');//兼容
		//hw
	},initPage:function(){
		var params = mainJs.parseUrlSearch();
		this.fetchData(params);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = signInJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('#signInBtn', 'vclick', me.submit);
				$p.delegate('#signInBtnWx', 'vclick', me.signInWx);
				$p.delegate('#password', 'keypress',me.onkeypress);
				$p.delegate('.toResetPwd', 'vclick', me.toResetPwd);
				$p.delegate('#registerBtn', 'vclick', me.toRegister);
                //$p.delegate('#loginName', 'input', viewJs.validInput);
			}, 500);
		}
	},submit:function(){
		if(typeof WeixinJSBridge != "undefined"){
			$("#systemType").val("Pkuie");
			$("#code").val(getQueryString("code"));
		}
       // console.log($('#loginFrom').serialize())
		dmJs.sStore.login(mainJs.parseUrlSearch($('#loginFrom').serialize()),function(){
            viewJs.navigator.pre();
        });
	},signInWx:function(){
		//hw
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger"){//weixin
			var t = dmJs.sStore;
			var r = mainJs.getApiUrl("/urming_quan/user/loginByWechatCode");
			var e= {};
            e.systemType = "Pkuie";
            e.wechatCode = getQueryString("code");
            $.post(r, e, 
            function(e) {
                var r = $.parseJSON(e);
                if (null != r.error) return void viewJs.showApiError(r);
				if(typeof r.tempToken != "undefined"){
					dmJs.sStore.save("tempToken",r.tempToken);
					dmJs.sStore.save("nickname",r.nickname);
					viewJs.navigator.next({
						next:{url:'./loginWx.html', id:'loginWx'}
					});
				}else{
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
				}
            }).error(function() {
                viewJs.showPopMsg("网络错误")
            })
		}else{
			alert("请在微信环境中打开!");
		}
		//hw
	},onkeypress:function(e){
		if(e.which == "13")
		 {	
			var me = signInJs;
			me.submit();
		 }
	},toResetPwd:function(){
		viewJs.navigator.next({
			next:{url:'./resetPwd.html', id:'resetPwd'}
		});
	},toRegister:function(){
		viewJs.navigator.next({
			next:{url:'./selectRegister.html', id:'selectRegister'}
		});
	}
};

	function getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]);
        return null;
    }