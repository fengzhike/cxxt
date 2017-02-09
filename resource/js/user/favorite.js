favoriteJs = {
	init:function(){
        if(!this.chkLogin()){
            return;
        }
		this.toggleEvents(true);
		this.initPage();
	},initPage:function(){
		var params = mainJs.parseUrlSearch();
//		this.fetchServiceData();
        this._fetchSelTab();
	},chkLogin:function(){
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
		var me = favoriteJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
//				$p.delegate('.service', 'vclick', me.toServiceDetail);
			    $p.delegate('[action]', 'vclick', me.doAction);
                $p.delegate('.tabHeader .header', 'tabchange', me._fetchSelTab);
			}, 500);
		}
	},_fetchSelTab:function(){
        var me = favoriteJs;
        var $p = $.mobile.activePage;
        var currentTab = $p.find('.current[tabi]').attr('tabi');
        if(currentTab == 2){
            me.fetchWantData();
        } else {
            me.fetchServiceData();
        }
    },doAction:function(evt){
        var $el = $(this);
        var me = favoriteJs;
        var sAction = $el.attr('action');
        switch(sAction){
            case 'pageNav':
                if($el.is('.tab2 [action]')){
                    me.fetchWantData.call($el,evt);
                } else {
                    me.fetchServiceData.call($el,evt);
                }
                break;
            case 'want':
            case 'service':
                me.toPage.call($el, arguments);
                break;
        }
    },fetchServiceData:function(evt){
        var me = favoriteJs;
        me._fetchData({evt:evt,domain:arguments.callee});
	},fetchWantData:function(evt){
        var me = favoriteJs;
        me._fetchData({evt:evt,domain:arguments.callee}, true);
    },_fetchData:function(opt, bWant){
        var _self = opt.domain;
        var evt = opt.evt;
        var me = favoriteJs;
        if(_self.busy){
            return;
        }
        if(!me.chkLogin()){
            return;
        }
        var offset = 0;
        if(evt && evt.type == 'vclick'){
            var $el = $(evt.target);
            if($el.is('.disabled')){
                return;
            }
            offset = (Number($el.attr('data-page-num'))-1)*mainJs.PAGE_SIZE;
        }
        _self.busy = true;
        var currentUser = dmJs.sStore.getUserInfo();
        if(currentUser == null){
            dmJs.sStore.toLogin({href:'./favorite.html'});
            return;
        }
        var me = favoriteJs;
        var params = {};
        params.accessToken = currentUser.accessToken;
        params.pageSize = mainJs.PAGE_SIZE;
        params.offset = offset;
        params.longitude = dmJs.params.geolocation.longitude;
        params.latitude = dmJs.params.geolocation.latitude;
        var url = bWant ? '/urming_quan/want/getStoredWant' : '/urming_quan/service/getStoredService';
        dmJs._ajax({
            id:bWant ? 'getStoredWant' : 'getStoredService',
            url:url,
            params:params,
            accessInvalid:function(){
                dmJs.sStore.toLogin({href:'./favorite.html'});
            },
            callback:function(res){
                me.parseList(res,params, bWant);
            }
        }).complete(function(){
            viewJs.delayCancelBusy(_self);
        })
    },parseList:function(data, opt,bWant){
        var me = favoriteJs;
		var list = data.services || data.wants;
		var total = data.total;
		var l = list.length;
        var $p = $.mobile.activePage;
		var $c = $p.find(bWant ? '.tabCtr>.tabContent>.tab2' : '.tabCtr>.tabContent>.tab1');
        var paperTpl = $p.find('#paper_tpl').html();
		var html = [];
		if(l > 0){
			var i=0,item;
			var tpl = $(bWant ? '#want_item_tpl' : '#service_item_tpl').html();
			for(; i < l; i++){
				item = list[i];
				html.push(viewJs.applyTpl(tpl, me.formatInfo(item, bWant)));
			}
		}
        viewJs.addPaperFooter(html,opt.offset, total, l,paperTpl);
        $c.html(html.join(''));
	},formatInfo:function(item, bwant){
        var info = {},svrVer;
        if(!bwant){
            svrVer = item.serviceVersion;
            info.id = item.id;
            info.count = item.soldNum;
            info.img = mainJs.getSvrPicUrl({url:svrVer.picUrl,size:2});
            info.price = svrVer.newPrice+((svrVer.unit==undefined || svrVer.unit=="")?"":("/"+svrVer.unit));
            info.itemName = svrVer.serviceName;
            info.userName = svrVer.userByUserId.realname;
            info.distance  = svrVer.distance;
            info.catId = svrVer.category.category.id;
        } else {
            //svrVer = item.serviceVersion;
            info.id = item.id;
            info.distance  = item.distance;
//            info.count = item.soldNum;
//            info.img = mainJs.getSvrPicUrl({url:svrVer.picUrl,size:2});
            info.price = "￥"+item.price+((item.unit==undefined || item.unit=="")?"":("/"+item.unit));
            info.itemName = item.wantName;
            console.log(info);
            info.catId = item.category.category.id;
//            info.userName = svrVer.userByUserId.realname;
        }

        return info;
    },toPage:function(){
        		var $m = $(this);
		var id = $m.attr('data-item-id');
		if(id != null && id != ''){
            var next;
            var catId = $m.attr('data-item-catId');
            if($m.is('[action=service]')){
                if(catId==3){
                    next = {
                        url:'./course.html', id:'course',
                        options:{
                            data:{serviceID:id}
                        }
                    };
                }else{
                    next = {
                        url:'./service.html', id:'service',
                        options:{
                            data:{serviceID:id}
                        }
                    };
                }
			} else {
                if(catId==5){
                    next = {
                        url:'./question.html', id:'question',
                        options:{
                            data:{wantID:id}
                        }
                    };
                }else{
                    next = {
                        url:'./want.html', id:'want',
                        options:{
                            data:{wantID:id}
                        }
                    };
                }
            }
			viewJs.navigator.next({
					next:next,
					lastAuto:true
				});
		}
	}
};