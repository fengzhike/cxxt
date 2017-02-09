submitOrderJs = {
    MAX_ORDER_COUNT:999,
	MIN_ORDER_COUNT:1,
	init:function(){
		var $p = $.mobile.activePage;
		var params = mainJs.parseUrlSearch();
        this.clearAdd(params);
        var price = Number(params.price).toFixed(2);
		$('#orderSvrName').html(params.serviceName);
		$('#orderUnitPrice>span').html(price);
		$('#orderNum').val(1);
		this.onOrderNumchange();
        if(price == 0 || params.catId==3){
            $('#orderReduceBtn,#orderAddBtn').addClass('disable');
            $('#orderNum').attr('readonly','');
        }
		if(params.catId==8){
			this.MAX_ORDER_COUNT = 999999999999;
			if(params.minSingleSaleCount || params.maxSingleSaleCount){
				$p.find(".vItemTable").show();
			}
		}else{
			$("#isAnonymous").parent().parent().css("height","0px");
		}
		if(params.minSingleSaleCount){
			this.MIN_ORDER_COUNT = params.minSingleSaleCount;
			$('#orderNum').val(this.MIN_ORDER_COUNT);
			$p.find("#minSingleSaleCount .vTd").html(this.MIN_ORDER_COUNT+"股");
			$p.find("#minSingleSaleCount").show();
			this.onOrderNumchange();
		}else{
			$p.find("#minSingleSaleCount").remove();
		}
		if(params.maxSingleSaleCount){
			this.MAX_ORDER_COUNT = params.maxSingleSaleCount;
			$p.find("#maxSingleSaleCount .vTd").html(this.MAX_ORDER_COUNT+"股");
			$p.find("#maxSingleSaleCount").show();
		}else{
			$p.find("#maxSingleSaleCount").remove();
		}
		this.toggleEvents(true);
	},clearAdd:function(params){
        for(var attr in params){
            if(params[attr].indexOf('+')!= '-1'){
                var a = params[attr].split('+').join(' ');
                params[attr] = a;
            }
        }
        return params;
    }, toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = submitOrderJs;
		$p.undelegate();
		if(isBind){
			$p.on('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('#orderAddBtn:not(.disable)', 'vclick', me.orderAdd);
				$p.delegate('#orderReduceBtn:not(.disable)', 'vclick', me.orderReduce);
				$p.delegate('#orderNum', 'input', me.onOrderNumInput);
				$p.delegate('#submitOrderBtn', 'vclick', me.submit);
			}, 500);
		}
	},submit:function(){
		var me = submitOrderJs;
		var currentUser = dmJs.sStore.getUserInfo();
		var params = mainJs.parseUrlSearch();
		if(currentUser == null){
			dmJs.sStore.toLogin({url:'./service.html', options:{data:{serviceID:params.serviceID}}});
		} else {
			params.buyNumber = Number($.trim($('#orderNum').val()));
            if(params.buyNumber < 1){
                viewJs.showPopMsg('请输入数量');
                return;
            }
			params.isAnonymous = ($("#isAnonymous") && $("#isAnonymous").is(':checked'))?1:0;
			me.order(params, function(ret){
			    params.accessToken = null;
                params.serviceCartID = ret.serviceCartID;
				if(typeof WeixinJSBridge != "undefined"){//weixin
					window.location.href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3b462eee381207f3&redirect_uri=http%3A%2F%2Fm.edu.euming.com%2FconfirmOrder.html%3F'+escape($.param(params))+'&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
					return;
				}
				var last = {
					url:'./service.html', id:'service',
					options:{data:{serviceID:params.serviceID}}
				};
				if(params.catId==3){
					last = {
						url:'./course.html', id:'course',
						options:{data:{serviceID:params.serviceID}}
					};
				}else if(params.catId==8){
					last = {
						url:'./funding.html', id:'funding',
						options:{data:{serviceID:params.serviceID}}
					};
				}
				viewJs.navigator.next({
					next:{url:'./confirmOrder.html', id:'confirmOrder',
						options:{
							data:params
						}},
					last:last,
					lastAuto:false
				});
			});
		}
	},onOrderNumInput:function(){
		var $el = $(this),val;
		var params = mainJs.parseUrlSearch();
		var min = submitOrderJs.MIN_ORDER_COUNT,max = submitOrderJs.MAX_ORDER_COUNT;
		var me = submitOrderJs;
		val = $.trim($el.val());
		val = val.replace(/\D/g, '');
		val = val.replace(/^0{2,}/, 0);
		$el.siblings('.elTip').remove();
		if(val != ''){
			val = Number(val);
			if(val > max){
				val = max;
				viewJs.showPopTip({el:'#changeOrderCount',msg:'最大订单数'+ min});
			} else if(val < min){
				val = min;
				viewJs.showPopTip({el:'#changeOrderCount',msg:'最小订单数'+max});
			}
		}
		$el.val(val);
		me.onOrderNumchange();
},onOrderNumchange:function(){
	var val = Number($('#orderNum').val());
	if(val <= submitOrderJs.MIN_ORDER_COUNT){
		$('#orderReduceBtn').addClass('disable');
	} else {
		$('#orderReduceBtn').removeClass('disable');
	}
	if(val >= submitOrderJs.MAX_ORDER_COUNT){
		$('#orderAddBtn').addClass('disable');
	} else {
		$('#orderAddBtn').removeClass('disable');
	}
	$('#orderTotalPrice').html('￥'+(Number(val)*Number($('#orderUnitPrice>span').html())).toFixed(2));
},orderAdd:function(){
	var me = submitOrderJs;
	var $a = $('#orderNum');
	var val = Number($a.val());
	if(val < submitOrderJs.MAX_ORDER_COUNT){
		$a.val(val+1);
		me.onOrderNumchange();
	}
},orderReduce:function(){
	var me = submitOrderJs;
	var $a = $('#orderNum'), val;
	val = Number($a.val());
	if(val > submitOrderJs.MIN_ORDER_COUNT){
		$a.val(val- 1);
		me.onOrderNumchange();
	}
	},order:function(params, callback){
		var url = mainJs.getApiUrl('/urming_quan/service/order');
		var currentUser = dmJs.sStore.getUserInfo();
		params.accessToken = currentUser.accessToken;
		//hw
		params.random = Math.random();//避免缓冲
		//hw
		// dmJs.sStore.remove('order');
		$.get(url, params, function(data){
			var res = $.parseJSON(data);
			if(res.error != null){
				var accessInvalid = dmJs.sStore.accessInvalid(res);
				if(accessInvalid){
					var serviceID = params.serviceID;
					if(serviceID == null){
						dmJs.sStore.toLogin({url:'./'});
					} else {
						dmJs.sStore.toLogin({url:'./service.html',options:{data:{serviceID:serviceID}}});
					}
					return;
				}
				viewJs.showApiError(res);
				return;
			}
//			dmJs.sStore.save('order', {ret:res, params:params});

			if($.isFunction(callback)){
				callback(res);
			}
		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});
	}
}