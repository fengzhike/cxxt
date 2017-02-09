buyorderJs = {
    _tmpData:{},
    offset:0,
    init:function(){
        if(!this.chkLogin()){
            return;
        }
        //this.resetData(true);
        this.toggleEvents(true);
        this.initPage();
    },initPage:function(){
        this._fetchData();
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
        var me = buyorderJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.ui-content [action]', 'vclick', me.doAction).delegate('.h-menu [action]', 'vclick',headerFooterJs. _action);
                $('.ui-page-active .new_search').on('vclick',function(){
                    setTimeout(function(){
                        $p.find('.ui-header').removeClass('no-search').addClass('do-search')
                        $p.find('.ui-input-search input').val('')
                    },300)
                    //alert(1)

                })
                $p.delegate('.user-info','vclick',me.toSvrUserInfo)
                $('.ui-page-active .cancel_search').on('vclick',function(){
                    setTimeout(function(){
                        $p.find('.ui-header').removeClass('do-search').addClass('no-search')
                    },300)
                   // alert(2)
                })
                $p.delegate('.main-title','vclick',function(){
                    if($p.find('.down_menu').css('display')==='none'){
                        $p.find('.down_menu').show();
                        $p.find('.ui-mask').show();
                    }else{
                        $p.find('.down_menu').hide();
                        $p.find('.ui-mask').hide();
                    }

                })
                $p.delegate('.down_menu li','vclick',function(){
                    $(this).addClass('act').siblings().removeClass('act');
                    var params = mainJs.parseUrlSearch();
                    params.type =  $(this).index();
                    params.keyword = null;
                    viewJs.navigator.next({
                        next:{url:'./buyorder.html', id:'buyorder',options:{data:params}},
                        lastAuto:true
                    });
                })
                //fsk输入面板确定搜索
                $p.delegate('.ui-input-search input','keydown',function(e){
                    var e = e||event;
                    var keynum

                    if(window.event) // IE
                    {
                        keynum = e.keyCode
                    }
                    else if(e.which) // Netscape/Firefox/Opera
                    {
                        keynum = e.which
                    }
                   if(keynum =='13'){
                       var keyword = $p.find('.ui-input-search input').val()
                       if(keyword.trim().length ===0){
                           return;
                       }
                       var params = mainJs.parseUrlSearch();
                       params.keyword =keyword ;
                       viewJs.navigator.next({
                           next:{url:'./buyorder.html', id:'buyorder',options:{data:params}},
                           lastAuto:true
                       });
                       // 去搜索
                   }

                })
                $p.delegate('.order-dec','vclick',function(){
                    var params = {}
                    params.userType = mainJs.parseUrlSearch().userType;
                    params.serviceOwnID = $(this).attr('data-service-own-id')
                    viewJs.navigator.next({
                        next:{url:'./buyorderDetail.html', id:'buyorderDetail',options:{data:params}},
                        lastAuto:true
                    });
                })
                $p.delegate('.del-order','vclick',function(){
                    var params = {
                        accessToken:dmJs.sStore.getUserInfo().accessToken,
                        serviceCartID:$(this).attr('data-servicecartid')
                    }
                    viewJs.dialogPop('取消订单后，无法恢复，<br/> 确认取消？',function(ok){
                        if(ok){
                            dmJs._ajax({
                                id: 'cancelServiceCartByID',
                                url: '/urming_quan/service/cancelServiceCartByID',
                                params: params,
                                callback: function (data) {
                                    //console.log(data)
                                    me._fetchData()

                                }
                            })
                        }
                    },'取消订单');

                })
                $p.delegate('.connect','vclick',function(){
                    var type = $(this).attr('con_type'),
                        content = $(this).attr('content');
                    if(type ==='0'){
                        type = '联系电话:<br/>'
                        content = '<a href="tel:'+ content +'">'+content+'</a>'
                    }else if(type ==='1'){
                        type = '联系邮箱:<br/>'
                        content ='<a href="mailto:'+content+'">'+content+'</a>' ;
                    }else if(type ==='2'){
                        type = '联系微信:<br/>'
                    }else{
                        type = '';
                    }
                    viewJs.dialogPop(type+content,function(ok){
                        if(ok){
                            /*setTimeout(function(){
                                $(this).remove()
                                },100)*/

                        }
                    },'联系方式',{onlyBtnOk:true});
                }).delegate('.ui-mask','vclick',function(){
                    setTimeout(function(){
                        $p.find('.down_menu,.ui-mask').hide()
                    },100)
                }).delegate('.ui-mask','vmousemove',function(event){
                    event.preventDefault()
                })
            }, 500);
        }
    },toSvrUserInfo:function(){
        var $el = $(this),userId = $el.attr('data-userid');
        if(userId != null){
            viewJs.navigator.next({
                next:{url:'./u.html', id:'u',
                    options:{
                        data:{userId:userId}
                    }},
                lastAuto:true
            });
        }
    },doAction:function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var me = buyorderJs;
        var $el = $(this);
        var sAction = $el.attr('action');
        switch(sAction){
            case 'pageNav':
                me.pageNav.call($el);
                break;
            case 'pay':
            case 'review':
            case 'orderDetail':
            case 'service':
            case 'my-review':
            case 'buyAgain':
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
        var me = buyorderJs;
        me._fetchData(me._getOpt());
    },pageNav:function(e){
        var $p = $.mobile.activePage;
        var me = buyorderJs;
        if($(this).is('.disabled')){
            return;
        }
        //console.log(this)
        var sAction = $.trim($(this).attr('action'));
        if(sAction == "pageNav"){
            me.offset = ($(this).attr('data-page-num')-1)*20;
            $p.find('.ui-content .pager-nav').remove()
            me._fetchData()
        }

    },_fetchData:function(){
        var $p = $.mobile.activePage;
        var me = buyorderJs;
        if(!me.chkLogin()){
            return;
        }
        var objdata = mainJs.parseUrlSearch();
        /*if(evt && evt.type == 'vclick'){
            var $el = $(evt.target);
            if($el.is('.disabled')){
                return;
            }
            offset = (Number($el.attr('data-page-num'))-1)*mainJs.PAGE_SIZE;
        }*/
        var titleArr = ['全部订单','已取消','待付款','待确认','已完成'];
        titleArr[0] = objdata.userType === '1' ? '全部已购订单' : '全部已售订单';
        $p.find('.down_menu li').eq(0).text(titleArr[0]);
        $p.find('.ui-title').html(titleArr[objdata.type])

        $p.find('.down_menu li').removeClass('act').eq(objdata.type).addClass('act')
        var currentUser = dmJs.sStore.getUserInfo();
        if(currentUser == null){
            dmJs.sStore.toLogin({href:'./buyorder.html'});
            return;
        }
        var params = objdata;
        params.accessToken = currentUser.accessToken;
        params.pageSize = 20;
        params.offset = me.offset;
        dmJs._ajax({
            method:'POST',
            id:'getOrders',
            url:'/urming_quan/service/getOrders',
            params:params,
            callback:function(data){
                me.parseList(data);
            },accessInvalid:function(){
                dmJs.sStore.toLogin({href:'./myOrders.html'});
            },error:function(){
                viewJs.showPopMsg('网络错误');
            }
        });
    },toUse:function(){
        var me = buyorderJs;
        var $el = $(this);
        var id = $el.parent().prev().attr('data-service-own-id');
        viewJs.dialogPop('确认支付后，我们将会把您购买服务的费用支付给卖家.',function(ok){
            if(ok){
                dmJs.confirmService(id, function(){
                    me._fetchData();
                });
            }
        },'确认支付？');
    },parseList:function(data){
        var $p = $.mobile.activePage;
        var me = buyorderJs;
        //console.log(data)
        var orders = data.orders;
        var picUrlArr = ['getSvrPicUrl','getActPicUrl','getCoursPicUrl','getFunPicUrl'];
        var stateArr = ['全部','已取消','待付款','待确认','已完成'];
        var str = '';
        if(orders.length>0){
            for(var i=0;i<orders.length;i++){
                var item = orders[i];
                var info = {};
               // console.log(item)
                if(item.serviceVersion.picUrl){
                    info.picurl = mainJs[picUrlArr[0]]({url:item.serviceVersion.picUrl,size:2});
                }else{
                    info.picurl = mainJs[picUrlArr[0]]({url:'',size:2})
                }
                var user;

                if(mainJs.parseUrlSearch().userType ==1){
                    user = item.serviceVersion.userByUserId;
                    var connect = '联系卖家';
                    switch(item.serviceVersion.contactType){
                        case 0:
                            info.connectType = '0';
                            info.connectContent = item.serviceVersion.contactContent;
                            break;
                        case 1:
                            info.connectType = '1';
                            info.connectContent = item.serviceVersion.contactContent;
                            break;
                        case 2:
                            info.connectType = '2';
                            info.connectContent = item.serviceVersion.contactContent;
                            break;
                        case -1:
                            info.connectContent = '卖家没有留下联系方式'
                            break;
                    }
                }else{
                    user = item.userByUserId;
                    var connect = '联系买家';
                    info.connectType = '0';
                    info.connectContent = user.contactPhone;
                }
                info.username = user.realname;
                info.payState =stateArr[item];
                info.profileImageUrl =mainJs.getProfilePicUrl({url:user.profileImageUrl, sex: user.sex});
                info.serviceName = item.serviceVersion.serviceName;
                info.pubTime = item.creTime.split(' ')[0].replace(/-/g,'/');
                info.price = item.unitPrice;
                info.serownId = item.id;
                info.paystate =null;
                info.sure =null;
                info.num =item.num;
                info.total =item.price;
                info.catid =item.serviceVersion.category.category.id;


               // console.log(info.catid)
                switch(item.status){
                    case 1:
                        info.paystate = '待确认';
                    info.sure = '确认支付';
                        break;
                    case 9:
                        info.paystate = '待确认';
                        info.sure = null;
                        break;
                    case 7:
                        info.paystate = '已完成';
                    info.sure = '去评价';
                        break;
                    case 11:
                        info.paystate = '已完成';
                        info.sure = '去评价';
                        connect = null;
                        break;
                    case 8:
                        info.paystate = '已完成';
                    info.sure = '查看评价';
                        break;
                    case 12:
                        info.paystate = '已完成';
                        info.sure = '查看评价';
                        connect = null;
                        break;
                    case -3:
                        if(mainJs.parseUrlSearch().userType ==1){
                            info.sure = '去付款'
                        }else{
                            info.sure = '等待买家付款'
                        }
                        info.paystate = '待付款';
                        break;
                    case -2:
                        info.paystate = '已取消';
                        info.sure =mainJs.parseUrlSearch().userType ==2? '':'再次购买';
                        break;
                    case -1:
                        info.paystate = '已关闭';
                        info.sure =mainJs.parseUrlSearch().userType ==2? '':'再次购买';
                        break;

                }
                str += '<li >\
                <header class="list-header clearFix">\
                    <div class="user-info" data-userid='+ user.id +'>\
                        <img src='+ info.profileImageUrl +' alt=""/>\
                        <span>'+ info.username +'</span>\
                    </div>\
                    <p class="pay-state">'+info.paystate+'</p>\
                </header>\
                <section class="order-dec clearFix" data-service-own-id='+info.serownId+' >\
                    <div class="pic-wrap">\
                     <img src='+info.picurl+' alt=""/>\
                     <div class="typeTag" actid = '+ info.catid +'></div>\
                    </div>\
                    <div class="order-info">\
                        <h3 class="order-title">'+ info.serviceName +'</h3>\
                        <time class="pub-time">'+info.pubTime+'</time>\
                    </div>\
                    <p class="price">￥'+ info.price +'</p>\
                    <p class="num">x'+ info.num +'</p>\
                    <p class="price_detail">共'+ info.num +'件商品，合计：'+  info.total+'元</p>\
                </section>\
                <footer class="deal clearFix">'
                if(connect){
                    str+='<p class="connect" con_type = '+ info.connectType +' content = '+ info.connectContent +'>'+ connect +'</p>'
                }

                if(info.sure){
                    str+= '<p class="pay-order"  actid = '+ info.catid +' >'+info.sure+'</p>'
                }else{
                    str+= '<p class="pay-order" style = "display:none" actid = '+ info.catid +' >'+info.sure+'</p>'
                }

                if(item.status ==-3 && mainJs.parseUrlSearch().userType ==1){
                    str+='<p class="del-order" data-serviceCartID = '+ item.serviceCart.id  +'>取消订单</p>'
                }

                str+='</footer></li>'
            }

        }else{
            str = '<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>';
        }
        $p.find('.order-list').html(str);
        $p.find('.typeTag').each(function(i,item){
            switch($(item).attr('actid')){
                case '1':
                    $(item).html('服务').addClass('service');
                    break;
                case '3':
                    $(item).addClass('course').html('课程');
                    break;
                case '4':
                    $(item).addClass('active').html('活动');
                    break;
                case '8':
                    $(item).addClass('funding').html('融资');
                    break;

            }
        })

        $p.find('.pay-order').each(function(i,item){
            $(item).data('data-params',orders[i])
            if($(item).html()==='确认支付'){
                $(item).attr('action','use')
            }else if($(item).html()==='去评价'){
                $(item).attr('action','review')
                $(item).attr('actid') ==='8' && $(item).hide()
            }else if($(item).html()==='查看评价'){
                $(item).attr('action','my-review')
                $(item).attr('actid') ==='8' && $(item).hide()
            }else if($(item).html()==='去付款'){
                $(item).attr('action','pay')
            }else if($(item).html()==='再次购买'){
                $(item).attr('action','buyAgain')
            }else{
                $(item).attr('disable','1')
            }
        })
        if(mainJs.parseUrlSearch().userType ==2){
            $p.find('.order-list li').addClass('sale')
            $p.find('.order-list .sale [disable]').hide()
        }
        var html = [];
        var total = data.total;
        var me = buyorderJs;
        var paperTpl = $p.find('#paper_tpl').html();
		if(total > 20){

                var _PAGE_SIZE = mainJs.PAGE_SIZE;
                var pageInfo = {};
                pageInfo.hasPre = me.offset > 0 ? '' : 'disabled';
                pageInfo.hasNext = (me.offset+_PAGE_SIZE) < total ? '' : 'disabled';
                var pageCurrent = Math.ceil(me.offset/_PAGE_SIZE+0.1);
                pageInfo.pagePre = pageCurrent-1;
                pageInfo.pageNext = pageCurrent+1;
                pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
                html.push(viewJs.applyTpl(paperTpl, pageInfo));
		}
        viewJs.top()
        $p.find('.pager-nav').remove();
        $p.find('.ui-content').append(html.join(''))

    },toPage:function(){
        var $m = $(this);
        var id = $m.parent().prev().attr('data-service-own-id');


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
					//hw
					//param+='&catId='+parentCategoryId;
                    //console.log($(this).data('data-params'))
                    var item = $(this).data('data-params');
                    var param = {
                        serviceID:item.serviceCart.service.id,
                        price:item.serviceCart.price,
                        serviceVersionID:item.serviceCart.id,
                        serviceName:item.serviceCart.serviceVersion.serviceName,
                        catId:item.serviceCart.serviceVersion.category.category.id,
                        isvirtualcurr:item.serviceCart.service.isvirtualcurr,
                        buyNumber:item.serviceCart.num,
                        isAnonymous:item.serviceCart.isAnonymous,
                        accessToken:dmJs.sStore.getUserInfo().accessToken,
                        random:Math.random(),
                        serviceCartID:item.serviceCart.id
                    }
					if(typeof WeixinJSBridge != "undefined"){//weixin
                        var paramws = []
                        for(var attr in param){
                            paramws.push(attr + '=' + param[attr]);
                        }

						window.location.href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3b462eee381207f3&redirect_uri=http%3A%2F%2Fm.edu.euming.com%2FconfirmOrder.html'+encodeURIComponent('?'+paramws.join('&'))+'&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
						return;
					}
					//hw
                    //console.log(param)
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
                        url:'./buyorderDetail.html', id:'buyorderDetail',
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
                    //console.log($(this).data('data-params'))
                    var item = $(this).data('data-params');
                    var param = {
                        type : mainJs.parseUrlSearch().userType,
                        serviceName :item.serviceVersion.serviceName,
                        serviceID:item.service.id,
                        catId:item.serviceVersion.category.category.id,
                        serviceOwnID:item.id
                    }
                    //type=1&serviceName=春江花月夜赏析&serviceID=18885&catId=3
                    next = {
                        url:'./addReview.html', id:'addReview',
                        options:{
                            data:param
                        }
                    };
                    break;
                case 'my-review':
                    var item = $(this).data('data-params');
                    //offset=0&pageSize=20&reviewNumbers=7%2C0%2C0%2C1%2C27&serviceID=3818
                    var param ={
                        serviceID:item.serviceVersion.id,
                        serviceOwnID:item.id,
                        userType:mainJs.parseUrlSearch().userType,
                        type:mainJs.parseUrlSearch().userType

                    }
                    next = {
                        url:'./showReview.html', id:'showReview',
                        options:{
                            data:param
                        }
                    };
                    break;
                case 'buyAgain':
                    var item = $(this).data('data-params');
                    //serviceID=11869&price=100&serviceVersionID=17092&serviceName=生活馆创业想法小思&catId=1
                    var param ={
                        serviceID:item.service.id,
                        price:item.unitPrice,
                        serviceVersionID:item.serviceVersion.id,
                        serviceName:item.serviceVersion.serviceName,
                        catId:item.serviceVersion.category.category.id

                    }
                    next = {
                        url:'./submitOrder.html', id:'submitOrder',
                        options:{
                            data:param
                        }
                    };
                    break;
            }
            if(next){
                viewJs.navigator.next({
                    next:next,
                    last:{id:'buyorder',url:'./buyorder.html',options:{data:mainJs.parseUrlSearch()}}
                });
            }
        }
    }
};