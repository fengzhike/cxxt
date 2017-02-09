teacherdayReceiveSuccJs = {
	init:function(){
		this.toggleEvents(true);
		this.initPage();
	},initPage:function(){
		var params = mainJs.parseUrlSearch();
		var me = teacherdayReceiveSuccJs;
		$.ajaxSetup({
			async : false
		});
		$('.spinner').show();
		$('#maskLoadingMore').show();
		var activity = 0;
		if(typeof (params.activity) != "undefined"){
			activity = params.activity;
		}
		$.get(mainJs.getApiUrl('/urming_quan/user/receiveTeacherday'), {'accessToken':dmJs.sStore.getUserInfo().accessToken,teacherdayID:params.teacherdayID,secretKey:params.secretKey,activity:activity}, function(data){
			var status = $.parseJSON(data).status;
			$('.spinner').hide();
			$('#maskLoadingMore').hide();
			if (status == 'suc'){
				viewJs.dialogPop('您已领取成功，去查看！',function(ret){
					if(ret){
						me.toSearchResult();
					}
				},'提示',{
					onlyBtnOk:true
				})
				return;
			}else{
				viewJs.dialogPop('您已领取过该金币，去查看！',function(ret){
					if(ret){
						me.toSearchResult();
					}
				},'提示',{
					onlyBtnOk:true
				})
			}

		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = teacherdayReceiveSuccJs;
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
	},toSearchResult:function(){
		var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0,
			"searchKind":"course","catId":"3",
			"categoryParentId":"3","virtualcurr":"true",
			longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude
		};
		viewJs.navigator.next({
			next: {
				id: 'services',
				url: './searchResult.html',
				options: {
					data: params
				}
			}, last: {
				id: 'courseTypes',
				url: './courseTypes.html'
			}
		});
	}
};
