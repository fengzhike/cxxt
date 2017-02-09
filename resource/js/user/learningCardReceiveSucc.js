learningCardReceiveSuccJs = {
	init:function(){
		this.toggleEvents(true);
		this.initPage();
	},initPage:function(){
		$("#learningCardReceive").parent().parent().css("font-size",'16px');//兼容
		$("#learningCardReceiveSucc").parent().parent().css("font-size",'16px');//兼容
		var params = mainJs.parseUrlSearch();
		var me = learningCardReceiveSuccJs;
		$.ajaxSetup({
			async : false
		});
		$('.spinner').show();
		$('#maskLoadingMore').show();
		var activity = 0;
		if(typeof (params.activity) != "undefined"){
			activity = params.activity;
		}
		$.get(mainJs.getApiUrl('/urming_quan/user/receiveLearningCard'), {'accessToken':dmJs.sStore.getUserInfo().accessToken,learningCardID:params.learningCardID,secretKey:params.secretKey}, function(data){
			var r = $.parseJSON(data);
			var status = r.status;
			$('.spinner').hide();
			$('#maskLoadingMore').hide();
			if (status == 'suc'){
				viewJs.dialogPop('您已领取成功，去查看！',function(ret){
					if(ret){
						me.toMyOrders();
					}
				},'提示',{
					onlyBtnOk:true
				})
				return;
			}else{
				var msgs = dmJs.i18n.getMsgs('msg_api');
				if(r.error_code == 20705){
					viewJs.dialogPop('您已领取过该听课证，请登录创新学堂查看',function(ret){
						if(ret){
							me.toMyOrders();
						}
					},'提示',{
						onlyBtnOk:true
					})
				}else{
					viewJs.dialogPop(msgs[r.error_code] || r.error,function(ret){
						if(ret){
							me.toMyOrders();
						}
					},'提示',{
						onlyBtnOk:true
					})
				}

			}

		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = learningCardReceiveSuccJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
			}, 500);
		}
	},toMine:function(){
		viewJs.navigator.next({
			next:{url:'./mine.html',id:'mine'}
		});
	},toMyOrders:function(){
		var params = {tab: 'review', catId: '3'};
		viewJs.navigator.next({
			next: {
				id: 'myOrders',
				url: './myOrders.html',
				options: {
					data: params
				}
			}, last: {
				id: 'mine',
				url: './mine.html'
			}
		});
	}
};
