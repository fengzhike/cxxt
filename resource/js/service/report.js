reportJs = {
	init:function(){
		this.toggleEvents(true);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = reportJs;
		$p.undelegate();
		if(isBind){
			setTimeout(function(){
				$p.delegate('.reason-select .vbt.vr', 'tap', me.selectReason);
				$p.delegate('.vbt.submit:not([disabled])', 'vclick', me.submitReport);
				$p.delegate('#report_reason', 'input', me.validSubmit);
			}, 500);
		}
	},validSubmit:function(){
		var $p = $.mobile.activePage;
		var $el = $(this);
		var $btn = $p.find('.vbt.submit');
		var val = $.trim($el.val());
		var bDisabled = $btn.is('[disabled]');
		if(val == '' && !bDisabled) {
			$btn.attr('disabled', '');
		} else if(val != '' && bDisabled){
			$btn.attr('disabled', null);
		}
		
	},submitReport:function(){
		var $p = $.mobile.activePage;
		var me = reportJs;
		var $enter = $p.find('.reason-enter>textarea:first');
		var reason = $.trim($p.find('.reason-select .select').text());
        var sDetail =  $.trim($enter.val());
        if(sDetail == ''){
            viewJs.showPopMsg('举报理由不能为空');
            return;
        }
		if(sDetail != ''){
            reason +="："+sDetail;
        }
		var accessToken  = dmJs.getAccessToken();
		var params = mainJs.parseUrlSearch();
        var sUrl,oParam = {accessToken:accessToken,content:decodeURIComponent(reason)};
        if(params.serviceID != null){
            sUrl = '/urming_quan/service/report';
            oParam.serviceID = params.serviceID;
        } else {
            sUrl = '/urming_quan/want/report';
            oParam.wantID = params.wantID;
        }
		dmJs._ajax({
			url:sUrl,
			id:'report',
			method:'POST',
			params:oParam,
			callback:function(){
				console.log(arguments);	
				viewJs.navigator.pre();
			}
			});
	},selectReason:function(){
		var $el = $(this);
		if($el.is('.select')){
			return;
		}
		var $p = $.mobile.activePage;
		var me = reportJs;
		$el.addClass('select').siblings('.vbt.vr.select').removeClass('select');
	}
};