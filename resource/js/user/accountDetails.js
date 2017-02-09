accountDetailsJs = {
	init:function(){
		if(!this.preInit()){
			return;
		}
        this.resetData(true);
		var $p = $.mobile.activePage;
		this.toggleEvents(true);
		this.fetchData();
	},preInit:function(){
		var user = dmJs.sStore.getUserInfo();
		if(user == null){
			viewJs.dialogPop('请先登录！', function(){
				viewJs.navigator.pre();
			}, '错误', {onlyBtnOk:true});
			return;
		}
		return user;
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = accountDetailsJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
                me.resetData();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('[action]', 'vclick', me.doAction);
			}, 500);
			
		}
	},resetData:function(bInit){
        var me = accountDetailsJs;
        if(bInit){
            var $p = $.mobile.activePage;
            me._data = {
                tpl:$('#accountDetail_tpl').html(),
                domain:{},
                url:'/urming_quan/user/getBalanceDetail',
                dataKey:'balanceDetails',
                $content:$p.find('#accountList'),
                paperTpl:$('#paper_tpl').html(),
                bLogin:true,
                itemParser:me.itemParser
            };
        } else {
            me._data = null;
        }
    },fetchData:function(evt){
		var me = accountDetailsJs;
        var opt = $.extend({evt:evt},me._data);
        viewJs.loadPage(opt);
	},itemParser:function(item){
        var picUrl,incomeCls,isIncom,incom;
        incom = Number(item.money);
        if(incom == 0){
            isIncom = !(/^买入-/.test(item.title));
            if(!isIncom){
                incom = '-'+incom;
            }
        } else {
            isIncom = incom > 0;
        }
        if(isIncom){
            incom = '+'+incom;
            incomeCls = 'income';
        } else {
            incomeCls = 'negative income';
        }
        item.income = incom;
        item.incomeCls = incomeCls;
        if(item.type == 3){
            item.param = $.param({balanceDetailId:item.id,type:item.type});
            item.itemCls = "arrow-right-margin";
        }
        return item;
	},doAction:function(evt){
		var me = accountDetailsJs;
		var $el = $(this);
		var param = mainJs.parseUrlSearch($el.attr('param'));
		var action = $el.attr('action');
		switch(action){
			case '3':
				viewJs.navigator.next({lastAuto:true,next:{id:'blanceDetail',url:'./blanceDetail.html',options:{data:param}}});
				break;
            case 'pageNav':
                me.fetchData.call($el, evt);
			 break;
		}
	}
};