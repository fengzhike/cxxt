teacherdayReceiveJs = {
	init:function(){
		this.toggleEvents(true);
		this.initPage();
	},initPage:function(){
		$(".ui-footer").remove();
		var params = mainJs.parseUrlSearch();
		var teacherday;
		if(typeof (params.activity) != "undefined"){
			switch (params.activity){
				case '0':
					$("#teacherdayReceive").css("background-image","url(resource/images/teacherday/bg.jpg)");
					break;
				case '1':
					$("#teacherdayReceive").css("background-image","url(resource/images/teacherday/bg1.jpg)");
					$(".vbt.submit").css("background-color","#51a2e6");
					break;
			}
		}else{
			$("#teacherdayReceive").css("background-image","url(resource/images/teacherday/bg.jpg)");
		}
		$.ajaxSetup({
			async : false
		});
		$.get(mainJs.getApiUrl('/urming_quan/user/getTeacherday'), {teacherdayID:params.teacherdayID,secretKey:params.secretKey}, function(data){
			teacherday = $.parseJSON(data).teacherday;
			$(".teachername").html(teacherday.teachername);
			$(".bless").html(teacherday.content);
			$(".wxname").html(teacherday.username);
			if(teacherday.teachername.indexOf('老师')>0  || typeof (params.activity) == "undefined" || params.activity != 0){
				$(".teacher").hide();
			}
		}).error(function(){
			viewJs.showPopMsg('网络错误');
		});
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = teacherdayReceiveJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.vbt.submit', 'vclick', me.submit);
				$p.delegate('.footer > span:nth-child(1)', 'vclick', me.teacherdayExplain);
			}, 500);
		}
	},submit:function(){
		$('.spinner').show();
		$('#maskLoadingMore').show();
		var params = mainJs.parseUrlSearch();
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger"){//weixin
			var t = dmJs.sStore;
			var r = mainJs.getApiUrl("/urming_quan/user/loginByWechatCode");
			var e= {};
			e.systemType = "Pkuie";
			e.wechatCode = params.code;
			var next = {url:'./teacherdayReceiveSucc.html', id:'teacherdayReceiveSucc', options:{data:params}};
			$.post(r, e,
				function(e) {
					var r = $.parseJSON(e);
					if (null != r.error) return void viewJs.showApiError(r);
					if(typeof r.tempToken != "undefined"){
						dmJs.sStore.save("tempToken",r.tempToken);
						dmJs.sStore.save("nickname",r.nickname);
						t.saveSuccessTo(next);
						viewJs.navigator.next({
							next:{url:'./loginWx.html', id:'loginWx'}
						});
					}else{
						t.saveLoginInfo(r);
						viewJs.afterToggleLogin();
						viewJs.navigator.next({
							next: next
						})
					}
				}).error(function() {
					viewJs.showPopMsg("网络错误")
				})
		}else{
			alert("请在微信环境中打开!");
		}
	},teacherdayExplain:function() {
		viewJs.navigator.next({
			next: {
				url: "./teacherdayExplain.html",
				id: "teacherdayExplain",
				options: {data: mainJs.parseUrlSearch()}
			}, last: {
				url: './teacherdayReceive.html', id: 'teacherdayReceive',
				options: {data: mainJs.parseUrlSearch()}
			}
		});
	}
};
