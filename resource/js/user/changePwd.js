changePwdJs = {
	init:function(){
		this.toggleEvents(true);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = changePwdJs;
		$p.undelegate().unbind('pagebeforehide');
		if(isBind){
			$p.on('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
                $p.delegate('[data-format]', 'input', viewJs.validInput);
				$p.delegate('#changePwdBtn', 'vclick', me.changePwd);
			}, 500);
		}
	},changePwd:function(){
		var $p = $('#changePwd');
		var me = changePwdJs;
		var oldPassword = $.trim($p.find('.oldPassword').val());
		var newPassword = $.trim($p.find('.newPassword').val());
        var repeatPwd = $.trim($p.find('.repeatPassword').val());
		var user = dmJs.sStore.getUserInfo();
		var accessToken = $.trim(user == null ? '' : user.accessToken);
		var msg = viewJs.validate({name:'原密码', val:oldPassword, must:true, minLength:6, maxLength:20});
		if(!msg){
			msg = viewJs.validate({name:'新密码', val:newPassword, must:true, minLength:6, maxLength:20});
		}
		if(!msg){
			msg = viewJs.validate({name:'确认密码', val:repeatPwd, must:true});
		}
		if(!msg){
			if(newPassword == oldPassword){
				msg = '新密码不可与原密码一致';
			}
		}
        if(!msg){
            if(newPassword != repeatPwd){
                msg = '新密码和确认密码不匹配';
            }
        }
        if(!msg){
            if(newPassword.search(/[^\da-zA-Z]/) > -1){
                msg = '新密码格式不正确';
            }
        }
		if(msg){
			viewJs.showPopMsg(msg);
			return;
		}
		var  params = {oldPassword:mainJs.md5(oldPassword), newPassword:newPassword, accessToken:accessToken};
		dmJs._ajax({id:'changePwd', url:'/urming_quan/user/changePassword',params:params,
			preError:function(res){
				if(res.error_code == '20118'){
					return {error:'原密码输入错误'};
				}
			},
			accessInvalid:function(){
				dmJs.sStore.toLogin({url:'./mine.html'});
			},callback:function(ret){
				var user = dmJs.sStore.getUserInfo();
				user.accessToken = ret.accessToken;
				user.saveSelf();
                viewJs.showPopMsg('密码修改成功');
				viewJs.navigator.next({next:{url:'./account.html', id:'account'}});
			}
		});
	}
};