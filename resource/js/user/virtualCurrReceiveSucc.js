virtualCurrReceiveSuccJs = {
	init:function(){
		this.toggleEvents(true);
		this.initPage();
	},initPage:function(){
		var params = mainJs.parseUrlSearch();
		var me = virtualCurrReceiveSuccJs;
		$('.spinner').show();
		$('#maskLoadingMore').show();
		$.get(mainJs.getApiUrl('/urming_quan/user/receiveVirtualCurr'), {'accessToken':dmJs.sStore.getUserInfo().accessToken,cardId:params.cardId,secretKey:params.secretKey}, function(data){
			var status = $.parseJSON(data).status;
			$('.spinner').hide();
			$('#maskLoadingMore').hide();
			if (status == 'suc'){
				/*
				viewJs.dialogPop('您已领取成功，去查看！',function(ret){
					if(ret){
						me.toSearchResult("您已领取成功，去查看！");
					}
				},'提示',{
					onlyBtnOk:true
				})
				*/
				me.toSearchResult("领取成功！");
				return;
			}else{
				/*
				viewJs.dialogPop('请勿重复领取！',function(ret){
					if(ret){
						me.toIndex("请勿重复领取！");
					}
				},'提示',{
					onlyBtnOk:true
				})
				*/
				me.toIndex("请勿重复领取！");
				return;
			}

		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = virtualCurrReceiveSuccJs;
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
	},toSearchResult:function(toast){
		var params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0,
			"searchKind":"course","catId":"3",
			"categoryParentId":"3","virtualcurr":"true","toast":toast,
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
	},toIndex:function(toast){
		var params = {"toast":toast};
		viewJs.navigator.next({next:{url:'./', id:'startpage',options: {data: params}}});
	}
};
