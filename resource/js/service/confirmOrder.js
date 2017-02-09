confirmOrderJs = {
	init:function(){
		this.toggleEvents(true);
		this.initPayPage();
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = confirmOrderJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('#payByBalance', 'vclick', me.onBalanceCheckboxchange);
				$p.delegate('#payByVirtualcurr', 'vclick', me.onVirtualcurrCheckboxchange);
				$p.delegate('#toPayBtn', 'vclick', me.toPay);
				$p.delegate('.service', 'vclick', me.toServiceDetail);
				$p.delegate('.payType', 'vclick', me.payTypeClick);
				$p.delegate('#scholarshipPay', 'vclick', me.selectScholarship);
			}, 500);
		}
	},clearAdd:function(params){
        for(var attr in params){
            if(params[attr].indexOf('+')!= '-1'){
                var a = params[attr].split('+').join(' ');
                params[attr] = a;
            }
        }
        return params;
    },toServiceDetail:function(){
		var $m = $(this);
		var serviceID = $m.attr('data-serviceID');
		if(serviceID != null && serviceID != ''){	
			var params = {serviceID:serviceID};
			if($m.is('.isMine')){
				params.isMine = true;
			}
			viewJs.navigator.next({
					next:{url:'./service.html', id:'service',
						options:{
							data:params
						}},
					lastAuto:true
				});
		}
	},toPay:function(){
        var _self = arguments.callee;
        if(_self.busy){
            return;
        }
        _self.busy = true;
        setTimeout(function(){ _self.busy = false;},700);
		var me = confirmOrderJs;
		var payNeedOtherWay = $('#payNeedOtherWay');
		var payType = null;
		if(payNeedOtherWay.is(':hidden')){
			// 使用余额支付
			if($('#payByBalance').is('.selected')){
				payType = 'balance';
				me.paySvr({payType:payType,useBalance:0});
			}else{
				payType = 'virtualcurr';
				me.paySvr({payType:payType,useBalance:0});
			}
		} else {
			var useBalance = 0;
			if($('#payByBalance').is('.selected')){
				useBalance = $('#userPayBalance > span').html();
			}
			if(payNeedOtherWay.find('.payType.alipaywap.vRadio').is('.selected')){
				payType = 'alipayWap';
			} else if(payNeedOtherWay.find('.payType.union.vRadio').is('.selected')){
				payType = 'union';
				viewJs.loadJs([{varName:'Base64', url:'/js/base64.js'},
					{varName:'unionSupport', url:'/js/unionSupport.js?v=20140612-1'}],{success:function(){
						me.paySvr({payType:payType,useBalance:useBalance});
					}});
				return;
			}else if(payNeedOtherWay.find('.payType.WxPay.vRadio').is('.selected')){
				payType = 'WxPay';
			}else if(payNeedOtherWay.find('.payType.scholarshipPay.vRadio').is('.selected')){
				if($('#payByBalance').is('.selected')){
					viewJs.showPopMsg('奖学金不支持混合支付！');
					return;
				}
				payType = 'scholarshipPay';
			}
			me.paySvr({payType:payType,useBalance:useBalance});
		}
	},paySvr:function(options){
		var orderInfo = mainJs.parseUrlSearch();
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser== null){
			dmJs.sStore.toLogin();
			return;
		}
		var params = {};
		var accessToken = currentUser.accessToken;
		var serviceCartID =  orderInfo.serviceCartID;
		params.accessToken = accessToken;
		params.serviceCartID = serviceCartID;
		params.price = orderInfo.price;
		params.catId = orderInfo.catId;
		var initParam = mainJs.parseUrlSearch();
        var paysSuccess = {id:'paySuccess',url:'./paySuccess.html',options:{data:initParam}};
        var myOrders = {id:'buyorder',url:'./buyorder.html',options:{data:{type:0,userType:1}}};
		if(options.payType == 'balance'){
			// 使用余额支付
			var url = mainJs.getApiUrl('/urming_quan/service/buySuc');
			$.get(url, params, function(data){
				var res = $.parseJSON(data);
				var accessInvalid = dmJs.sStore.accessInvalid(res);
				if(accessInvalid){
					dmJs.sStore.toLogin({url:'./confirmOrder.html'});
					return;
				} else if(res.error != null){
					if( res.error_code =='20227'){
						viewJs.showPopMsg('重复支付');
						viewJs.navigator.next({
							next:{url:'./service.html', id:'service',options:{
								data:{serviceID:orderInfo.serviceID}
							}}
						});
						return;
					}
					viewJs.showApiError(res);
					return;
				}
				if(params.catId==6){
					viewJs.navigator.pre();
				}else{
					viewJs.navigator.next({next:paysSuccess});
				}
//				if(initParam.lastAuto){
//                    viewJs.navigator.next({next:paysSuccess});
////					viewJs.navigator.pre();
//				} else {
//					viewJs.afterConfirmFinishPay({serviceID:orderInfo.serviceID,next:paysSuccess});
//				}
				
			}).error(function(){
				console.log(arguments);
				viewJs.showPopMsg('网络错误');
			});
		} else if(options.payType == 'alipayWap'){
            console.log(111)
			var url = mainJs.getApiUrl('/urming_quan/service/buyByAlipayWap');
			params.useBalance = options.useBalance;
			if(initParam.lastAuto){
				viewJs.showConfirmFinishPay(null,function(){
					if(params.catId==6){
						viewJs.navigator.pre();
					}else{
						viewJs.navigator.next({next:myOrders});
					}
				}, function(){
                    viewJs.navigator.pre();
                });
			} else {
				viewJs.showConfirmFinishPay(null,function(){
					if(params.catId==6){
						viewJs.navigator.pre();
					}else{
						viewJs.navigator.next({next:myOrders});
					}
                }, function(){
                    viewJs.navigator.pre();
                });
			}
			// viewJs.showConfirmFinishPay({serviceID:order.params.serviceID});
			window.open(url+'?'+$.param(params));
            //window.location.href = url+'?'+$.param(params);
			return;
		} else if(options.payType == 'union'){
			params.useBalance = options.useBalance;
			viewJs.maskBusy('生成订单流水号', 'unionpay');
			var url = mainJs.getApiUrl('/urming_quan/service/buyByUnionpay');
			$.get(url, params, function(data){
				viewJs.hideBusyMask('unionpay');
				var res = $.parseJSON(data);
				var accessInvalid = dmJs.sStore.accessInvalid(res);
				if(accessInvalid){
					dmJs.sStore.toLogin({url:'./confirmOrder.html'});
					return;
				} else if(res.error != null){
					viewJs.showApiError(res);
					return;
				}
				viewJs.showUnionPay(res, function(){
					if(params.catId==6){
						viewJs.navigator.pre();
					}else{
						viewJs.navigator.next({next:myOrders});
					}
                });
			}).error(function(){
				viewJs.hideBusyMask('unionpay');
				console.log(arguments);
				viewJs.showPopMsg('网络错误');
			});	
		}else if(options.payType == 'WxPay'){
			params.useBalance = options.useBalance;	
			$.ajax({
				type : "post",
				url : 'http://pkuie.euming.com/urming_pkuie/service/buyByWxPay',//send
				dateType : "json",
				async : false,
				data : 'code='+ getQueryString("code") 
					//+'&out_trade_no='+getQueryString("serviceCartID") //test
					+'&serviceCartID='+getQueryString("serviceCartID") 
					+'&accessToken='+params.accessToken
					+'&price='+getQueryString("price")
					+'&useBalance='+params.useBalance
					+'&project=Pkuie',
				success : function(data) {
					if (typeof WeixinJSBridge == "undefined"){
					   if( document.addEventListener ){
						   document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
					   }else if (document.attachEvent){
						   document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
						   document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
					   }
					}else{
					   var res=JSON.parse(data);
					   if(res.error != null){
							if( res.error_code =='20227'){
								viewJs.showPopMsg('重复支付');
								viewJs.navigator.next({
									next:{url:'./service.html', id:'service',options:{
										data:{serviceID:orderInfo.serviceID}
									}}
								});
								return;
							}
							viewJs.showApiError(res);
							return;
						}
					   onBridgeReady(res.appId,res.timeStamp,res.nonceStr,res.package,res.signType,res.paySign,myOrders);
					}
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					alert(XMLHttpRequest+textStatus+errorThrown);
				}
			});
			
			/*
			if(initParam.lastAuto){
				viewJs.showConfirmFinishPay(null,function(){
                    viewJs.navigator.next({next:myOrders});
				}, function(){
                    viewJs.navigator.pre();
                });
			} else {
				viewJs.showConfirmFinishPay(null,function(){
                    viewJs.navigator.next({next:myOrders});
                }, function(){
                    viewJs.navigator.pre();
                });
			}
			*/
			return;
		} else if(options.payType == 'scholarshipPay'){
			var $p = $.mobile.activePage;
			//var $selEl = $p.find('.payment-method .vRadioGrp .payType.vRadio.selected');
			var user = dmJs.sStore.getUserInfo();
			var form = {accessToken:user.accessToken};
			$('#recharge-form input:visible').each(function(index, item){
				form[item.name] = $.trim(item.value);
			});
			if(form.cardId == '' || form.cardId == null){
				viewJs.showPopMsg('充值卡号不能为空');
				return;
			}
			if(form.secretKey == '' || form.secretKey == null){
				viewJs.showPopMsg('充值密码不能为空');
				return;
			}
			form.serviceCartID = serviceCartID;
			dmJs._ajax({
				method:'POST',
				maskText:'充值中..',
				id:'recharge',
				params:form,
				url:'/urming_quan/user/rechargeCourseByCard',
				callback:function(ret){
					var params = {
						tab:'review',
						catId:'3'
					};
					viewJs.navigator.next({
						next:{url:'./myOrders.html',id:'myOrders',options:{data:params}}
					});
				}
			});
		}else if(options.payType == 'virtualcurr'){
			dmJs._ajax({
				method:'POST',
				maskText:'充值中..',
				id:'recharge',
				params:params,
				url:'/urming_quan/user/buyByVirtualcurr',
				callback:function(ret){
					var params = {
						tab:'review',
						catId:'3'
					};
					viewJs.navigator.next({
						next:{url:'./myOrders.html',id:'myOrders',options:{data:params}}
					});
				}
			});
		}
	},onBalanceCheckboxchange:function(){
		var $b = $('#payByBalance');
		var totalCost = Number($('#payTotalCost>span').html());
		var balance = Number($('#userPayBalance>span').html());
		var payNeedOtherWay = $('#payNeedOtherWay');
		$b.toggleClass('selected');
		if($b.is('.selected')){
			$('#payByVirtualcurr').removeClass('selected');
			var diff = totalCost- balance;
			if(diff <= 0){
				$('#payNeed>span').html(viewJs.formatMoney(0));
				payNeedOtherWay.hide();
			} else {
				$('#payNeed>span').html(viewJs.formatMoney(diff));
				payNeedOtherWay.show();
			}
		} else {
			$('#payNeed>span').html(viewJs.formatMoney(totalCost));
			payNeedOtherWay.show();
		}
	},onVirtualcurrCheckboxchange:function(){
		var $b = $('#payByVirtualcurr');
		var totalCost = Number($('#payTotalCost>span').html());
		var balance = Number($('#userPayVirtualcurr>span').html());
		var payNeedOtherWay = $('#payNeedOtherWay');
		$b.toggleClass('selected');
		if($b.is('.selected')){
			$('#payByBalance').removeClass('selected');
			var diff = totalCost- balance;
			if(diff <= 0){
				$('#payNeed>span').html(viewJs.formatMoney(0));
				payNeedOtherWay.hide();
			} else {
				$b.removeClass('selected');
				viewJs.showPopMsg('金币不足！');
				//$('#payNeed>span').html(viewJs.formatMoney(diff));
				//payNeedOtherWay.show();
			}
		} else {
			$('#payNeed>span').html(viewJs.formatMoney(totalCost));
			payNeedOtherWay.show();
		}
	},selectScholarship:function(){
		$('#recharge-form').show();
	},payTypeClick:function(){
		$('#recharge-form').hide();
	},initPayPage:function(){
        var currentUser = dmJs.sStore.getUserInfo();
		 var orderInfo = mainJs.parseUrlSearch();
            var me = confirmOrderJs;
        orderInfo = me.clearAdd(orderInfo)
		 if(orderInfo != null){

             orderInfo.accessToken = currentUser.accessToken;
             var paramInit = {
                 accessToken:orderInfo.accessToken,
                 serviceCartID:orderInfo.serviceCartID
             }

             dmJs._ajax({
                 id:'getServiceCartByID',
                 params:paramInit,
                 url:'/urming_quan/service/getServiceCartByID',
                 callback:function(data1){
                     if(data1.serviceCart.status === 1){
                         $('#confirmOrder .toServiceDetail').attr('data-serviceID', orderInfo.serviceID);
                         dmJs.sStore.syncBalance(function(){
                             var totalCost = Number(orderInfo.buyNumber)*Number(orderInfo.price);
                             var balance = currentUser.user.balance;
                             var virtualcurr = currentUser.user.virtualcurr;
                             var useBalance = orderInfo.useBalance;
                             var bUseBalance;
                             if($.isNumeric(useBalance) && useBalance > 0){
                                 var validTime = orderInfo.validTime;
                                 if($.isNumeric(validTime)){
                                     validTime = Number(validTime);
                                 } else {
                                     validTime = null;
                                 }
                                 if(validTime && validTime > Date.now()){
                                     balance = Number(balance) + Number(useBalance);
                                 }
                                 bUseBalance = true;
                             }
                             $('#paySvrName').html(orderInfo.serviceName);
                             $('#confirmOrderUnitPrice>span').html(viewJs.formatMoney(orderInfo.price));
                             $('#payTotalNum>span').html(orderInfo.buyNumber);

                             $('#userPayBalance>span').html(balance);
                             $('#userPayVirtualcurr>span').html(virtualcurr);
                             $('#payTotalCost>span').html(viewJs.formatMoney(totalCost));
                             var $pw = $('#payNeedOtherWay');
                             if(orderInfo.price <= 0  ){
                                 $('#payByBalance').addClass( "selected" );
                                 $pw.hide();
                             } else{
                                 $('#payByBalance').removeClass( "selected" );
                                 $pw.show();
                             }
                             if(orderInfo.isvirtualcurr == 'true'){
                                 $(".virtualcurr").show();
                             }
                             //$pw.find('.payType.alipaywap.vRadio').addClass('selected');
                             //$pw.find('.payType.union.vRadio').removeClass('selected');
                             //hw
                             if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger") {
                                 $('#payNeedOtherWay').find('.payType.alipaywap.vRadio').hide();
                                 $('#payNeedOtherWay').find('.payType.WxPay.vRadio').addClass("selected");
                                 $pw.find('.payType.alipaywap.vRadio').removeClass('selected');
                             }else{
                                 $('#payNeedOtherWay').find('.payType.WxPay.vRadio').hide();
                                 $('#payNeedOtherWay').find('.payType.alipaywap.vRadio').addClass("selected");
                                 $pw.find('.payType.WxPay.vRadio').removeClass('selected');
                             }
                             if(orderInfo.catId!=3){
                                 $("#scholarshipPay").hide();
                             }
                             //hw
                             $('#payNeed>span').html(viewJs.formatMoney(totalCost));
                             if(bUseBalance){
//                    $('#payByBalance').addClass( "selected" );
                                 var me = confirmOrderJs;
                                 me.onBalanceCheckboxchange();
                             }
                         });

                     }else{
                         setTimeout(function(){
                             viewJs.navigator.next({
                                 next:{url:'./index.html', id:'startpage'},
                                 lastAuto:false
                             });
                         },200)
                     }
                 },error:function(){
                 }
             });

		 } else {
				console.log('order null');
		 }
	}
};

	function onBridgeReady(appId,timeStamp,nonceStr,packageString,signType,paySign,myOrders){
	   WeixinJSBridge.invoke(
		   'getBrandWCPayRequest', {
			   "appId" : appId,     //公众号名称，由商户传入      wxe1c5897aa5d978ac
			   "timeStamp": timeStamp,         //时间戳，自1970年以来的秒数     
			   "nonceStr" : nonceStr, //随机串     
			   "package" : packageString,
			   "signType" : signType,         //微信签名方式:     
			   "paySign" : paySign //微信签名 
		   },
		   function(res){
		   
			   if(res.err_msg == "get_brand_wcpay_request:ok" ) {
				   //if(initParam.lastAuto){
						viewJs.showConfirmFinishPay(null,function(){
							viewJs.navigator.next({next:myOrders});
						}, function(){
							viewJs.navigator.pre();
						});
					//} else {
					//	viewJs.showConfirmFinishPay(null,function(){
					//		viewJs.navigator.next({next:myOrders});
					//	}, function(){
					//		viewJs.navigator.pre();
					//	});
					//}
			   }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
			   else{
				   viewJs.showConfirmFinishPay(null,function(){
						viewJs.navigator.next({next:myOrders});
					}, function(){
						viewJs.navigator.pre();
					});
			   }
			  
		   }
	   ); 
	}
	function getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]); return null;
    }