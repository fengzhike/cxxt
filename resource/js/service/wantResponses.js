var wantResponsesJs = {
	init:function(){
		if(!this.chkLogin()){
			return;
		}
        this.toggleEvents(true);
		var $p = $.mobile.activePage;
		$p.find('.tabContent .content').empty();
        var params = mainJs.parseUrlSearch();
        var initTab = params.orderType ? params.orderType : '0';
        initTab = $p.find('[tab="'+initTab+'"]').addClass('sel');
        this._fetchData();
	},toggleTab:function(){
        var $el = $(this);
        if($el.is('.sel')){
            return;
        }
        var $p = $.mobile.activePage;
        $p.find('[tab].sel').removeClass('sel');
        $p.find('[tab="'+$el.attr('tab')+'"]').addClass('sel');
        var me = wantResponsesJs;
        me._fetchData();
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = wantResponsesJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('[action]', 'vclick', me.doAction);
				$p.delegate('.getServiceOwnByID', 'vclick', me.getServiceOwnByID);
				$p.delegate('.svrResItem', 'vclick', me.toServiceDetail);
			}, 500);
        }
	},doAction:function(e){
		e.preventDefault();
		e.stopPropagation();
		var $el = $(this);
		var me = wantResponsesJs;
		var action = $el.attr('action');
		var param = $el.attr('param');
		switch(action){
            case 'tab':
                me.toggleTab.call($el);
                break;
            case 'pageNav':
                if($el.is('.tab1 [action]')){
                    me._fetchData.call($el,e);
                } else {
                    me._fetchData.call($el,e);
                }
                break;
		}
	},_fetchData:function(evt){
        var me = wantResponsesJs;
        viewJs.loadPage($.extend(me._getOpt(),{evt:evt}));
    },_getOpt:function(){
        var $p = $.mobile.activePage;
        var me = wantResponsesJs;
        var $current = $p.find('.btn-tab.sel');
        var tab = $current.attr('tab');
        var ret = {
            $num:$p.find('.btn-tab[tab="'+tab+'"]  .num'),
            $content:$p.find('.tabContent>[tab="'+tab+'"]'),
            bLogin:true,
            key:'0',
            domain:{},
            tpl:$('#svr_item_tpl').html(),
            paperTpl:$('#publish_paper_tpl').html(),
            itemParser:me.itemParser,
            dataKey:'data'
        };
        ret.url = '/urming_quan/service/getRespondServiceList';
        var user = dmJs.sStore.getUserInfo();
        var params = mainJs.parseUrlSearch();
        ret.param = {orderType:tab,wantID:params.wantID,accessToken:user.accessToken};
        return ret;
    },chkLogin:function(){
		var user = dmJs.sStore.getUserInfo();
		if(user == null){
			viewJs.dialogPop('请先登录！', function(){
				viewJs.navigator.pre();
			}, '错误', {onlyBtnOk:true});
			return;
		}
		return true;
	},getServiceOwnByID:function(){
			var lastParams = mainJs.parseUrlSearch();
			lastParams.tab = 'finish';
			viewJs.navigator.next({next:{	
				url:'./buyorderDetail.html', id:'buyorderDetail',
				options:{
					data:{serviceOwnID:$(this).attr('data-service-own-id'),userType:'2'}
				}
			},last:{
				id:'myServices',
				url:'./myServices.html',
				options:{data:lastParams}
			}
		});
	},itemParser:function(item){
        var info = {};
        info.serviceID = item.id;
        info.username = item.username;
        info.img = mainJs.getProfilePicUrl({url:item.profileImageUrl, sex:item.userSex});
        info.serviceDesc = item.serviceDesc;
        info.newPrice = item.newPrice;
        info.prTotal = Math.floor(item.prTotal);
        info.creTime = item.isAccepted==1?'已购买':item.creTime;
        info.style = item.isAccepted==1?'striking-1':'';
        return info;
    },toServiceDetail:function(){
		var $m = $(this);
		var serviceID = $m.attr('data-serviceID');
        var $p = $.mobile.activePage;
        var me = wantResponsesJs;
        var $current = $p.find('.btn-tab.sel');
        var tab = $current.attr('tab');
		if(serviceID != null && serviceID != ''){	
			var params = {serviceID:serviceID};
			viewJs.navigator.next({
					next:{url:'./service.html', id:'service',
						options:{
							data:params
						}}
					,last:{
						id:'wantResponses',
						url:'./wantResponses.html',
						options:{data:{orderType:tab,wantID:mainJs.parseUrlSearch().wantID}}
					}
				});
		}
	}
};