buyorderDetailJs = {
	init:function(){
		var userType = mainJs.parseUrlSearch().userType;
		this.toggleEvents(true);
        this.getServiceOwnByID();
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = buyorderDetailJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.user-info','vclick', me.toSvrUserInfo);
				$p.delegate('.order-dec','vclick',me.toServiceDetail);
                $p.delegate('.ui-content [action]', 'vclick', me.doAction)
                //$p.delegate('.vbt.submit', 'vclick', me.submitReview);
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
                                    this.getServiceOwnByID();

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
                            setTimeout(function(){
                                $(this).remove()
                            },100)

                        }
                    },'联系方式',{onlyBtnOk:true});
                })
			}, 500);
		}
	},typesetting: function (str) {
        if (str == null) {
            return '';
        }
        return (str.replace(/\n/g, '<br/>&nbsp;&nbsp;&nbsp;'));
    },doAction:function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var me = buyorderDetailJs;
        var $el = $(this);
        var sAction = $el.attr('action');
        var id = $el.parent().prev().attr('data-service-own-id');
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
                    window.location.href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3b462eee381207f3&redirect_uri=http%3A%2F%2Fm.edu.euming.com%2FconfirmOrder.html%3F'+escape(param)+'&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
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
            case 'use':
                me.toUse.call($el);
                break;
        }
        if(next){
            viewJs.navigator.next({
                next:next,
                last:{id:'buyorder',url:'./buyorder.html',options:{data:{type:0,userType:mainJs.parseUrlSearch().userType}}}
            });
        }

    },toUse:function(){
        var me = buyorderDetailJs;
        var $el = $(this);
        var id = $el.parent().prev().attr('data-service-own-id');
        viewJs.dialogPop('确认支付后，我们将会把您购买服务的费用支付给卖家.',function(ok){
            if(ok){
                dmJs.confirmService(id, function(){
                    me.getServiceOwnByID();
                });
            }
        },'确认支付？');
    },toServiceDetail:function(){
		var $m = $(this);
        var serviceID = $m.attr('data-svrid'),
            catId = $m.attr('actid');
			var params = {serviceID:serviceID};
			if(catId==3){
				viewJs.navigator.next({
					next:{url:'./course.html', id:'course',
						options:{
							data:params
						}},
					lastAuto:true
				});
			}else if(catId==8){
				viewJs.navigator.next({
					next:{url:'./funding.html', id:'funding',
						options:{
							data:params
						}},
					lastAuto:true
				});
			}else{
				viewJs.navigator.next({
					next:{url:'./service.html', id:'service',
						options:{
							data:params
						}},
					lastAuto:true
				});
			}

	},toUserPage:function() {
		var $m = $(this);
		var userId = $m.attr('data-userId');
		if(userId != null && userId != ''){
			var params = {userId:userId};
			viewJs.navigator.next({
					next:{url:'./u.html', id:'u',
						options:{
							data:params
						}},
					lastAuto:true
				});
		}
	},toUseService:function(){
		viewJs.dialogPop('<p>确定服务已完成？</p><div class="vct">请确认已于服务方约好服务事宜，避免不必要的损失。</div>',
			function(isOk){
				if(isOk){
					var params = mainJs.parseUrlSearch();
					dmJs.confirmService(params.serviceOwnID, function(){	
						location.reload();
					});
				}
			}
		);
	},getServiceOwnByID:function(){
		var me = buyorderDetailJs;
		var params = mainJs.parseUrlSearch();
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null){
			dmJs.sStore.toLogin({
				url:'./buyorderDetail.html'
			});
			return;
		}

		params.accessToken = currentUser.accessToken;
		var type = params.type = params.userType || '1';

		dmJs._ajax({
			id:'getServiceOwnByID',
			url:'/urming_quan/service/getServiceOwnByID',
			params:params,
			accessInvalid:function(){
				dmJs.sStore.toLogin({
					url:'./buyorderDetail.html'
				});
			},
			callback:function(data){
               // console.log(data)
				data.userType = type;
				me.initOrderDetails(data);
			}
		});
	},initOrderDetails:function(data){
        //console.log(data)
        var $p = $.mobile.activePage;
		var me = buyorderDetailJs;
		var serviceOwn = data.serviceOwn;
		var code = serviceOwn.code;
		var status = serviceOwn.status;
		var orderUser = serviceOwn.userByUserId;
		var svr = serviceOwn.serviceVersion;
		var svrUser = svr.userByUserId;
        var serviceId = serviceOwn.service.id;
        var catId = svr.category.category.id;
        var pubTime = serviceOwn.creTime.split(' ')[0].replace(/-/g,'/');
        var price = serviceOwn.unitPrice;
        var num = serviceOwn.num;
        var total = serviceOwn.price;
        //fsk
        var picFn = null;
        var fnArr = [mainJs.getSvrPicUrl,mainJs.getFunPicUrl,mainJs.getActPicUrl,mainJs.getCoursPicUrl];
        var catName = null,
            className = null;
        switch(catId){
            case 1:
                picFn = fnArr[0];
                catName = '服务';
                className = 'service';
                break;
            case 3:
                picFn = fnArr[3];
                catName = '课程';
                className = 'course';
                break;
            case 4:
                picFn = fnArr[2];
                catName = '活动';
                className = 'active';
                break;
            case 8:
                picFn = fnArr[1];
                catName = '融资';
                className = 'funding';
                break;
        }

        var $p = $.mobile.activePage;
		var userType = mainJs.parseUrlSearch().userType;

        var coonnectText = userType == 1 ?  '联系卖家' : '联系买家';
		var cunterparties;
		if(userType == 1){
			cunterparties = svrUser;
		} else {
			cunterparties = orderUser;
		}
        if(userType ==1){
            user = cunterparties;
            var connect = '联系卖家';
            var connectType,connectContent;
            switch(serviceOwn.serviceVersion.contactType){
                case 0:
                    connectType = '0';
                    connectContent = serviceOwn.serviceVersion.contactContent;
                    break;
                case 1:
                    connectType = '1';
                    connectContent = serviceOwn.serviceVersion.contactContent;
                    break;
                case 2:
                    connectType = '2';
                    connectContent = serviceOwn.serviceVersion.contactContent;
                    break;
                case -1:
                    connectContent = '卖家没有留下联系方式'
                    break;
            }
        }else{
            user = orderUser;
            var connect = '联系买家';
            connectType = '0';
            connectContent = user.contactPhone;
        }


        $p.find('.connect').html(coonnectText).attr({'con_type':connectType,'content':connectContent})
        $p.find('.user-info img').attr('src',mainJs.getProfilePicUrl({url:cunterparties.profileImageUrl, sex: cunterparties.sex}))
        $p.find('.user-info span').html(cunterparties.realname)
        $p.find('.user-info').attr('data-userid',cunterparties.id)
        $p.find('.order-dec img').attr('src',picFn({url:svr.picUrl,size:2}))
        $p.find('.order-dec').attr('data-svrid',serviceId)
        $p.find('.order-dec').attr('data-service-own-id',serviceOwn.id)
        $p.find('.order-dec').attr('actId',catId)
        $p.find('.pay-order').attr('actId',catId)
        $p.find('.order-title').html(svr.serviceName)
        $p.find('.pub-time').html(pubTime)
        $p.find('.price').html('￥'+ price)
        $p.find('.num').html('x'+ num)
        $p.find('.price_detail').html('共'+ num +'件商品，合计：'+ total +'元')
        $p.find('.order-code span').html(code)
        $p.find('.cre-time span').html(serviceOwn.creTime)
        $p.find('.service-dec .title span').html(catName)
        $p.find('.service-dec p').html(me.typesetting(serviceOwn.serviceVersion.serviceDesc)  )
        $p.find('.typeTag').addClass(className).html(catName)

        if(serviceOwn.status ==-3 && mainJs.parseUrlSearch().userType ==1){
            $p.find('.del-order').attr('data-servicecartid',serviceOwn.serviceCart.id).show()
        }


        //console.log(status)
		//var $sec2 = $p.find('#customer-info .sec2').attr('status', status);
		/*if(status == 1){
            $('.order-status').addClass('topay')
		} else if(status == 5){
			$sec2.html(['<a class="btn1 disable">已退款</a>'].join(''));
		}else */if(status == -2||status ==-1){
            $p.find('.order-status').addClass('cancleorder')
            $p.find('.state-text').html('交易已取消')
			//$sec2.html(['<a class="btn1 disable">等待买家使用</a>'].join(''));
		}else if(status == 1||status == 9){
            $('.order-status').addClass('todeal')
            $p.find('.state-text').html('等待买家确认')
        }else if(status == -3){
            $('.order-status').addClass('topay')
            $p.find('.state-text').html('等待买家付款')
            if(mainJs.parseUrlSearch().userType ==1) $p.find('.last-time').show();

            var time0 = new Date(Date.parse(serviceOwn.creTime.replace(/-/g, "/")))//.getTime();

            lastTime()
            var timer = setInterval(function(){
                lastTime()
            },1000)

            function lastTime(){
                var  nowTime = new Date().getTime();
                var distance = parseInt((time0-nowTime)/1000) + 45*60;
                var min = parseInt(distance/60)>9? parseInt(distance/60):'0' + parseInt(distance/60),
                    sec = distance%60>9?distance%60:'0'+distance%60;
                $p.find('.last-time time').html(min +':'+ sec)
                if(distance<=0){
                    clearInterval(timer);
                    this.getServiceOwnByID();
                }
            }


        }else{
            $('.order-status').addClass('done')
            $p.find('.state-text').html('交易成功')
        }
        var info = {};
        switch(status){
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
                info.sure =mainJs.parseUrlSearch().userType ==2? ' ':'再次购买';
                break;
            case -1:
                info.paystate = '已关闭';
                info.sure =mainJs.parseUrlSearch().userType ==2? ' ':'再次购买';
                break;

        }
        $p.find('.pay-state').html(info.paystate)
        $p.find('.pay-order').html(info.sure)
        var item = $p.find('.pay-order');
        $(item).data('data-params',serviceOwn)
        $(item).show()
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
        if(mainJs.parseUrlSearch().userType ==2){
            $p.find('.order-list li').addClass('sale')
            $p.find('.order-list .sale [disable]').hide()
        }

	},typesetting:function(str){
		if(str == null){
			return '';
		}
		return '&nbsp;&nbsp;&nbsp;'+(str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
	},orderStatus:{
		1:'未确认',
		5:'已退款',
		7:'待评价',
		8:'已评价',
		9:'等待买家确认',
		11:'待评价',
		12:'已评价'
	},actionStatus:{
		1:'确认支付',
		7:'去评价',
		11:'去评价'
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
	}
};