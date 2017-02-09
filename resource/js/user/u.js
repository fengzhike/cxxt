uJs = {
	init:function(){
		//hw
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
			$("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
				'<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
		}else{
			var user;
			if(!(user = viewJs.chkLogin())){
				return;
			}
		}
		//hw
		this.toggleEvents(true);
		this.initPage();
	},toggleEvents:function(isBind){
		var me = uJs;
		var $p = $.mobile.activePage;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	me.toggleEvents();});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.toUserServices','vclick', me.toUserServices);
				$p.delegate('.toUserWants','vclick', me.toUserWants);
				$p.delegate('.svrGrade.isBtn','vclick', me.toSvrReviewsDetail);
				$p.delegate('.want','vclick', me.toWantDetails);
				$p.delegate('.question','vclick', me.toQuestionDetails);
				$p.delegate('.service','vclick', me.toServiceDetail);
				$p.delegate('[action]','vclick', me.doAction);
                $p.delegate('.friendStBtn', 'vclick', me.bindFollow);
                $p.delegate('.join', 'vclick', me.join);
				$p.delegate('#teacherCtr-users', 'vclick', me.toMyTeachers);
				$p.delegate('.myEnterprise', 'vclick', me.toUserPage);
				//$p.delegate('.user-rank','vclick',me.openRankDescribe);
			},500);
		}
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
	},toWantDetails:function(){
		var $m = $(this);
		var wantID = $m.attr('data-wantID');
		if(wantID != null && wantID != ''){
			var params = {wantID:wantID};
			viewJs.navigator.next({
					next:{url:'./want.html', id:'want',
						options:{
							data:params
						}},
					lastAuto:true
				});
		}
	},toQuestionDetails:function(){
		var $m = $(this);
		var wantID = $m.attr('data-wantID');
		if(wantID != null && wantID != ''){
			var params = {wantID:wantID};
			viewJs.navigator.next({
				next:{url:'./question.html', id:'question',
					options:{
						data:params
					}},
				lastAuto:true
			});
		}
	},toUserWants:function(){
		var $m = $(this);
		var userId = $m.attr('data-userId');
		if(userId != null && userId != ''){
			var params = {userId:userId,offset:0, pageSize:20};
			viewJs.navigator.next({
					next:{url:'./moreWants.html', id:'moreWants',
						options:{
							data:params
						}},
					lastAuto:true
				});
		}
	},toUserServices:function(){
		var $m = $(this);
		var userId = $m.attr('data-userId');
		if(userId != null && userId != ''){
			var params = {userId:userId,offset:0, pageSize:20};
			viewJs.navigator.next({
					next:{url:'./moreServices.html', id:'moreServices',
						options:{
							data:params
						}},
					lastAuto:true
				});
		}
	},initPage:function(){
		var params = mainJs.parseUrlSearch();
		if($.trim(params.userId) == ''){
			viewJs.showApiError({error_code:'20101'});
			return;
		}
        var $p = $.mobile.activePage;
        $p.find('.friendStBtn').remove();
		this.getUserPage(params);
	},doAction:function(e){
//		var $el = $(this);
//		var action = $el.attr('action');
//		e.preventDefault();
//		e.stopPropagation();
//		var me = uJs;
//		switch(action){
//			case 'deleteFriend':
//				me.deleteFriend();
//			break;
//		}
	},getUserPage:function(parans){
		var userId = parans.userId;
		if(userId != null){
			var params = {userId:userId};
			params.accessToken = dmJs.getAccessToken();
			dmJs._ajax({
				id:'getUserPage',
				params:params,
				url:'/urming_quan/user/getUserPage',
				callback:this.showUserPage
			});
		}
	},showUserPage:function(data){
		var me = uJs;
	// 数据
	var user = data.user;
	var services = data.userServices;
	var svrTotal = data.userServiceNum;
	var wants = data.userWants;
	var wtTotal = data.userWantNum;
	var fansNum = data.followedNumber;
	var profileImageUrl = mainJs.getProfilePicUrl({url:user.profileImageUrl, sex:user.sex});
	var userType = user.type;
    var isGroup = user.isGroup;
	var isMoneyGuaranteed = user.isMoneyGuaranteed;
	var isIdcardValidated = user.isIdcardValidated;

	var isTeacherValidated = user.isTeacherValidated;

	var userTags = user.userTags;
	var description = user.description;
	viewJs.setDfReviewNumbers(user);
	var reviewNumbers = user.reviewNumbers;
	var isFollowing = data.isFollowing;

	// 当前页面
	var $p = $.mobile.activePage;
	var $s1 = $p.find('.uInfo.sec1');
	$s1.find('.addFriend').remove();
    var logInUser = dmJs.sStore.getUserInfo();
	if(logInUser && logInUser.user.id != user.id && isFollowing != 3 ){
        $s1.append([
            '<a userId ="', user.id,'" isFollowing="3" class="btn-blue friendStBtn removeFriend ui-btn ui-shadow ui-corner-all">取消关注</a>'].join(''));
	} else{
        $s1.append(['<a userId ="',user.id,'" isFollowing="',isFollowing,'" class="btn-blue friendStBtn ui-btn ui-shadow ui-corner-all">关注</a>'].join(''));
    }
//    setTimeout(me.bindFollow, 300);

	$p.find('.username').html(user.realname);
    if(fansNum > 0){
        $p.find('.fans-num').html(fansNum+'粉丝');
    }
	document.title = user.realname;
	$p.find('.sec1 img').attr('src', profileImageUrl);
	viewJs.setSexMarkCls(user, $p.find('.mark.sex'));
	// 认证
	/*
	if(isIdcardValidated != 1){
		$p.find('.mark.idcardValidated').removeClass('enterprise').removeClass('person');
	} else {
		if(userType=='1'){
			$p.find('.mark.idcardValidated').addClass('person').removeClass('enterprise');
			$(".user-type").append("个人");
		} else {
			$p.find('.mark.idcardValidated').addClass('enterprise').removeClass('person');
			$(".user-type").append("公众号");
		}
	}
	 */
	$(".user-type").html("个人");
	$p.find('.uInfo.sec7').hide();
	var rankArr = ["","创新预备生","一级创新学员","二级创新学员","三级创新学员","四级创新学员","五级创新学员","六级创新学员"
		,"七级创新学员","八级创新学员","九级创新学员","一级创新导师","二级创新导师","三级创新导师","四级创新导师","五级创新导师",
		"六级创新导师","七级创新导师" ,"八级创新导师","九级创新导师","十级创新导师"];
	$p.find('.user-rank').text(rankArr[user.rank]);
	if(userType == 2){
        isGroup && (isIdcardValidated = 'project');
        var validated = user.isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
        isGroup && (validated = 'project');
		$p.find('.mark.idcardValidated').addClass(validated);
		$(".userType:first").parent().html("<span class=\"userType\"></span>");
		if(isGroup==1){

            $(".user-type").html("项目号");
			me.setGroupUser(data.groupCount, data.groupList);
		}else{
            $(".user-type").html("公众号");
			me.setTeacherUser(data.teacherCount, data.teacherList);
		}
		var rankArr = "";
		for(var i=0;i<parseInt((user.rank-1)/5);i++){
			rankArr+='<img src="resource/images/icon_diamond_img.png"/>';
		}
		for(var i=0;i<parseInt((user.rank-1)%5);i++){
			rankArr+='<img src="resource/images/icon_star_img.png"/>';
		}
		$p.find('.user-rank').html(rankArr);
        var exit = isGroup==1? '退出项目号':'退出公众号';
		if(logInUser && logInUser.user.id != user.id && logInUser.user.type!=2){// && logInUser.user.isTeacherValidated == 1
			if(user.applyInstitutionStatus==1){
				$s1.append([
					'<a userId ="', user.id,'" isFollowing="3" class="btn-blue join not-join ui-btn ui-shadow ui-corner-all">'+exit+'</a>'].join(''));
			} else if(logInUser && logInUser.user.id != user.id && user.applyInstitutionStatus==2){
				$s1.append(['<a userId ="',user.id,'" class="btn-blue join not-join ui-btn ui-shadow ui-corner-all wait">申请中</a>'].join(''));
			} else{
				$s1.append(['<a userId ="',user.id,'" class="btn-blue join ui-btn ui-shadow ui-corner-all">申请加入</a>'].join(''));
			}
		}
	} else if(isTeacherValidated == 1 || userType == 3){
		$p.find('.mark.idcardValidated').addClass(user.isIdcardValidated == 1?'teacher':'unauthorized-teacher');
		$(".user-type").html("师资");
		var rankTeacherArr = ["","初级创新教练","一级创新教练","二级创新教练","三级创新教练","四级创新教练","五级创新教练","六级创新教练",
			"七级创新教练","八级创新教练","九级创新教练","初级创新导师","一级创新导师","二级创新导师","三级创新导师","四级创新导师",
			"五级创新导师","六级创新导师","七级创新导师","八级创新导师","九级创新导师","师圣"];
		$p.find('.user-rank').text(rankTeacherArr[user.rank]);
	}else if(isIdcardValidated == 1){
		$p.find('.mark.idcardValidated').addClass('person');
	}else{
		$p.find('.mark.idcardValidated').addClass('empty');
	}
	//if(isMoneyGuaranteed == '1'){
	//	$p.find('.mark.bank').addClass('validateBankCardOK');
	//} else {
	//	$p.find('.mark.bank').removeClass('validateBankCardOK');
	//}
	// 服务指数
	var l = userTags.length;
    var loginUser = dmJs.sStore.getUserInfo();
    var isSelf;
    if(loginUser != null && loginUser.user.id == user.id){
        var isSelf = true;
    }
	if(l != 0){
		var tag,i=0,htmls = [];
		for(; i < l; i++){
            if( !isSelf && i>4 ) break;
			tag = userTags[i];
            if($.trim(tag.tagName) == "北大创新"){
                continue;
            }
			htmls.push(['<span class="vtd tag-item-cls"><span class="tag name">', tag.tagName,'</span>',
			'<span class="tag value">', Math.floor(tag.prvalue),'</span></span>'].join(''));
		}
		$p.find('.uInfo.sec2 .ct').html(htmls.join(''));
	}
	// 个人介绍
	$p.find('.uInfo.sec3 .ct').html('<div class="personDesc">'+viewJs.typesetting(description || urmingLabels.dfUserDesc)+'</div>');
	// 评价
	 viewJs.getReviewCmp(reviewNumbers, $('#u .svrGrade'), {userId:user.id});
	 // 所售服务
	 var $svr = $p.find('.uInfo.sec5');
     var bNoPublish = true;
	 if(svrTotal != null && svrTotal > 0){
		$svr.show().find('.vt .count').html(svrTotal);
		 var lst = me.getUserPageSvrList(services, svrTotal);
		 $(lst).appendTo($svr.find('.ct').empty());
         bNoPublish = false;
	 }
	 // 所需服务
	 $w = $p.find('.uInfo.sec6');
	if(wtTotal != null && wtTotal > 0){
		$w.show().find('.vt .count').html(wtTotal);
		var lst = me.getUserPageWantsList(wants, wtTotal, user.id);
		$(lst).appendTo($w.find('.ct').empty());
        bNoPublish = false;
	 }
     if(bNoPublish){
        $('#not_publish_container').show();
     }
	if(user.institutionUserId){
		$p.find(".myEnterprise").data('institutionUserId',user.institutionUserId);
		$p.find(".myEnterprise img").attr('src',mainJs.getProfilePicUrl({url:user.institutionProfileImageUrl, sex:2}));
		$p.find(".myEnterprise .institutionUserName").html(user.institutionUserName);
		$p.find(".uInfo.sec1").css("margin-bottom","0px");
	}else{
		$p.find(".myEnterprise").hide();
	}
 },bindFollow:function(){
    var _self = arguments.callee;
    if(_self.busy){
        return;
    }
    setTimeout(function(){
        _self.busy = false;
    },600);
    _self.busy = true;
    var me = uJs;
    var $p = $.mobile.activePage;
    var $el = $(this);
    var userId = $el.attr('userId');
    var bAdd = !$el.is('.removeFriend');
    if(viewJs.chkLogin()){
        var loginUserId = dmJs.sStore.getUserInfo().user.id;
        if(loginUserId == userId){
            viewJs.showPopMsg('自己不能关注自己');
            return;
        }
        var params = {userID:userId};
        params.accessToken = dmJs.getAccessToken();
        dmJs._ajax({
            id:'follow',
            params:params,
            url:'/urming_quan/friend/'+(bAdd ? 'follow' : 'unFollow'),
            callback:function(){
                $('#u .uInfo.sec1 .friendStBtn').html((bAdd ? '取消' : '')+'关注').toggleClass('removeFriend');
                var $num = $p.find('.fans-num');
                var num = Number($num.text().replace(/\D/g, ''));
                if(bAdd){
                    num = (num+1) +'粉丝';
                } else {
                    if(num == 1){
                        num = '';
                    } else {
                        num = (num - 1) + "粉丝";
                    }
                }
                $num.text(num);
            }
        });
    }
  },toSvrReviewsDetail:function(){
		var params = mainJs.parseUrlSearch();
		var $m = $(this);
		var reviewNumbers = $m.data('reviewNumbers');
		var extra = $m.data('extra');
		viewJs.navigator.next({
			next:{url:'./reviews.html', id:'reviews',
				options:{
					data:$.extend({offset:0, pageSize:20,reviewNumbers:reviewNumbers
							}, extra)
				}},
			lastAuto:true
		});
	},getUserPageWantsList:function(lst, total, userId){
		var l = lst.length, i = 0, item, info;
		var userId = userId || $('#moreWantsCt').data('params').userId;
		var html = [];
		html.push('<div class="list list2">');
		for(; i < l; i++){
			item = lst[i];
			html.push([
				'<a data-wantID="',item.id ,'"class="vbt vr '+(item.category.category.id==5?"question":"want")+'">',
					'<div class="">',
							'<div class="vr name ellipsis">',
								item.wantName,
							'</div>',
							'<div class="font-gray">预算：',
								item.price,
							'元</div>',
						'<div class="btn2">寻找中</div>',
					'</div>',
				'</a>'
			].join(''));
		}
		html.push('</div>');
		if(total > l){
			html.push('<a data-userId="', userId,'" class="vbt vr moreBtn icon-right toUserWants">查看全部',total,'个需求</a>');
		}
		return  html.join('');
 },getUserPageSvrList:function(lst, total){
	var l = lst.length, i = 0, item, info;
	var html = [];

    var typePic = {1:mainJs.getSvrPicUrl,3:mainJs.getCoursPicUrl,4: mainJs.getActPicUrl};
	html.push('<div class="list list1">');
    var sSvrTpl = $('#userSvr_tpl').html();
    $.each(lst, function(i, svr){
        svr.watchNumber = svr.realViewCount == null ? '0' : svr.realViewCount;
        svr.serviceVersion.picUrl = typePic[svr.serviceVersion.category.category.id]({url: svr.serviceVersion.picUrl,size:2});
        html.push(viewJs.applyTpl(sSvrTpl, svr));
    });
	html.push('</div>');
	if(total > l){
		html.push('<a data-userId="', mainJs.parseUrlSearch().userId,'" class="vbt vr icon-right moreBtn toUserServices">查看全部',total,'个服务</a>');
	}
	return  html.join('');
 },openRankDescribe:function(event){
		var lastParams=mainJs.parseUrlSearch();
		var next = {id:'userRankDescribe',url:'./userRankDescribe.html', options:{data:lastParams}};
		var last = {url:'u.html', id:'u', options:{data:lastParams}};
		viewJs.navigator.next({next:next,last:last,lastAuto:false});
		event.stopPropagation();
	},setTeacherUser:function(teacherNumber,teacherUsers){
		var $p = $.mobile.activePage;
		if(!(teacherNumber > 0)){
			return;
		}
		$p.find('.uInfo.sec7').show();
		$('.teacherCount span').html(teacherNumber);
		var resUsers = [];
		teacherUsers =  teacherUsers.slice(0,5);
		$.each(teacherUsers, function(index, user){
			var img = mainJs.getProfilePicUrl({url: user.profileImageUrl, sex: user.sex});
			resUsers.push([
				'<a class="u" data-userID="',user.id,'">',
				'<img style="border-radius:100%;" src="',img,'">',
				'</a>'
			].join(''));
		});
		$('#teacherCtr-users').html(resUsers.join(''));
		$('#teacherCtr').show();
	},setGroupUser:function(groupNumber,groupUsers){
		var $p = $.mobile.activePage;
		if(!(groupNumber > 0)){
			return;
		}
		$p.find('.uInfo.sec7').show();
		$p.find('.teacher-label').html("成员");
		$p.find('#teacherCtr-users').data("isgroup","1");
		$('.teacherCount span').html(groupNumber);
		var resUsers = [];
		groupUsers =  groupUsers.slice(0,5);
		$.each(groupUsers, function(index, user){
			var img = mainJs.getProfilePicUrl({url: user.profileImageUrl, sex: user.sex});
			resUsers.push([
				'<a class="u" data-userID="',user.id,'">',
				'<img style="border-radius:100%;" src="',img,'">',
				'</a>'
			].join(''));
		});
		$('#teacherCtr-users').html(resUsers.join(''));
		$('#teacherCtr').show();
	}, toMyTeachers:function(){
		if($(this).data("isgroup")){
			viewJs.navigator.next({
				next: {url: './mygroup.html', id: 'mygroup',
					options:{
						data:mainJs.parseUrlSearch()
					}},
				lastAuto: true
			});
		}else{
			viewJs.navigator.next({
				next: {url: './myTeachers.html', id: 'myTeachers',
					options:{
						data:mainJs.parseUrlSearch()
					}},
				lastAuto: true
			});
		}
	},join:function(){
		var _self = arguments.callee;
		/*if(_self.busy){
			return;
		}
		setTimeout(function(){
			_self.busy = false;
		},600);
		_self.busy = true;*/
		var me = uJs;
		var $p = $.mobile.activePage;
		var $el = $(this);
		var userId = $el.attr('userId');
		if($el.html()=="申请中"){
			return;
		}
		if(viewJs.chkLogin()){
			var loginUserId = dmJs.sStore.getUserInfo().user.id;
			if(loginUserId == userId){
				viewJs.showPopMsg('自己不能加入自己');
				return;
			}
			var params = {institutionUserID:userId};
			params.accessToken = dmJs.getAccessToken();
            if($el.is('.not-join')){
                var msg = null;
                if($('.user-type').html()=='项目号'){
                    msg = '确定退出项目组？';
                }else{
                    msg = '确定退出公众号？';
                }
                viewJs.dialogPop(msg,function(){
                    if(arguments[0] === false) return;
                    dmJs._ajax({
                        id:'applyJoinInstitution',
                        params:params,
                        url:'/urming_quan/user/exitInstitution',
                        callback:function(){
                            $('#u .uInfo.sec1 .join').html("申请加入").toggleClass('not-join');
                        }
                    });
                })
            }else{
                dmJs._ajax({
                    id:'applyJoinInstitution',
                    params:params,
                    url:'/urming_quan/user/applyJoinInstitution',
                    callback:function(){
                        $('#u .uInfo.sec1 .join').html("申请中").toggleClass('not-join').addClass('wait');
                    }
                });
            }
           /* if($('#u .uInfo.sec1 .join').html()=='申请中'){
                alert(1)
                $('#u .uInfo.sec1 .join').css({'color':'#999','background':'#ccc'})
            }*/


		}
	},toUserPage:function(){
		viewJs.navigator.next({
			next: {url: './u.html', id: 'u',
				options:{
					data:{userId:$(this).data('institutionUserId')}
				}},
			lastAuto: true
		});
	}
};