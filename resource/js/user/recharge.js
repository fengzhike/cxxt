rechargeJs = {
	vars:{maxRecharge:10000,minRecharge:1},
	init:function(){
		/*
		if(!this.preInit()){
			return;
		}
		*/
		var user;
		if(!(user = viewJs.chkLogin())){
			return;
		}
		var $p = $.mobile.activePage;
		this.toggleEvents(true);
		var initParam = mainJs.parseUrlSearch();
		if(typeof (initParam.cardId) != 'undefined' && typeof (initParam.secretKey) != 'undefined'){
			$(".vTr").hide();
			$(".rechargeBtn").hide();
			$("input[name='cardId']").each(function (i,n){
				$(this).attr('value',initParam.cardId);
			});
			$("input[name='secretKey']").each(function (i,n){
				$(this).attr('value',initParam.secretKey);
			});
			setTimeout(function(){
				rechargeJs.toRecharge();
			}, 500);
		}
	},preInit:function(){
		var user = dmJs.sStore.getUserInfo();
		if(user == null){
			viewJs.dialogPop('请先登录！', function(){
				viewJs.navigator.pre();
			}, '错误', {onlyBtnOk:true});
			return user;
		}
		return true;
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		$p.find('.rechargeBtn').unbind('click');
		//$p.find('input.rechargeMoney').unbind('input');
		var me = rechargeJs;
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			//$p.delegate('input.rechargeMoney', 'input',me.validateMoney);
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.rechargeBtn', 'vclick',me.toRecharge);
			}, 500);
		}
	},validateMoney:function(){
		var $el = $(this);
		var vars = rechargeJs.vars;
		var maxRecharge = vars.maxRecharge;
		var minRecharge = vars.minRecharge;
		var val = $.trim($el.val()).replace(/\D/g, '').replace(/^[0]{2,}/, '0');
		if(val == ''){
			$el.siblings('.elTip').remove();
			$el.val('');
		} else{
			val = Number(val);
			if(val > maxRecharge){
				$el.val(Number(maxRecharge));
				viewJs.showPopTip({el:$el,msg:'最高可充值'+ maxRecharge+'元'});
			} else if(val < minRecharge){
				$el.val(Number(minRecharge));
				viewJs.showPopTip({el:$el,msg:'最少可充值'+minRecharge+'元'});
			}else {
				$el.siblings('.elTip').remove();
				$el.val(val);
			}
		}
	},toRecharge:function(){
		var me = rechargeJs;
		var $p = $.mobile.activePage;
		//var $selEl = $p.find('.payment-method .vRadioGrp .payType.vRadio.selected');
		var user = dmJs.sStore.getUserInfo();
		var form = {accessToken:user.accessToken};
		$('#recharge-form input').each(function(index, item){
			form[item.name] = $.trim(item.value);
		});
		if(form.cardId == '' || form.cardId == null){
			viewJs.showPopMsg('充值卡号不能为空');
			return;
		}
		if(form.secretKey == '' || form.secretKey == null){
			viewJs.showPopMsg('充值密码不能为空');
			return;
		}
		var initParam = mainJs.parseUrlSearch();
		if(typeof (initParam.cardId) != 'undefined' && typeof (initParam.secretKey) != 'undefined'){
			$.get(mainJs.getApiUrl('/urming_quan/user/rechargeByCard'), form, function(data){
				var r = $.parseJSON(data);
				if (null != r.error){
					var msgs = dmJs.i18n.getMsgs('msg_api');
					var msg;
					if(msgs == null){
						msg =  r.error;
					} else {
						msg = msgs[r.error_code] || r.error;
					}
					viewJs.dialogPop(msg,function(ret){
						if(ret){
							me.toLoginUserPage();
						}
					},'充值失败',{
						onlyBtnOk:true
					})
					return;
				}else{
					viewJs.dialogPop('您已充值成功，去查看！',function(ret){
						if(ret){
							me.toLoginUserPage();
						}
					},'提示',{
						onlyBtnOk:true
					})
				}
			}).error(function(){
				viewJs.showPopMsg('网络错误');
			});
		}else{
			dmJs._ajax({
				method:'POST',
				maskText:'充值中..',
				id:'recharge',
				params:form,
				url:'/urming_quan/user/rechargeByCard',
				callback:function(ret){
					viewJs.dialogPop('您已充值成功，去查看！',function(ret){
						if(ret){
							me.toLoginUserPage();
						}
					},'提示',{
						onlyBtnOk:true
					})
				}
			});
		}
	},toLoginUserPage:function(){
		viewJs.navigator.next({
			next:{url:'./mine.html',id:'mine'}
		});
	}
};