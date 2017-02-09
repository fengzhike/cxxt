var withdrawJs = {
	vars:{
		subBranchExcept:'中国工商银行'
	},
	draw:function(){
		var user = dmJs.sStore.getUserInfo();
		if(!user){
			dmJs.sStore.toLogin({next:{url:'./withdraw.html',id:'withdraw'}});
			return;
		}
		var $p = $.mobile.activePage;
		var me = withdrawJs;
		var userInfo = user.user;
		$p.find('.vTd.balance').html(Number(userInfo.balance)+'元');
		var html = [
			'<div class="vTr">',
				'<div class="vTh">姓名</div>',
				'<div class="vTd">',userInfo.realname,'</div>',
			'</div>',
			'<div class="vTr">',
				'<div class="vTh">银行卡号</div>',
				'<div class="vTd">',userInfo.creditCardNumber,'</div>',
			'</div>',
			'<div class="vTr">',
				'<div class="vTh">开户银行</div>',
				'<div class="vTd bank">',userInfo.bank,'</div>',
			'</div>'
		];
		
		if(me.vars.subBranchExcept.search(userInfo.bank) < 0){
			var subBranch = $.trim(userInfo.subBranch);
			html.push([
				'<div class="vTr">',
					'<div class="vTh">开户城市</div>',
					'<div class="vTd">',userInfo.bankCity,'</div>',
				'</div>',
				'<div class="vTr row-subBranch">',
					'<div class="vTh">所在支行</div>',
					'<div class="vTd',(subBranch == '' ? ' toSubBranch' :''),'">',subBranch,'</div>',
				'</div>'
			].join(''));
		}
		$p.find('.accountInfo').html(html.join(''));

		$.get(mainJs.getApiUrl('/urming_quan/user/getLimitWithdraw'), {accessToken:dmJs.getAccessToken()}, function(data){
			var r = $.parseJSON(data);
			$p.find('.vTd.withdraw').html(Number(r.withdraw)+'元');
			$p.find('.inputCtr.withdraw-money input').data('withdraw',Number(r.withdraw));
			if(r.withdraw < userInfo.balance){
				$(".remind-btn").show();
			}
		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});
	},
	init:function(){
		this.draw();
		this.toggleEvents(true);
	},
	back:function(){
			viewJs.navigator.pre();
	},
	success:function(){
		var $p = $.mobile.activePage;
		var $m = $p.find('.inputCtr.withdraw-money input');
		var balance = $.trim(Number($m.data('withdraw'))- Number($m.val()));
		var user = dmJs.sStore.getUserInfo();
		var userInfo = user.user;
		userInfo.balance = balance;
		var $subBranch = $p.find('.toSubBranch');
		if( $subBranch .length > 0){
			userInfo.subBranch = $.trim($subBranch.text());
		}
		dmJs.sStore.saveLoginInfo(user);
		dmJs.sStore.syncBalance(function(){
			withdrawJs.toLoginUserPage();
		});
	},
	validateMoney:function(){
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
		var withdraw = $el.data('withdraw');
		if(val > withdraw) {
			$el.val(Number(withdraw));
			viewJs.showPopMsg('最高可提现'+ withdraw+'元');
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
	},
	toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = withdrawJs;
		$p.undelegate();
		$('#subBranchDlg').undelegate();
		if(isBind){
			setTimeout(function(){
				$p.one('pagebeforehide', function(){	
					me.toggleEvents();
					$('#subBranchDlg').remove();
				});
				me.toggleEvents();
					$p.delegate('.remind-btn','vclick',me.remindToggle);
					$p.delegate('.tip-line,.vTr','vclick',me.remindHide);
					$p.delegate('.inputCtr.withdraw-money input', 'input',me.validateMoney);
					$p.delegate('.vbt.submit','vclick', me.submit);
					$p.delegate('.vrHeader .backBtn','vclick', me.back);
					$p.delegate('.toSubBranch','vclick', me.toSelectSubBranch);
					$('#subBranchDlg').delegate('.ui-btn.vBack,.branch','vclick',
					me.selSubBranch).delegate('.filterInput','input',
					me.toFilterSubBranch).delegate('.filterInput','change',me.toFilterSubBranch);
			}, 500);

		}
	},toSelectSubBranch:function(){
		var me = withdrawJs;
		var $p = $.mobile.activePage;
		viewJs.top();
		var user = dmJs.sStore.getUserInfo();
		var userInfo = user.user;
		var bank = userInfo.bank;
		var bankCity = userInfo.bankCity;

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
		if(!$el.is('.branch')){
		} else {
			$p.find('.toSubBranch').text($.trim($el.text()));
		}
		me.toggleEvents(true);
		$('#subBranchDlg').remove();
		$p.show();
	},submit:function(){
		var me = withdrawJs;
		var f = me.validate();
		if(f != null){
			dmJs._ajax({
				method:'POST',
				id:'widthDraw',
				params:f,
				url:'/urming_quan/user/withdraw',
				callback:me.success
			});
		}
	},validate:function(){
		var $p = $.mobile.activePage;
		var me = withdrawJs;
		var f = {};
		f.money = Number($.trim($p.find('.inputCtr.withdraw-money input').val()));
		f.accessToken = dmJs.sStore.getUserInfo().accessToken;
		var msg;
		if(f.money <= 0){
			msg = "提现金额不能为0";
		}
		if(!msg){
			msg = viewJs.validate({name:'提现金额', val:f.money, must:true});
		}
		if(msg){
			viewJs.showPopMsg(msg);
			return;
		}
		var $subBranch = $p.find('.toSubBranch');
		var subBranch;
		if($subBranch.length > 0){
			subBranch = $.trim($subBranch.text());
			if(subBranch == ''){
				msg = '请选择所在支行';
				viewJs.showPopMsg(msg);
				return;
			}
		}
		if(subBranch){f.subBranch = subBranch;};
		return f;
	},toLoginUserPage:function(){
		viewJs.navigator.next({
			next:{url:'./mine.html',id:'mine'}
		});
	},remindToggle:function(e){
		$(".remind-mess").slideToggle(500);
		e.stopPropagation();
	},remindHide:function(){
		$(".remind-mess").slideUp(500);
	}
};