loginWxJs = {
	init:function(){
		this.toggleEvents(true);
		$("#nickname").append(dmJs.sStore.get("nickname"));
		$("#learningCardReceive").parent().parent().css("font-size",'16px');//兼容
		$("#loginWx").parent().parent().css("font-size",'16px');//兼容
	},initPage:function(){
		var params = mainJs.parseUrlSearch();
		//this.fetchData(params);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = loginWxJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('#bind', 'vclick', me.bindWx);
				$p.delegate('#registerByWx', 'vclick', me.registerByWx);
				//$p.delegate('#bindAndLoginByWx', 'vclick', me.submit);
				//$p.delegate('.vbt.sendCode:not(.busy)', 'vclick', me.getVerifyCode);
			}, 500);
		}
	},registerByWx:function(){
		//hw
		if(typeof WeixinJSBridge != "undefined"){//weixin
			var t = dmJs.sStore;
			var r = mainJs.getApiUrl("/urming_quan/user/registerByWechatTempToken");
			var e= {};
            e.systemType = "Pkuie";
            e.tempToken = dmJs.sStore.get("tempToken");
			e.sourceTag = dmJs.sStore.get("sourceTag");
			e.acTag = dmJs.sStore.get("acTag");
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
	},bindAndLoginByWx:function(f){
		//hw
		if(typeof WeixinJSBridge != "undefined"){//weixin
			var t = dmJs.sStore;
			var r = mainJs.getApiUrl("/urming_quan/user/bindMobileAndLoginByWechatTempToken");
			var e= f;
			//e.loginName = $("#loginNameWx").val();
			//e.password = mainJs.md5($("#passwordWx").val());
			e.systemType = "Pkuie";
			e.tempToken = dmJs.sStore.get("tempToken");
			$.post(r, e,
				function(e) {
					var r = $.parseJSON(e);
					if (null != r.error) return void viewJs.showApiError(r);
					if(typeof r.tempPwdToken != "undefined"){
						dmJs.sStore.save("tempPwdToken",r.tempPwdToken);
						loginWxJs.bindPassword();
					}else{
						t.saveLoginInfo(r),viewJs.afterToggleLogin();
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
	},getVerifyCode:function(){
		var $p = $.mobile.activePage;
		var mobile = $p.find('#loginNameWx').val();
		mobile = $.trim(mobile);
		if(mobile == ''){
			return;
		}
		//viewJs.getVerifyCode();
		$.get(mainJs.getApiUrl('/urming_quan/user/getVerifyCode'), {mobile:mobile,random:Math.random()}, function(data){
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
		var me = loginWxJs;
		var f = me.validateBindMobileForm();
		if(f != null){
			me.bindAndLoginByWx(f);
		}
	},validateBindMobileForm:function(){
		var $f = $('#loginWx #loginFrom');
		var $p = $.mobile.activePage;
		var maxLength = 20;
		var msg;
		var params = mainJs.parseUrlSearch();

		var verifyCode = $.trim($f.find('.verifyCode input').val());
		var tempAccessToken = $.trim(dmJs.sStore.get('tempAccessToken'));
		var accessTokenMobile = dmJs.sStore.get('tempAccessToken_mobile');
		var inputPhone = $.trim($f.find('#loginNameWx').val());

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
		var f = {verifyCode:verifyCode,tempAccessToken:tempAccessToken,mobile:inputPhone};
		return f;
	},bindWx:function(){
		viewJs.navigator.next({
			next:{url:'./bindWx.html', id:'bindWx'},lastAuto:true
		});
	},bindPassword:function(){
		viewJs.navigator.next({
			next:{url:'./bindPassword.html', id:'bindPassword'},lastAuto:true
		});
	}
};