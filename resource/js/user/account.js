accountJs = {
	init:function(){
		var $p = $.mobile.activePage;
		var user = dmJs.sStore.getUserInfo();
		if(user){
			if(user.user.type == "1" || user.user.type == "3"){
				$p.attr('to-verify-type', 'person');
				$p.find(".toChangeContactInfo").remove();
			} else {
				$p.attr('to-verify-type', 'enterprise');
				$p.find(".toBindMobile").remove();
			}
		} else{
            viewJs.navigator.next({id:'startpage',url:'./'});
        }
		$("#mobile").html(user.user.mobile);
		this.toggleEvents(true);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = accountJs;
		$p.undelegate('.sec>.vbt.vr[child]');
		if(isBind){
			$p.one('pagebeforehide', function(){
				me.toggleEvents();
			});
			setTimeout(function(){
				$p.delegate('.sec>.vbt.vr[child]', 'vclick', me.toChildPage).delegate('.ui-content .logoutBtn', 'vclick', viewJs.toConfirmLogout)
			}, 500);
		}
	},toChildPage:function(){
		var $el = $(this);
		var me = accountJs;
		var child = $el.attr('child');
		var user = dmJs.sStore.getUserInfo();
		var next,invalid;
		switch(child){
			case 'validateBankCard':
				if(user != null){
                    if(user.user.isMoneyGuaranteed == '1'){
                        invalid = '您已通过银行卡认证';
                    } else if(user.user.isMoneyGuaranteed == '4'){
                        viewJs.dialogPop('您的银行卡认证已失败，如需要再次认证，请联系创新学堂客服：<br/><span class="font-blue">010-59433195</span>', null, '提示', {onlyBtnOk:true});
                        return;
                    }else if(typeof(user.user.mobile) == 'undefined' || user.user.mobile == ''){
						viewJs.dialogPop('绑定手机号才能认证银行卡！', function(res){
							if(res){
								viewJs.navigator.next({next:{url:'./bindMobile.html', id:'bindMobile'},lastAuto:true});
							}
						});
						return;
					}
				}
                if(!invalid){
                    next = {url:'./validateBankCard.html', id:'validateBankCard'};
                }
				break;
			case 'verifyUser':
				//if(user != null && (invalid = viewJs.isLockVerifyIdentity(user.user.isIdcardValidated))){
				//	break;
				//}
				if(user.user.isIdcardValidated==2 || user.user.isTeacherValidated==2){
					invalid = "认证正在审核中";
					break;
				}
				if((user.user.type==1 && user.user.isTeacherValidated==1) || (user.user.type>1 && user.user.isIdcardValidated==1)){
					invalid = "您已通过认证";
					break;
				}
				next = {url:'./selectVeifyType.html', id:'selectVeifyType'};
//                next = {url:'./verifyUser.html', id:'verifyUser',options:{data:{userType:user.user.type}}};
				break;
			case 'updateInfo':
				next = {url:'./updateInfo.html', id:'updateInfo'};
				break;
			case 'changePwd':
				next = {url:'./changePwd.html', id:'changePwd'};
				break;
			case 'bindMobile':
				if(user != null){
                    if(typeof(user.user.mobile) != 'undefined' && user.user.mobile != ""){
						invalid = '您已绑定手机号';
                    }
				}
				next = {url:'./bindMobile.html', id:'bindMobile'};
				break;
			case 'recharge':
				next = {url:'./recharge.html', id:'recharge'};
				break;
			case 'changeContactInfo':
				next = {url:'./changeContactInfo.html', id:'changeContactInfo'};
				break;
			case 'rechargeCourse':
				next = {url:'./rechargeCourse.html', id:'rechargeCourse'};
				break;
			case 'withdraw':
				if(user.user.balance == 0){
					invalid = '余额不足';
				} else if(user.user.isIdcardValidated == 0){
					viewJs.dialogPop('为了保证您的账户安全，请先完成身份认证后再进行提现！', function(res){
						if(res){
							viewJs.navigator.next({next:{url:'./selectVeifyType.html', id:'selectVeifyType'},lastAuto:true});
						}
					},null,{okText:'去认证'});
					return;
				} else if(user.user.isIdcardValidated == 2){
					invalid = '身份认证正在审核中';
				} else if (user.user.isIdcardValidated == 3){
					viewJs.dialogPop('身份认证失败，请重新认证！', function(res){
						if(res){
							viewJs.navigator.next({next:{url:'./selectVeifyType.html', id:'selectVeifyType'},lastAuto:true});
						}
					},null,{okText:'去认证'});
					return;
				}
				next = {url:'./withdraw.html', id:'withdraw'};
				break;
				/*
				if(user != null && user.user.isMoneyGuaranteed != '1'){
					invalid = '只能绑定银行卡，才能提现';
					break;
				}
				next = {url:'./withdraw.html', id:'withdraw'};
				break;
				*/
			case 'accountDetails':
				next = {url:'./accountDetails.html', id:'accountDetails'};
				break;
		}
		if(user == null){
			dmJs.sStore.reLogin(next);
		} else if(invalid != null){
			viewJs.showPopMsg(invalid);
			return;
		}
		viewJs.navigator.next({next:next,lastAuto:true});
	}
};