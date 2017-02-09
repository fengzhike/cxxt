sysMessageJs = {
	vars:{
		notifyLimit:20
	},
	init:function(){
		var userInfo = this.preInit();
		if(!userInfo){
			return;
		}
		this.fetchData(userInfo);
		this.toggleEvents(true);
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
		$p.undelegate();
		var me = sysMessageJs;
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				$p.delegate('.ui-content a.notifyBt:not([type="0"])', 'tap', me.changePage)
                    .delegate('.h-menu [action]', 'vclick',headerFooterJs. _action);
			}, 500);
		}
	},changePage:function(){
		var $el = $(this);
		var type = Number($el.attr('type'));
		var nextOptions = {};
		var params = $el.attr('params');
        var next;
        switch(type){
            case 16:
            case 8:
                next = {
                    url:'./service.html',
                    id:'service',
                    options:{data:params}
                };
                break;
            case 18:
                next = {
                    url:'./course.html',
                    id:'course',
                    options:{data:params}
                };
                break;
            case 4:
                next = {
                    url:'./myServices.html',
                    id:'myServices',
                    options:{data:{tab:'finish'}}
                };
                break;
            case 5:
            case 2:
            case 3:
                next = {
                    url:'./buyorderDetail.html',
                    id:'buyorderDetail',
                    options:{data:params}
                };
                break;
            case 1:
                next =  {
                    url:'./newFriends.html',
                    id:'newFriends'
                };
                break;
            case 7:
            case 6:
                next =  {
                    url:'./myInvitations.html',
                    id:'myInvitations'
                };
                break;
            case 9:
                next =  {
                    url:'./u.html',
                    id:'u',
                    options:{data:params}
                };
                break;
            case 10:// 认证通过
            case 23:
            case 27:
                next =  {
                    url:'./addService.html',
                    id:'addService',
                    options:{data:params}
                };
                break;
            case 11:
                // 身份认证失败
                next =  {
                    url:'./selectVeifyType.html',
                    id:'selectVeifyType'
                };
                break;
            case 12:
                next =  {
                    url:'./withdraw.html',
                    id:'withdraw'
                };
                break;
            case 13:
                next =  {
                    url:'./accountDetails.html',
                    id:'accountDetails'
                };
                break;
            case 14:
                next =  {
                    url:'./myServices.html',
                    id:'myServices',
                    options:{data:{tab:'mine'}}
                };
                break;
            case 15:
                next =  {
                    url:'./myWants.html',
                    id:'myWants',
                    options:{data:{tab:1}}
                };
                break;
            case 17:
                next =  {
                    url:'./want.html',
                    id:'want',
                    options:{data:params}
                };
                break;
            case 19:
                next =  {
                    url:'./updateInfo.html',
                    id:'updateInfo',
                    options:{data:params}
                };
                break;
            case 20:
                next =  {
                    url:'./question.html',
                    id:'question',
                    options:{data:params}
                };
                break;
            case 21:
                next =  {
                    url:'./mine.html',
                    id:'mine',
                    options:{data:params}
                };
                break;
            case 22:
                next =  {
                    url:'./addQuestion.html',
                    id:'addQuestion',
                    options:{data:params}
                };
                break;
            case 24:
                next =  {
                    url:'./searchResult.html',
                    id:'searchResult',
                    options:{data:params}
                };
                break;
            case 25:
                next =  {
                    url:'./search.html',
                    id:'doSearchSvr'
                };
                break;
            case 26:
                next =  {
                    url:'./innovationEvaluateExplain.html',
                    id:'innovationEvaluateExplain'
                };
                break;
            case 28:
                next =  {
                    url:'./myDiplomas.html',
                    id:'myDiplomas'
                };
                break;
            case 30:
                next =  {
                    url:'./joinEnterprise.html',
                    id:'joinEnterprise',
                    options:{data:params}
                };
                break;
            case 31:
                next =  {
                    url:'./joinEnterprise.html',
                    id:'joinEnterprise',
                    options:{data:params}
                };
                break;
            default:
                return;
        }
        viewJs.navigator.next({next:next,lastAuto:true});
	},initNotifyList:function(data){
        var userInfo = dmJs.sStore.getUserInfo();
		var user = userInfo.user;
		var me = sysMessageJs;
		var $p = $.mobile.activePage;
		var newNotify = data.notify;
		var oldNotifyKey = 'oldNotify-'+user.id;
		var alreadyReadKey = 'reayNotify-'+user.id;
		var oldNotify = dmJs.lStore.get(oldNotifyKey) || [];
		var notifyLimit = me.vars.notifyLimit;
		var notify = newNotify.concat(oldNotify).splice(0, notifyLimit-1);
		dmJs.lStore.save(oldNotifyKey, notify);
        viewJs.fSyncVeryUserStatus(newNotify);
		var i = 0, l = notify.length;
		if(l > 0){
			dmJs.lStore.save(alreadyReadKey, notify[0].id);
		}
		var htmls = [];
		var params;
		var item;
		for(; i < l; i++){
			item = notify[i];
			params = {};
			switch(item.type){
                case 16:
				case 8:
				case 18:
					params = {serviceID:item.relatedId};
					break;
                case 17:
                case 20:
					params = {wantID:item.relatedId};
					break;
				case 5:
				case 2:
					params = {serviceOwnID:item.relatedId,userType:2};
					break;
				case 3:
					params = {serviceOwnID:item.relatedId,userType:1};
					break;
				case 9:
					params = {userId:item.relatedId};
					break;
                case 10:
                    params = {catId:1,catName:'服务'};
                    break;
                case 22:
                    params = {catId:5,catName:'问题'};
                    break;
                case 23:
                    params = {catId:4,catName:'活动'};
                    break;
                case 24:
                    params = {orderType: 4, area1: '中国', pageSize: 20, offset: 0,
                        longitude: dmJs.params.geolocation.longitude, latitude: dmJs.params.geolocation.latitude,
                        searchKind:"question","categoryName":"问题","categoryParentId":"5","catId":"5"};
                    break;
                case 27:
                    params = {catId:1,catName:'众筹让股'};
                    break;
                case 30:
                    params = {id:item.relatedId,isGroup:0};
                    break;
                case 31:
                    params = {id:item.relatedId,isGroup:1};
                    break;
			}
			htmls.push([
				'<a class="notifyBt ui-corner-all" type="',item.type,'" params="',$.param(params),'">',
					item.content,
				'</a>',
                '<div class="notifyTime font-gray">',
                 item.creTime,
                '</div>'
			].join(''));
		}
		$p.find('.ui-content:first').html(htmls.join('')).enhanceWithin();
	},fetchData:function(userInfo){
		var accessToken = userInfo.accessToken;
		dmJs._ajax({
			id:'getNewNotify',
			url:'/urming_quan/message/getNewNotify',
			params:{accessToken:accessToken},
			callback:this.initNotifyList
		});
	}
};