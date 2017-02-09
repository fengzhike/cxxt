var myServicesJs = {
	init:function(){
		if(!this.chkLogin()){
			return;
		}
        this.resetData(true);
        this.toggleEvents(true);
		var $p = $.mobile.activePage;
		$p.find('.tabContent .content').empty();
        var params = mainJs.parseUrlSearch();
        var initTab = params.tab ? params.tab : 'mine';
        initTab = $p.find('[tab="'+initTab+'"]').addClass('sel');
        if(initTab.length == 0){
            viewJs.navigator.next({next:{id:'myServices',url:'./myServices.html'}})
            return;
        }
        this._fetchData();

	},resetData:function(bInit){
        var $p = $.mobile.activePage;
        var me = myServicesJs;
        if(bInit){
            var  paperTpl = $('#publish_paper_tpl').html();
            me._tmpData = {};
            me._tmpData.mine = {key:'mine',tpl:$('#svr_selling_tpl').html(),domain:{},paperTpl:paperTpl,itemParser:me.itemParser,dataKey:'services'};
            me._tmpData.finish = {key:'finish',tpl:$('#svr_sold_tpl').html(),domain:{},paperTpl:paperTpl,itemParser:me.itemParser,dataKey:'serviceOwns'};
            me._tmpData.pay = {key:'pay',tpl:$('#pay_item_tpl').html(),domain:{},paperTpl:paperTpl,itemParser:me.itemParserPay,dataKey:'serviceCarts'};
        } else {
            me._tmpData = null;
        }
    },toggleTab:function(){
        var $el = $(this);
        if($el.is('.sel')){
            return;
        }
        var $p = $.mobile.activePage;
        $p.find('[tab].sel').removeClass('sel');
        $p.find('[tab="'+$el.attr('tab')+'"]').addClass('sel');
        var me = myServicesJs;
        me._fetchData();
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = myServicesJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
                me.resetData();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('[action]', 'vclick', me.doAction);
				$p.delegate('.getServiceOwnByID', 'vclick', me.getServiceOwnByID);
				$p.delegate('.service', 'vclick', me.toServiceDetail);

			}, 500);
        }
	},doAction:function(e){
		e.preventDefault();
		e.stopPropagation();
		var $el = $(this);
		var me = myServicesJs;
		var action = $el.attr('action');
		var param = $el.attr('param');
		switch(action){
			case 'delist':
				me.delistService(param, $el);
				break;
			case 'list':
				me.listService(param, $el);
				break;
			case 'edit':
				me.toEdit(param,$el.attr('catId'));
				break;
            case 'tab':
                me.toggleTab.call($el);
                break;
			case 'review':
				me.toAddReview(param);
				break;
            case 'pageNav':
                if($el.is('.tab1 [action]')){
                    me._fetchData.call($el,e);
                } else {
                    me._fetchData.call($el,e);
                }
                break;
            case 'changePrice':
                var param = $.trim($el.attr('data-param'));
                if(param==''){
                    param = $el.find('.actionBtn').attr('data-param');
                }
                viewJs.navigator.next({last:{
                    id:'myServices',
                    url:'./myServices.html',
                    options:{
                        data:{tab:'pay'}
                    }
                }, next:{id:'changePrice',url:'./changePrice.html',options:{data:{a:param}}}});
                break;
				
		}
        var $p = $.mobile.activePage;
	},_fetchData:function(evt){
        var $p = $.mobile.activePage;
        var me = myServicesJs;
        viewJs.loadPage($.extend(me._getOpt(),{evt:evt}));
        //fsk
        var parentCategoryId = mainJs.parseUrlSearch().catId;
        if(parentCategoryId==8){
            $('.tabContent div[tab = "finish"]').addClass('funding')
        }

    },_getOpt:function(){
        var $p = $.mobile.activePage;
        var me = myServicesJs;
        var $current = $p.find('.btn-tab.sel');
        var tab = $current.attr('tab');
        if(tab == 'guide'){
            return;
        }
        var ret = {
            $num:$p.find('.btn-tab[tab="'+tab+'"]  .num'),
            $content:$p.find('.tabContent>[tab="'+tab+'"]'),
            bLogin:true
        };
        $.extend(ret, me._tmpData[tab]);
        if(!ret.domain){
        }
        switch(tab){
            case 'mine':
                ret.url = '/urming_quan/service/getSellingServices';
                break;
            case 'pay':
                ret.url = '/urming_quan/service/getWaitToChangePriceServices';
                break;
            case 'finish':
                ret.url = '/urming_quan/service/getSoldServices';
                break;
        }
        var parentCategoryId = mainJs.parseUrlSearch().catId;
        ret.param = {parentCategoryId : parentCategoryId};
        switch(parentCategoryId){
            case '1':
                $("#title").html("发布的服务");
                $p.find(".btn-no-text").eq(2).html("已售服务");
                break;
            case '3':
                $("#title").html("发布的课程");
                $p.find(".btn-no-text").eq(2).html("已售课程");
                break;
            case '4':
                $("#title").html("发布的活动");
                $p.find(".btn-no-text").eq(2).html("已售活动");
                break;
            case '6':
                $("#title").html("发布的答案");
                $p.find(".btn-no-text").eq(2).html("已售答案");
                break;
            case '8':
                $("#title").html("发布的融资");
                $p.find(".btn-no-text").eq(2).html("已售融资");
                break;
            default:
                $("#title").html("发布的服务");
                $p.find(".btn-no-text").eq(2).html("已售服务");
                break;
        }
    return ret;
},toEdit:function(id,catId){
		var params = {serviceID:id,catId:catId};
		if(!viewJs.chkLogin()){
				return;
			}
			viewJs.navigator.next({
				next:{url:'./addService.html', id:'addService',
					options:{
						data:params
					}},
				last:{url:'./myServices.html', id:'myServices',options:{
						data:{tab:'mine'}
				}}
			});
	},toAddReview:function(param){
		viewJs.navigator.next({
			next:{url:'./addReview.html', id:'addReview',options:{data:param}},
			last:{url:'./myServices.html', id:'myServices',options:{
                data:{tab:'finish'}
            }}
		});
	},
	chkLogin:function(){
		var user = dmJs.sStore.getUserInfo();
		if(user == null){
			viewJs.dialogPop('请先登录！', function(){
				viewJs.navigator.pre();
			}, '错误', {onlyBtnOk:true});
			return;
		}
		return true;
	},
	delistService:function(serviceID, el){
        var me = myServicesJs;
        if(!me.chkLogin()){
            return;
        }
        dmJs._ajax({
            method:'POST',
            id:'listService',
            url:'/urming_quan/service/delistService',
            params:{serviceID:serviceID,accessToken:dmJs.getAccessToken()},
            callback:function(){
                var $el =  $(el);
                $el.parent().siblings('.watermark').removeClass('verifyStatus1').addClass('verifyStatus2');
                $el.html('上市').attr('action', 'list');
            }
        });
	},
	listService:function(serviceID, el){
        var me = myServicesJs;
        if(!me.chkLogin()){
            return;
        }
        //console.log(el)
        dmJs._ajax({
            id:'listService',
            url:'/urming_quan/service/listService',
            params:{serviceID:serviceID,accessToken:dmJs.getAccessToken()},
            callback:function(){
                var $el =  $(el);
                $el.parent().siblings('.watermark').removeClass('verifyStatus2').addClass('verifyStatus1');
                $el.html('退市').attr('action', 'delist');
            }
        });
	},
	getServiceOwnByID:function(){
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
        var serviceVersion = item.serviceVersion;
        var info = {};
        info.id = item.id;
        if(item.serviceVersion.category.category.id==3){
            info.img = mainJs.getCoursPicUrl({url:serviceVersion.picUrl,size:2});
        }else if(item.serviceVersion.category.category.id==4){
            info.img = mainJs.getActPicUrl({url:serviceVersion.picUrl,size:2});
        }else if(item.serviceVersion.category.category.id==8){
            info.img = mainJs.getFunPicUrl({url:serviceVersion.picUrl,size:2});
        }else{
            info.img = mainJs.getSvrPicUrl({url:serviceVersion.picUrl,size:2});
        }
        info.name = item.serviceVersion.serviceName;
		info.catId = item.serviceVersion.category.category.id;
        info.style = '',info.style2 = '';
        if(info.catId==3 || !item.serviceVersion.online || info.catId==8){
            info.style = 'style="display:none"';
        }
        if(info.catId==8){
            info.style2 = 'style="display:none"';

        }
        // 发布的服务
        info.count = item.soldNum;
        if(item.status){
            info.price = item.price;
            info.status = 'status'+item.status;
            if(item.status == 11){
                info.action = 'review';
                info.param = $.param({
                    serviceName:serviceVersion.serviceName,
                    serviceID:item.service.id,
                    serviceOwnID:item.id,
                    type:2
                });
                info.btnCls = '';
            } else {
                info.btnCls = 'hidecls';
            }
        } else {
            // 发布的服务
            info.status = 'verifyStatus' + serviceVersion.verifyStatus;
            info.btnCls = '';
            if(serviceVersion.verifyStatus == 1){
                info.btnAction = 'delist';
                info.btnText = '退市';
            } else if(serviceVersion.verifyStatus == 2){
                info.btnAction = 'list';
                info.btnText = '上市';
            } else {
                info.btnCls="hidecls";
            }
        }
        return info;
    },itemParserPay:function(item){
        var serviceVersion = item.serviceVersion;
        var info = {};
        info.img = mainJs.getSvrPicUrl({url:serviceVersion.picUrl,size:2});
        info.id = item.service.id;
        info.realname = item.user.realname;
        info.name = item.serviceVersion.serviceName;
        info.price = item.price * item.num;

        item.serviceVersion = null;
        var bCanNotEdit = item.price == 0 || item.alipayId || item.unionpayTn;
        if(!bCanNotEdit){
            info.param = mainJs.encode(JSON.stringify({
                serviceName:info.name,
                serviceId:item.service.id,
                userId:item.user.id,
                realname:item.user.realname,
                num:item.num,
                price:item.price,
                creTime:item.creTime,
                serviceCartId:item.id
            }));
            info.action = "changePrice";
            info.actionTxt = '修改价格';
            info.actionCls = '';
        } else {
            info.actionCls = 'disabled';
            info.actionTxt = '不能修改价格';
        }
        return info;
    },
	toServiceDetail:function(){
		var $m = $(this);
		var serviceID = $m.attr('data-serviceID');
        var $p = $.mobile.activePage;
        var me = myServicesJs;
        var $current = $p.find('.btn-tab.sel');
        var tab = $current.attr('tab');
		if(serviceID != null && serviceID != ''){	
			var params = {serviceID:serviceID};
            var next = {url:'./service.html', id:'service',options:{data:params}};
            if($m.attr('catid') == 3){
                next = {url:'./course.html', id:'course',options:{data:params}};
            }else if($m.attr('catid') == 8){
                next = {url:'./funding.html', id:'funding',options:{data:params}};
            }
			viewJs.navigator.next({
					next:next
					,last:{
						id:'myServices',
						url:'./myServices.html',
						options:{data:{tab:tab,catId:mainJs.parseUrlSearch().catId}}
					}
				});
		}
	}
};