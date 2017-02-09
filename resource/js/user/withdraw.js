var withdrawJs = {
	vars:{
		// banks:['中国建设银行','中国工商银行','中国农业银行','招商银行','中国银行','交通银行','国家邮政局邮政储汇局','中国光大银行','平安银行','中信银行','中国民生银行','广发银行','华夏银行','兴业银行','上海农村商业银行','城市信用合作社','农村信用合作社','上海浦东发展银行','农村合作银行','浙商银行','农村商业银行','重庆三峡银行']
		banks:['中国工商银行','中国建设银行','中国农业银行','招商银行','中国银行','交通银行','中国邮政储蓄银行','中国光大银行','中信银行','中国民生银行','广发银行','兴业银行','平安银行','上海浦东发展银行'],

		subBranchExcept:'中国工商银行'
	},init:function(){
		var user;
		if(!(user = this.chkLogin())){
			return;
		}
		this.initPage(user);
		this.comparisonUser(user);
		this.toggleEvents(true);
	},chkLogin:function(){
		var user = dmJs.sStore.getUserInfo();
		if(user != null){
			return user.user;
		} else {
			dmJs.sStore.reLogin({url:'./account.html'});
		}
	},initPage:function(user){
        var me = withdrawJs;
        var $p = $.mobile.activePage;
		if(user.isWithdrawing == 1){
			me.withdrawResult(user.withdrawCardNo,user.withdrawMoney);
		}else{
			$p.find('.fieldContainer>.ui-input-text:has([readonly])').addClass('icon-right-arrow');
            if(user.isGroup != 1){
                $p.find('input.realname').attr('readonly', '').val(user.realname);
            }
			$.get(mainJs.getApiUrl('/urming_quan/user/getLimitWithdraw'), {accessToken:dmJs.getAccessToken()}, function(data){
				var r = $.parseJSON(data);
				$p.find('input.money').attr("placeholder","可提现金额"+Number(r.withdraw)+'元');
				$p.find('input.money').data('money',Number(r.withdraw));
				if(r.withdraw < user.balance){
					$(".remind-btn").show();
				}
				/*
				 $p.find('.inputCtr.withdraw-money input').data('withdraw',Number(r.withdraw));
				 */
			}).error(function(){
				viewJs.showPopMsg('网络错误');
			});
		}
	},
	toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = withdrawJs;
		$('#selectBankDlg').undelegate();
		$('#toSelectBankCityDlg').undelegate();
		$('#subBranchDlg').undelegate();
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
				$('#toSelectBankCityDlg,#selectBankDlg,#subBranchDlg,#submit_money_page,#withdraw_result_page').remove();
			});
			setTimeout(function(){
				me.toggleEvents();
				$('#selectBankDlg').delegate('.bankItem', 
					'vclick', me.selectBank).delegate('.vBack', 
					'vclick', me.cancelSelectBank);
				$p.delegate('.toSelectBank','vclick',me.toSelectBank);
				$p.delegate('.ui-content .vbt.submit','vclick',me.submit);
				$p.delegate('.bankCity','vclick',me.toSelectCity);
				$p.delegate('.subBranch','vclick',me.toSelectSubBranch);
                $p.delegate('[data-format]', 'input', viewJs.validInput);
				$p.delegate('.money', 'input',me.validateMoney);
				$p.delegate('.remind-btn','vclick',me.remindToggle);
				$("body").on("tap",me.remindHide);
                $('#submit_money_page').delegate('[data-format]', 'input', viewJs.validInput);
                $('#submit_money_page').delegate('[action]', 'vclick', me.doSubmitMoneyAction);
                //$('#withdraw_result_page').delegate('[action]', 'vclick', me.doSubmitMoneyAction);
                $('#withdraw_result_page').delegate('.back', 'vclick', me.back);
				$('#toSelectBankCityDlg').delegate('.hotList>li>a,.allList>li>a,.ui-btn.vBack', 'tap', me.selectCity);
				$('#toSelectBankCityDlg').delegate('.letter-list a', 'vclick', function(){
					var $el =  $(this);
					var $target = $('#'+$.trim($el.text()))
					var offset = $target.offset();
					$(window).scrollTop(offset.top);
					me.toggleEvents(true);
				});
				$('#subBranchDlg').delegate('.ui-btn.vBack,.branch','vclick',
					me.selSubBranch).delegate('.filterInput','input',
					me.toFilterSubBranch).delegate('.filterInput','change',me.toFilterSubBranch);
			},  500);

		}
	},toSelectSubBranch:function(){
		var me = withdrawJs;
		var $p = $.mobile.activePage;
		viewJs.top();
		$(':focus').blur();
		var bank = $.trim($p.find('.toSelectBank').val());
		var bankCity = $.trim($p.find('.bankCity').val());
		var msg;
		if(bank == ''){
			msg = "请选择开户银行";
		}
		if(!msg){
			if(bankCity == ''){
				msg = "请选择开户城市";
			}
		}
		if(msg){
			viewJs.showPopMsg(msg);
			return;
		}
		$('#subBranchDlg').remove();
		dmJs._ajax({
			id:'getSubBranch',
			method:'POST',
			url:'/urming_quan/system/getSubBranch',
			params:{areaName:bankCity, bank:bank},
			callback:me.parseSubBranch
		});
	},parseSubBranch:function(data){
		var me = withdrawJs;
		var $p = $.mobile.activePage;
		var subBranch = data.subBranch;
		var l = subBranch.length,i=0,items=[];
		if(l == 0){
			viewJs.showPopMsg('所选银行在所选城市不存在支行');
			return;
		}
		$('#subBranchDlg').remove();
		for(;i < l;i++){
			items.push(['<a class="vbt vr branch">',subBranch[i],'</a>'].join(''));
		}
		items = items.join('');
		var $dlg = $([
		'<div id="subBranchDlg" class="ui-page fullScreen vChild">',
		'<div data-role="header">',
		'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
		'<h1>所在支行</h1>',
		'</div>',
		'<div class="content">',
			'<div class="filterInputCtr"><input class="filterInput" total="',l,'"counter="#filterCount-money" type="search" list="#subBranchList" placeholder="输入所在支行"></input></div>',
			'<div id="subBranchList">',
				items,
			'</div>',
		'</div>',
		'</div>'].join('')).enhanceWithin();
		$dlg.find('.filterInput').data('cacheHtml', items);
		me.toggleEvents(true);
		$p.hide();
		$(document.body).append($dlg);
	},toFilterSubBranch:function(){
		var $el = $(this);
		var cacheHtml = $el.data('cacheHtml');
		var $list = $($el.attr('list'));
		var $counter = $($el.attr('counter'));
		var val = $.trim($el.val()).replace(/[<>]/g, '');
		if(val != ''){
			var reg = new RegExp('>[^<>]*'+val+'[^<>]*<','ig')
			var reg2 = new RegExp(val, 'ig');
			var count = 0;
			cacheHtml = cacheHtml.replace(reg, function(w){
				count++;
				return w.replace(reg2, function(w2){
					return '<span style="color:red;">'+w2+'</span>';
				});
			}).replace(/<a[^<>]*>[^<>]*<\/a>/gi, '');
			$counter.html(count);
		} else {
			$counter.html($el.attr('total'));
		}
		$list.html(cacheHtml);
	},selSubBranch:function(){
		var me = withdrawJs;
		var $p = $.mobile.activePage;
		var $el = $(this);
		viewJs.top();
		$(':focus').blur();
		if(!$el.is('.branch')){
		} else {
			$p.find('input.subBranch').val($.trim($el.text()));
		}
		me.toggleEvents(true);
		$('#subBranchDlg').remove();
		$p.show();
	},selectBank:function(){
		var me = withdrawJs;
		var $dlg =$('#selectBankDlg');
		var $p = $.mobile.activePage;
		var bank = $.trim($(this).html());
		$p.find('.toSelectBank').val(bank);
		me.toggleEvents(true);
		$dlg.hide();
		viewJs.top();
		$(':focus').blur();
		var noSubBranch = $p.find('.ui-input-text:has(.bankCity),.ui-input-text:has(.subBranch)');
		if(me.vars.subBranchExcept.search(bank)>-1){
			noSubBranch.hide(300);
		} else{
			noSubBranch.show(300);
		}
		
	},
	cancelSelectBank:function(){
		var me = withdrawJs;
		me.toggleEvents();
		var $dlg =$('#selectBankDlg');
		me.toggleEvents(true);
		$dlg.hide();
	},
	back:function(){
		viewJs.navigator.next({next:{
				url:'./account.html'
			},lastAuto:false});
		/*
		dmJs.sStore.syncBalance(function(){
			withdrawJs.toLoginUserPage();
		});
		 */
	},submit:function(){
		var me = withdrawJs;
		var f = me.validate();
        var user = dmJs.sStore.getUserInfo();
        if(f != null){
            viewJs.dialogPop(me.getConfirmMsg(f),function(bOk){
                if(bOk){
                    me.form = f;
                    dmJs._ajax({
                        method:'POST',
                        id:'widthDraw',
                        params:f,
                        url:'/urming_quan/user/withdraw',
                        callback:function(res){
                            //me.afterValid(res, f);
                            //me.submitMoney(f);
                            me.success(f);
                        }
                    });
                }
            },'确认银行卡',{
                okText:'确定',cls:'dlg-top-1'
            });
        }
	},getConfirmMsg:function(f){
        var $p = $.mobile.activePage;
        var tpl = $p.find('#confirm_card').html();
        return viewJs.applyTpl(tpl,f);
    },submitMoney:function(f){
        $('#submit_money_page').remove();
        var $p = $.mobile.activePage;
        var me = withdrawJs;
        var tpl = $p.find('#submit_money_tpl').html();
        var info = $.extend({},f);
        var isMoneyGuaranteed = dmJs.sStore.getUserInfo().isMoneyGuaranteed;
        if(!info.bankCity){
            info.cardCls = 'noSubBranch';
        } else {
            info.cardCls = '';
        }
        if(isMoneyGuaranteed == 3 || isMoneyGuaranteed == 5){
            info.firstCls = '';
            info.secondCls = '';
        } else {
            info.firstCls = '';
            info.secondCls = 'hidecls';
        }
        me.toggleEvents(true);
        $p.hide();
        $(document.body).append(viewJs.applyTpl(tpl,info));
        $('#submit_money_page').data('submitMoney', f);
    },validate:function(){
		var $p = $.mobile.activePage;
		var me = withdrawJs;
		var f = {isNew:1};
		var $f = $p.find('.vForm input').each(function(i, item){
			var $item = $(item);
			f[$item.attr('name')] = $.trim($item.val());
		});
		f.accessToken = dmJs.sStore.getUserInfo().accessToken;
		var msg;
		if(!msg){
			msg = viewJs.validate({name:'真实姓名', val:f.realname, must:true});
		}
		if(!msg){
			msg = viewJs.validate({name:'开户银行', val:f.bank, must:true});
		}
		if(!msg){
			msg = viewJs.validate({name:'银行卡号', val:f.creditCardNumber, must:true});
		}
        if(!msg){
           var cardValid =  validCardJs.valid(f.creditCardNumber);
           if(!cardValid){
               msg = '银行卡格式不正确';
           }
        }
		if(!msg){
			msg = viewJs.validate({name:'提现金额', val:f.money, must:true});
		}
		if(!msg && !(f.money>0)){
			msg = '提现金额必须大于0元';
		}
		if(me.vars.subBranchExcept.search(f.bank) < 0){
			if(!msg){
				msg = viewJs.validate({name:'开户城市', val:f.bankCity, must:true});
			}
			if(!msg){
				msg = viewJs.validate({name:'所在支行', val:f.subBranch, must:true});
			}
		} else {
            f.cls = "hidecls";
			delete f.bankCity;
			delete f.subBranch;
		}
		if(msg){
			viewJs.showPopMsg(msg);
			return;
		}
		return f;
	},selectCity:function(){
		var me = withdrawJs;
		var $dlg =$('#toSelectBankCityDlg');
		var $p = $.mobile.activePage;
		var bankCity = this.title;
		if( bankCity!= null){
			$p.find('.bankCity').val(this.title);
		}
		me.toggleEvents(true);
		$dlg.hide()
		viewJs.top();
		$(':focus').blur();
	},toSelectBank:function(){
		var me = withdrawJs;	
		me.toggleEvents();
		var $dlg =$('#selectBankDlg');
		if($dlg.length == 0){
			var banks = me.vars.banks, l = banks.length, i = 0;
			var banksHtml = [];
			for(; i < l; i++ ){
				banksHtml.push(['<a class="vbt vr icon-right bankItem">',banks[i],'</a>'].join(''));
			}
			var $dlg = $([
				'<div id="selectBankDlg" class="ui-page fullScreen vChild">',
				'<div data-role="header"  >',
				'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
				'<h1>选择银行</h1>',
				'</div>',
				'<div class="content">',
					banksHtml.join(''),
				'</div>',
				'</div>'].join('')).hide().enhanceWithin();
		}
		$($.mobile.activePage).append($dlg);
		$dlg.show();
		me.toggleEvents(true);
		//viewJs.withdraw();
		$(':focus').blur();
	},toSelectCity:function(){
		var $dlg = $('#toSelectBankCityDlg');
		var me = withdrawJs;
		me.toggleEvents(true);
		if($dlg.length == 0){
			me.initCityListPage();
		} else {
			$dlg.show();
		}
		viewJs.top();
		$(':focus').blur();
	},initCityListPage:function(){
		var me = withdrawJs;
		var $dlg = $('#toSelectBankCityDlg');
		if($dlg.length > 0){
			return;
		}
		$.get('resource/fragment/citylist.txt', function(data){
			var txt = data.replace('{0}', dmJs.params.geolocation.city);
			var $p = $.mobile.activePage;
			var $city = $(txt);
			$city.find('.position-city:first').remove();
			var $list = $([
				'<div id="toSelectBankCityDlg" class="changeCity ui-page fullScreen vChild">',
				'<div data-role="header"  >',
				'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
				'<h1>选择开户城市</h1>',
				'</div>',
				'<div class="content">',
					
				'</div>',
				'</div>'
				].join(''));

			$(document.body).append($list.enhanceWithin());
			$list.find('.content').append($city);
			me.toggleEvents(true);
		});
	},doSubmitMoneyAction:function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var me = withdrawJs;
        if(!me.chkLogin()){
            return;
        }
        var $el = $(this);
        var sAction = $el.attr('action');
        switch(sAction){
            case 'submitMoney':
                me.doSubmitMoney.apply($el);
                break;
            case 'reEdit':
                me.reEdit();
                break;
            case 'back':
                viewJs.navigator.pre();
                break;
        }
    },doSubmitMoney:function(){
        var me = withdrawJs;
        var $el = $(this);
        if($el.is('.notSubmit')){
            $el.removeClass('notSubmit').addClass('disabled');
            var val = $.trim($('#submit_money_val').val());
            var valOk = false;
            if($.isNumeric(val)){
                val = Number(val);
                if(val > 0 && val <= 1){
                    valOk = true;
                }
            }
            if(!valOk){
                viewJs.showPopMsg('打款金额大于0不大于1元');
                $el.addClass('notSubmit').removeClass('disabled');
                return;
            }
            var val = Math.ceil(val*100);
            dmJs._ajax({
                id:'userCardVerify',
                url:'/urming_quan/user/userCardVerify',
                method:'POST',
                params:{money:val,accessToken:dmJs.getAccessToken()},
                callback:function(res){
                    me.afterValid(res, $('#submit_money_page').data('submitMoney'));
                }
            });
        } else {
            return;
        }
    },reEdit:function(){
        viewJs.top();
        $(':focus').blur();
        $('#submit_money_page,#valid_result_page').remove();
        var $p = $.mobile.activePage;
        var me = withdrawJs;
        me.toggleEvents(true);
        $p.show();
    },afterValid:function(ret, f){
        viewJs.top();
        $(':focus').blur();
        $('#submit_money_page,#valid_result_page').remove();
        var me = withdrawJs;
        var $p = $.mobile.activePage;
        var isMoneyGuaranteed = ret.isMoneyGuaranteed;
        if(isMoneyGuaranteed == null || isMoneyGuaranteed == ''){
            viewJs.dialogPop('系统错误',null, '错误');
            return;
        }
        var user = dmJs.sStore.getUserInfo();
        user.user.isMoneyGuaranteed = isMoneyGuaranteed;
        if(isMoneyGuaranteed == 1 || isMoneyGuaranteed == 2 || isMoneyGuaranteed == 5){
            user.user.realname = f.realname;
            user.user.creditCardNumber = f.creditCardNumber;
            user.user.bank = f.bank;
            if(me.vars.subBranchExcept.search(f.bank) < 0){
                user.user.bankCity = f.bankCity;
                user.user.subBranch = f.subBranch;
            }
            user.saveSelf();
        } else {
            user.saveSelf();
        }
        var tpl = $p.find('#valid_result_tpl').html();
        var info = {};
        if(isMoneyGuaranteed == 3){
            info.symbolCls = "symbol-warn-cls";
            info.symbol = '!';
            info.msg = "抱歉，您的银行卡认证失败。您还有最后一次认证机会，请核实实际到账金额！";
            info.bShowCls = "";
        }  else if(isMoneyGuaranteed == 4){
            info.symbolCls = "symbol-warn-cls";
            info.symbol = '!';
            info.msg = "抱歉，您的银行卡认证失败。如需要再次认证，请联系创新学堂客服：<br/><span class='font-blue'>010-59433195</span>";
            info.bShowCls = "hidecls";
        } else if(isMoneyGuaranteed == 1){
            info.symbolCls = "symbol-info-cls";
            info.symbol = '√';
            info.msg = "恭喜您的银行卡认证已通过";
            info.bShowCls = "hidecls";
        }
        me.toggleEvents(true);
        $p.hide();
        $(document.body).append(viewJs.applyTpl(tpl, info));
    },validateMoney:function(){
		//debugger;
		var $el = $(this);
		var val = $.trim($el.val()).replace(/[^\d\.]/g, '');
		if(val == ''){
			$el.val('');
			return;
		}
		var vals = val.split('');
		var ret = [],commaCount= 0,bits=0;
		$.each(vals, function(i, item){
			var bComma = item=='.';
			if(bComma){
				commaCount++;
			}
			if(bComma && i==0){
				ret.push(0);
			}
			if(commaCount > 1 && bComma){
				return true;
			}
			if(bComma || (item > -1 && item < 10)){
				ret.push(item);

				console.log(bits);
				if(!bComma && commaCount>0){
					bits++;
					if(bits ==2){
						return false;
					}

				}

			}
		});
		val = ret.join('');
		if(val==''){
			$el.val('');
			return;
		}
		//val = Number(val);
		//if($.isNumeric(val)){
		//	val = Number(val);
		//}
		var money = $el.data('money');
		if(val > money) {
			$el.val(Number(money));
			viewJs.showPopMsg('最高可提现'+ money+'元');
		}
		/*
		 if(val > withdraw) {
		 $el.val(Number(withdraw));
		 var $m = viewJs.showPopTip({el:$el,msg:'最高可提现'+ withdraw+'元'});
		 } else {
		 $el.siblings('.elTip').remove();
		 $el.val(val);
		 }
		 */
	},success:function(f){
		var $p = $.mobile.activePage;
		var me = withdrawJs;
		var $m = $p.find('.money');
		var balance = $.trim(Number($m.data('money'))- Number($m.val()));
		var user = dmJs.sStore.getUserInfo();
		var userInfo = user.user;
		userInfo.balance = balance;
		var $subBranch = $p.find('.toSubBranch');
		if( $subBranch .length > 0){
			userInfo.subBranch = $.trim($subBranch.text());
		}
		dmJs.sStore.saveLoginInfo(user);
		me.withdrawResult(f.creditCardNumber,f.money);
	},withdrawResult:function(creditCardNumber,money){
		var $p = $.mobile.activePage;
		var me = withdrawJs;
		var tpl = $p.find('#withdraw_result_tpl').html();
		var info = {creditCardNumber:creditCardNumber,money:money};
		$p.hide();
		$(document.body).append(viewJs.applyTpl(tpl, info));
		me.toggleEvents(true);
	},toLoginUserPage:function(){
		viewJs.navigator.next({
			next:{url:'./mine.html',id:'mine'}
		});
	},remindToggle:function(e){
		$(".remind-mess").slideToggle(500);
		e.stopPropagation();
	},remindHide:function(){
		$(".remind-mess").slideUp(500);
	},comparisonUser:function(user){
		var me = withdrawJs;
		var userInfo = dmJs.sStore.getUserInfo();
		var accessToken = userInfo.accessToken;
		if(accessToken == null || accessToken == ''){
			return;
		}
		var $p = $.mobile.activePage;
		var accessInvalid = function(){
			dmJs.sStore.toLogin({url:'./account.html'});
		};

		dmJs._ajax({
			id:"getUserPageByAccessToken",
			url:'/urming_quan/user/getUserPageByAccessToken',
			accessInvalid:accessInvalid,
			params:{accessToken:accessToken,type:2},
			callback:function(data){
				userInfo.user = data.user;
				userInfo.saveSelf();
				if(user.isWithdrawing != userInfo.user.isWithdrawing){
					me.initPage(userInfo.user);
				}
			}
		});
	}
};