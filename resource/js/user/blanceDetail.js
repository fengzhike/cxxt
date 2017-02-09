blanceDetailJs = {
	init:function(){
		if(!this.preInit()){
			return;
		}
		var $p = $.mobile.activePage;
		this.toggleEvents(true);
		this.fetchData();
	},preInit:function(){
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
		var me = blanceDetailJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				//$p.delegate('[action]', 'vclick', me.doAction);
			}, 500);
			
		}
	},fetchData:function(params){
		var me = blanceDetailJs;	
		var param = mainJs.parseUrlSearch();
		me.showBalanceDetail(param);
	},doAction:function(){
		var me = blanceDetailJs;
		var $el = $(this);
		var param = mainJs.parseUrlSearch($el.attr('param'));
		var action = $el.attr('action');
		var next;
		switch(action){
			case 'orderDetail':
				next = {id:'buyorderDetail',url:'./buyorderDetail.html',options:{data:param}};
			 break;
		}
		if(next && $(this).attr('catid')!=6){
			viewJs.navigator.next({lastAuto:true,next:next});
		}
	},showBalanceDetail:function(param){
		var me = blanceDetailJs;
		// me.toggleEvents();
		param.accessToken = dmJs.getAccessToken();
		dmJs._ajax({
			id:'getSubBranch',
			method:'POST',
			url:'/urming_quan/user/getBalanceDetailById',
			params:param,
			callback:me.parseBalanceDetail
		});
	},parseBalanceDetail:function(data){
        console.log(data)
        if(!data.charge){
            data.charge ='0';
        }
        if(!data.totalMoney){
            data.totalMoney =data.money;
        }

		var $p = $.mobile.activePage;
		data.picUrl = mainJs.getSvrPicUrl({size:2,url:data.picUrl});
		data.id = "balanceDetailDlg";
		$('#balanceDetailDlg').remove();
		var html = $('#blanceDetail-tpl').text().replace(/_tpl-[^<>\s"]*/g, function(w){
			return data[w.substring(5)]
		});
		$p.find('.ui-content').html(html);
       // $p.find('[action="orderDetail"]').attr('catid',data.category.category.id)
        $p.find('[action="orderDetail"]').removeClass('arrow-right-margin');



	}
};