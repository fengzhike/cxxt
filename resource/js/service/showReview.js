showReviewJs = {
	init:function(){
		this._action= function(){};
		var userType = mainJs.parseUrlSearch().userType;
		if(userType==1){

		}
		this.toggleEvents(true);
		this.getServiceOwnByID();
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = showReviewJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
                $p.delegate('.user-info','vclick',me.toUserPage)
			}, 500);
		}
	},toAddReview:function(){
		var $el = $(this);
		var serviceOwnID = $el.attr('data-serviceOwnID');
		var type = $el.attr('data-reviewType');
		var serviceName = $el.attr('data-serviceName');
		var serviceID = $el.attr('data-serviceID');
		var params={serviceOwnID:serviceOwnID,type:type,serviceID:serviceID,serviceName:serviceName};
		viewJs.navigator.next({
			next:{url:'./addReview.html', id:'addReview',options:{data:params}},
			lastAuto:true
		});
	},toServiceDetail:function(){
		var $m = $(this).parent();
		var serviceID = $m.attr('data-serviceID');
		if(!serviceID){
			serviceID = $(this).attr('data-serviceID');
		}
		var catId = $m.attr('data-catId');
		if(serviceID != null && serviceID != ''){
			var params = {serviceID:serviceID};
			if($m.is('.isMine')){
				params.isMine = true;
			}
			if(catId==3){
				viewJs.navigator.next({
					next:{url:'./course.html', id:'course',
						options:{
							data:params
						}},
					lastAuto:true
				});
			}else if(catId==8){
				viewJs.navigator.next({
					next:{url:'./funding.html', id:'funding',
						options:{
							data:params
						}},
					lastAuto:true
				});
			}else{
				viewJs.navigator.next({
					next:{url:'./service.html', id:'service',
						options:{
							data:params
						}},
					lastAuto:true
				});
			}
		}
	},toUserPage:function() {
		var $m = $(this);
		var userId = $m.attr('data-userId');
		if(userId != null && userId != ''){
			var params = {userId:userId};
			viewJs.navigator.next({
					next:{url:'./u.html', id:'u',
						options:{
							data:params
						}},
					lastAuto:true
				});
		}
	},getServiceOwnByID:function(){
		var me = showReviewJs;
		var params = mainJs.parseUrlSearch();
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null){
			dmJs.sStore.toLogin({
				url:'./showReview.html'
			});
			return;
		}
		params.accessToken = currentUser.accessToken;
		var type = params.type = params.userType || '1';
		dmJs._ajax({
			id:'getServiceOwnByID',
			url:'/urming_quan/service/getServiceOwnByID',
			params:params,
			accessInvalid:function(){
				dmJs.sStore.toLogin({
					url:'./showReview.html'
				});
			},
			callback:function(data){
				data.userType = type;
				me.initOrderDetails(data);
			}
		});
	},initOrderDetails:function(data){
        console.log(data)
		var me = showReviewJs;
        var $p = $.mobile.activePage;
        var type = data.userType;
        var dataSelf,dataOther,userSelf,userOther;
        if(type == 1){
            dataSelf = data.serviceReviewByBuyer;
            dataOther = data.serviceReviewBySeller;
            userSelf = data.serviceOwn.userByUserId;
            userOther = data.serviceOwn.serviceVersion.userByUserId;
        }else{
            dataSelf = data.serviceReviewBySeller;
            dataOther = data.serviceReviewByBuyer;
            userOther = data.serviceOwn.userByUserId;
            userSelf= data.serviceOwn.serviceVersion.userByUserId;

        }
        console.log(!!dataSelf)
        var proSelf = userSelf.profileImageUrl,
            nameSelf = userSelf.realname,
            idSelf = userSelf.id;
        var proOther = userOther.profileImageUrl,
            nameOther = userOther.realname,
            idOther = userOther.id;
        $p.find('li.self img').attr('src',mainJs.getProfilePicUrl({url:proSelf}))
        $p.find('li.self .user-info span').html(nameSelf)
        $p.find('li.self .user-info').attr('data-userid',idSelf)

        $p.find('li:not(.self) img').attr('src',mainJs.getProfilePicUrl({url:proOther}))
        $p.find('li:not(.self) .user-info span').html(nameOther)
        $p.find('li:not(.self) .user-info').attr('data-userid',idOther)


        if(dataSelf){
            $p.find('li.self .review_detial').show()
            $p.find('li.self .no-review').hide()
            var valueSelf = dataSelf.value1,
                decSelf = dataSelf.reviewContent,
                timeSelf = dataSelf.reviewTime;
            $p.find('li.self .pay-state').show().html(timeSelf)
            $p.find('li.self .review_dec').html(decSelf)
            $p.find('li.self .starImg').each(function(i,item){
                if(i<valueSelf){
                    $(item).addClass('full')
                }else{
                    $(item).addClass('empty')
                }
            })

        }else{
            $p.find('li.self .review_detial').hide()
            $p.find('li.self .no-review').show()
        }
        if(dataOther){
            $p.find('li:not(.self) .review_detial').show()
            $p.find('li:not(.self) .no-review').hide()

            var valueOther = dataOther.value1,
                decOther = dataOther.reviewContent,
                timeOther = dataOther.reviewTime;
            $p.find('li:not(.self) .pay-state').show().html(timeOther)
            $p.find('li:not(.self) .review_dec').html(decOther)
            $p.find('li:not(.self) .starImg').each(function(i,item){
                if(i<valueOther){
                    $(item).addClass('full')
                }else{
                    $(item).addClass('empty')
                }
            })



        }else{
            $p.find('li:not(.self) .review_detial').hide()
            $p.find('li:not(.self) .no-review').show()
        }





	},typesetting:function(str){
		if(str == null){
			return '';
		}
		return '&nbsp;&nbsp;&nbsp;'+(str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
	}
};