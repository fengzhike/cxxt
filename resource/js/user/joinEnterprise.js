var joinEnterpriseJs = {
	initData:function(){
		var $p = $.mobile.activePage;
		var me = joinEnterpriseJs;
		var user = dmJs.sStore.getUserInfo();
		if(user == null){
			dmJs.sStore.toLogin();
			return;
		}
		$p.find(".footer-bar").hide();
		var params = mainJs.parseUrlSearch();
		params.accessToken = dmJs.getAccessToken();

		if(params.isGroup=="1"){
			$p.find(".type").html("团队");
		}else{
			$p.find(".type").html("师资");
		}
		dmJs._ajax({
			method:'POST',
			id:'getTeacherInviteDetail',
			params:params,
			url:'/urming_quan/user/'+(params.isGroup=="1"?"getGroupInviteDetail":"getTeacherInviteDetail"),
			callback:me.initJoinEnterprise
		});
	},
	init:function(){
		this.initData();
		this.toggleEvents(true);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = joinEnterpriseJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide',me.destroy);
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.svrUserInfo','vclick', me.toUserInfo);
				$p.delegate('.v-tab','vclick', me.submit);
			}, 500);
		}
	},submit:function(){
		var $p = $.mobile.activePage;
		var me = joinEnterpriseJs;
		var action = $(this).data("action");
		var params = mainJs.parseUrlSearch();
		params.accessToken = dmJs.getAccessToken();
		if($(this).is('.disable')){
			return;
		}
		if(params.isGroup=="1"){
			action = action.replace("Teacher","Group");
		}
		dmJs._ajax({
			method:'POST',
			id:action,
			params:params,
			url:'/urming_quan/user/'+action,
			callback:function(){
				if(action.indexOf("agree")>-1){
					viewJs.dialogPop('您已经同意公众号邀请！',function(ret){
						if(ret){
							$p.find('.svrUserTages').html("成员："+(1*$p.find('.svrUserTages').data("count")+1)+"人");
							$p.find('.v-tab').css("background-color","#DDD");
							$p.find('.v-tab').css("color","#ccc");
							$p.find('.v-tab').addClass("disable");
						}
					},'提示',{
						onlyBtnOk:true
					})
				}else if(action.indexOf("reject") > -1){
					viewJs.dialogPop('您已经拒绝公众号邀请！',function(ret){
						if(ret){
							$p.find('.v-tab').css("background-color","#DDD");
							$p.find('.v-tab').css("color","#ccc");
							$p.find('.v-tab').addClass("disable");
						}
					},'提示',{
						onlyBtnOk:true
					})
				}
			}
		});
	},initJoinEnterprise:function(data){
		var $p = $.mobile.activePage;
		var params = mainJs.parseUrlSearch();
		var user = dmJs.sStore.getUserInfo();
		var userInfo = user.user;
		$p.find('.userInfoName').html(userInfo.realname);
		var institutionUser;
		if(params.isGroup=="1"){
			institutionUser = data.data.groupUser;
		}else{
			institutionUser = data.data.institutionUser;
		}
		$p.find('.userName').html(institutionUser.realname);
		$p.find('.svrUserInfo').data("userId",institutionUser.id);
		$p.find('.invitecontent').html(data.data.invitecontent);
		$p.find('.svrUserInfo img').attr('src', mainJs.getProfilePicUrl({url:institutionUser.profileImageUrl,sex:1}));
		var rankStr = "";
		for(var i=0;i<parseInt((institutionUser.rank-1)/5);i++){
			rankStr+='<img src="resource/images/icon_diamond_img.png"/>';
		}
		for(var i=0;i<parseInt((institutionUser.rank-1)%5);i++){
			rankStr+='<img src="resource/images/icon_star_img.png"/>';
		}
		$p.find('.user-rank').html(rankStr);
		$p.find('.svrUserTages').html("成员："+(params.isGroup=="1"?data.groupCount:data.teacherCount)+"人");
		$p.find('.svrUserTages').data("count",params.isGroup=="1"?data.groupCount:data.teacherCount)
		if(data.data.status!=0){
			$p.find('.v-tab').css("background-color","#DDD");
			$p.find('.v-tab').css("color","#ccc");
			$p.find('.v-tab').addClass("disable");
		}
	},toUserInfo:function(){
		var $el = $(this),userId = $el.data('userId');
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