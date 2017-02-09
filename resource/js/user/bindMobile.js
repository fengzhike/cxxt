bindMobileJs = {
	init:function(){
		this.toggleEvents(true);
        this.initPage();
	},initPage:function(){
		var $p = $.mobile.activePage;
		var user;
        if(!(user = viewJs.chkLogin())){
            return;
        }
		dmJs._ajax({
			id:'getTempCode',
			url:'/urming_quan/system/getTempCode',
			callback:function(data){
				$p.find(".securityCode > img").data("tempCode",data.data.code);
				bindMobileJs.createSecurityCode();
			}
		})
    },toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = bindMobileJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.vbt.submit', 'vclick', me.submit);
				$p.delegate('.vbt.sendCode.enable:not(.busy)', 'vclick', me.getVerifyCode);
				$p.delegate('.securityCode > img', 'vclick', me.createSecurityCode);
                $p.delegate('[data-format]', 'input', viewJs.validInput);
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
		/*
		dmJs._ajax({id:'validateMobile',method:'POST',params:{mobile:mobile},url:'/urming_quan/user/validateMobile',
			callback:function(data){
				if(data.exsit){
					viewJs.dialogPop('手机号已注册', function(){
						
					}, '错误', {onlyBtnOk:true});
					return;
				}
				viewJs.getVerifyCode();
		}});
		*/
		viewJs.getVerifyCode();
	},submit:function(){
		var me = bindMobileJs;
		var f = me.validateBindMobileForm();
		if(f != null){
            me._submit(f);
		}
	},_submit:function(f){
		dmJs._ajax({id:'bindMobile',method:'POST',params:f,url:'/urming_quan/user/bindMoible',callback:function(e){
            var r = e;//$.parseJSON(e)
            if (null != r.error) return void viewJs.showApiError(r);
			var user = dmJs.sStore.getUserInfo();
			user.user.mobile = $.trim($('#bindMobile .vForm').find('.vTr.phone input').val());
			user.saveSelf();
            viewJs.navigator.pre();
		}});
	},validateBindMobileForm:function(){
		var $f = $('#bindMobile .vForm');
        var $p = $.mobile.activePage;
		var maxLength = 20;
		var msg;
        var params = mainJs.parseUrlSearch();
		
		var verifyCode = $.trim($f.find('.vTr.verifyCode input').val());
		var tempAccessToken = $.trim(dmJs.sStore.get('tempAccessToken'));
		var accessToken = dmJs.sStore.getUserInfo().accessToken;
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
		var f = {accessToken:accessToken,verifyCode:verifyCode,tempAccessToken:tempAccessToken};
		return f;
	},createSecurityCode:function(){
		var $p = $.mobile.activePage;
		var tempCode = $p.find(".securityCode > img").data("tempCode");
		$p.find(".securityCode > img").attr("src",mainJs.getApiUrl("/urming_quan/system/getImgVerifyCode")+"?code="+tempCode+"&width=78&height=30&random="+Math.random());
	}
};