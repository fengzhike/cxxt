myOrdersJs = {
    _tmpData:{},
    init:function(){
        if(!this.chkLogin()){
            return;
        }
        this.resetData(true);
        this.toggleEvents(true);
        this.initPage();
    },initPage:function(){
        var params = mainJs.parseUrlSearch();
        var $p = $.mobile.activePage;
        this.getCount();
        var initTab = params.tab ? params.tab : 'pay';
        initTab = $p.find('[tab="'+initTab+'"]').addClass('sel');
        this._fetchData(this._getOpt());
    },_getOpt:function(){
        var $p = $.mobile.activePage;
        var $current = $p.find('.btn-tab.sel');
        var tab = $current.attr('tab');
        var ret = {
            $num:$p.find('.btn-tab[tab="'+tab+'"]  .num'),
            domain:this._tmpData[tab],
            $content:$p.find('.tabContent>[tab="'+tab+'"]')
        }
        if(!ret.domain){
                    }
        switch(tab){
            case 'review':
                ret.url = '/urming_quan/service/getWaitToReviewServices';
                break;
            case 'pay':
                ret.url = '/urming_quan/service/getWaitToPayServices';
                break;
            case 'use':
                ret.url = '/urming_quan/service/getNotUsedServices';
                break;
            case 'complete':
                ret.url = '/urming_quan/service/getFinishedServices';
                break;
            case 'refund':
                ret.url = '/urming_quan/service/getRefundServices';
                break;
        }
        return ret;
    },getCount:function(){
        dmJs._ajax({
            url:'/urming_quan/user/getUserPageByAccessToken',
            id:'getUserPageByAccessToken',
            params:{type:1,accessToken:dmJs.getAccessToken(),parentCategoryId:mainJs.parseUrlSearch().catId},
            callback:function(data){
                var $p = $.mobile.activePage;
                $p.find('.btn-tab[tab="pay"] .num').html(data.waitToPayServiceNumber)
				.toggleClass('show', data.waitToPayServiceNumber != 0);
                $p.find('.btn-tab[tab="review"]  .num').html(data.waitToReviewServiceNumber)
				.toggleClass('show', data.waitToReviewServiceNumber != 0);
                $p.find('.btn-tab[tab="use"] .num').html(data.waitToUseServiceNumber)
				.toggleClass('show', data.waitToUseServiceNumber != 0);
            }
        });
    },resetData:function(bInit){
        if(bInit){
            this._tmpData = {};
            this._tmpData.pay = {key:'pay',tpl:$('#pay_item_tpl').html()};
            this._tmpData.use = {key:'use',tpl:$('#use_item_tpl').html()};
            this._tmpData.review = {key:'review',tpl:$('#review_item_tpl').html()};
            this._tmpData.complete = {key:'complete',tpl:$('#complete_item_tpl').html()};
            this._tmpData.refund = {key:'complete',tpl:$('#refund_item_tpl').html()};
        } else {
            this._tmpData = null;
        }

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
        var me = myOrdersJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
                me.resetData();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.ui-content [action]', 'vclick', me.doAction).
                    delegate('.h-menu [action]', 'vclick',headerFooterJs. _action);
            }, 500);
        }
    },doAction:function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var me = myOrdersJs;
        var $el = $(this);
        var sAction = $el.attr('action');
        switch(sAction){
            case 'pageNav':
                me._fetchData($.extend(me._getOpt(),{evt:evt}));
                break;
            case 'pay':
            case 'review':
            case 'orderDetail':
            case 'service':
                me.toPage.apply($el, arguments);
                break;
            case 'tab':
                me.toggleTab.call($el);
                break;
            case 'use':
                me.toUse.call($el);
                break;
        }
    },toggleTab:function(){
        var $el = $(this);
        if($el.is('.sel')){
            return;
        }
        var $p = $.mobile.activePage;
        $p.find('[tab].sel').removeClass('sel');
        $p.find('[tab="'+$el.attr('tab')+'"]').addClass('sel');
        var me = myOrdersJs;
        me._fetchData(me._getOpt());
    },_fetchData:function(opt){
        var _self = opt.domain;
        var evt = opt.evt;
        var me = myOrdersJs;
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
            dmJs.sStore.toLogin({href:'./myOrders.html',options:{data:{tab:_self.key}}});
            return;
        }
        var me = myOrdersJs;
        var params = {};
        params.accessToken = currentUser.accessToken;
        params.pageSize = mainJs.PAGE_SIZE;
        params.offset = offset;
        /*
		params.parentCategoryId = mainJs.parseUrlSearch().catId;
		switch(params.parentCategoryId){
            case '1':
				$("#title").html("购买的服务");
                break;
			case '3':
				$("#title").html("学习的课程");
                break;
            case '4':
				$("#title").html("参加的活动");
                break;
			default:
				$("#title").html("我的订单");
                break;
        }
        */
        dmJs._ajax({
            id:'fetchData_'+_self.key,
            url:opt.url,
            params:params,
            callback:function(data){
                me.parseList(data, $.extend(opt,params));
            },accessInvalid:function(){
                dmJs.sStore.toLogin({href:'./myOrders.html',options:{data:{tab:_self.key}}});
            },error:function(){
                viewJs.showPopMsg('网络错误');
            }
        }).complete(function(){
            viewJs.delayCancelBusy(_self);
        });
    },toUse:function(){
        var me = myOrdersJs;
        var $el = $(this);
        var id = $el.attr('data-item-id');
        viewJs.dialogPop('确认支付后，我们将会把您购买服务的费用支付给卖家.',function(ok){
            if(ok){
                dmJs.confirmService(id, function(){
                    me._fetchData(me._getOpt());
                    var $p = $.mobile.activePage;
                    var $num = $p.find('[tab="review"][action] .num.show');
                    var num= Number($.trim($num.text()))+1;
                    $num.text(num);
                });
            }
        },'确认支付？');
    },parseList:function(data, opt){


        var me = myOrdersJs;
        var list = data.services || data.serviceCarts || data.serviceOwns;
        var total = data.total;
        var l = list.length;
        var $p = $.mobile.activePage;
        var $c = opt.$content.empty();
        var paperTpl = $p.find('#paper_tpl').html();
        $c.data('total', total);
        opt.$num.html(total).toggleClass('show', total != 0);
        var html = [];
		if(l > 0){
			var i=0,item;
			var tpl = opt.domain.tpl || $('#service_item_tpl').html();
			for(; i < l; i++){
				item = list[i];
				html.push(viewJs.applyTpl(tpl, me.formatInfo(item,opt.domain)));
			}
			var _PAGE_SIZE = mainJs.PAGE_SIZE;
			var pageInfo = {};
			pageInfo.hasPre = opt.offset > 0 ? '' : 'disabled';
			pageInfo.hasNext = (opt.offset+_PAGE_SIZE) < total ? '' : 'disabled';
			var pageCurrent = Math.ceil(opt.offset/_PAGE_SIZE+0.1);
			pageInfo.pagePre = pageCurrent-1;
			pageInfo.pageNext = pageCurrent+1;
			pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
			html.push(viewJs.applyTpl(paperTpl, pageInfo));
		} else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>'];
        }
        viewJs.top()
        $c.html(html.join(''));

    },formatInfo:function(item, typeInfo){
       // console.log(item)
        var info = {},svrVer,userByUserId;
        if(typeInfo){
            var parentCategory = {1:"服务",2:"需求",3:"课程",4:"活动",5:"问题",6:"答案",7:"招聘",8:"融资"};
            var color = {1:"#E07D7D",3:"#267CF5",4:"#22A572",8:"#9ABB54"};
            var typePic = {1:mainJs.getSvrPicUrl,3:mainJs.getCoursPicUrl,4: mainJs.getActPicUrl,8:mainJs.getFunPicUrl};
            svrVer = item.serviceVersion;
            //console.log(svrVer.category.category.id)
            userByUserId = svrVer.userByUserId || item.userByUserId || {};
            info.id = item.id;
            info.img = typePic[svrVer.category.category.id]({url:svrVer.picUrl,size:2});
            info.itemName = svrVer.serviceName;
            info.userName = userByUserId.realname;
            info.serviceId = item.service.id;
            info.creTime = item.creTime;
            info.parentCategory = parentCategory[svrVer.category.category.id];
            info.color = color[svrVer.category.category.id];
            info.catId = svrVer.category.category.id;
            switch (typeInfo.key){
                case 'pay':
                    info.count = item.num;
                    info.price = svrVer.newPrice * item.num;
                    var param = {
                        serviceID:item.service.id
                    };
                    var payParam = {
                        serviceID:item.service.id,
                        price:svrVer.newPrice,
                        serviceVersionID:svrVer.id,
                        serviceName:info.itemName,
                        buyNumber:info.count,
                        serviceCartID:item.id,
                        isvirtualcurr:item.service.isvirtualcurr
                    };
                    if($.isNumeric(item.useBalance)){
                        payParam.useBalance = item.useBalance;
                        var  parts  = item.creTime.split(/\D+/);
                        if(parts.length == 6){
                            var t = new Date(parts[0], Number(parts[1])-1, parts[2],parts[3],parts[4],parts[5]).getTime()+45*60000;
                            payParam.validTime = t;
                        }

                    }
                    info.payParam = $.param(payParam);
                    info.param = $.param(param);
                    break;
                case 'review':
                    var param = {
                        serviceOwnID:item.id,
                        type:'1',
                        serviceName:info.itemName,
                        serviceID:item.service.id,
						catId:svrVer.category.category.id
                    };
                    info.param = $.param(param);
                default :
                    info.price = item.price;
                    break;
            }
        }
        return info;
    },toPage:function(){
        var $m = $(this);
        var id = $.trim($m.attr('data-item-id'));
        var param = $.trim($m.attr('data-param'));
        var sAction = $.trim($m.attr('action'));
		//var parentCategoryId = mainJs.parseUrlSearch().catId;
        if(param != '' || id != ''){
            var $p = $.mobile.activePage;
            var tab = $.trim($p.find('.tab-bar>[tab].sel').attr('tab'));
            tab == '' ? 'pay' : tab;
            var next;
            switch(sAction){
                case 'pay':
                    //console.log(param)
					//hw
					//param+='&catId='+parentCategoryId;
					if(typeof WeixinJSBridge != "undefined"){//weixin
						window.location.href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3b462eee381207f3&redirect_uri=http%3A%2F%2Fm.edu.euming.com%2FconfirmOrder.html%3F'+escape(param)+'&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
						return;
					}
					//hw
                    next = {
                        url:'./confirmOrder.html',
                        id:'confirmOrder',
                        options:{
                            data:param
                        }
                    };
                    break;
                case 'orderDetail':
                    next = {
                        url:'./orderDetail.html', id:'orderDetail',
                        options:{
                            data:{serviceOwnID:id,type:1}
                        }
                    };
                    /*
					if(parentCategoryId==3){
						next = {
							url:'./course.html', id:'course',
							options:{
								data:{serviceID:$.trim($m.attr('data-item-serviceId'))}
							}
						};
					}else{
						next = {
							url:'./orderDetail.html', id:'orderDetail',
							options:{
								data:{serviceOwnID:id,type:1}
							}
						};
					}*/
                    break;
                case 'service':
                    if($m.data("item-catid")==3){
                        next = {
                            url:'./course.html', id:'course',
                            options:{
                                data:param
                            }
                        };
                    }else if($m.data("item-catid")==8){
                        next = {
                            url:'./funding.html', id:'funding',
                            options:{
                                data:param
                            }
                        };
                    }else{
                        next = {
                            url:'./service.html', id:'service',
                            options:{
                                data:param
                            }
                        };
                    }
                    break;
                case 'review':
                    next = {
                        url:'./addReview.html', id:'addReview',
                        options:{
                            data:param
                        }
                    };
                    break;
            }
            if(next){
                viewJs.navigator.next({
                    next:next,
                    last:{id:'myOrders',url:'./myOrders.html',options:{data:{tab:tab/*,catId:parentCategoryId*/}}}
                });
            }
        }
    }
};