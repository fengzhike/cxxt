orderDetailJs = {
	init:function(){
		this._action= function(){};
		var userType = mainJs.parseUrlSearch().userType;
		if(userType==1){
			$('#order-card-ct').show();
			$('#customer-info').hide();

		} else if(userType==2){
			$('#order-card-ct').hide();
			$('#customer-info').show();
		} else {
			$('#customer-info,#order-card-ct').hide();
		}

		this.toggleEvents(true);
		this.getServiceOwnByID();
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = orderDetailJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.toUseService', 'vclick', me.toUseService);
				$p.delegate('.service', 'vclick', me.toServiceDetail);
				$p.delegate('.u', 'vclick', me.toUserPage);
				$p.delegate('.addReview', 'tap', me.toAddReview);
				$p.delegate('[order-card-btn]', 'tap', function(){
                    //console.log(me._action)
                    me._action();
                });
				$p.delegate('.svrUserInfo','vclick', me.toSvrUserInfo);
				$p.delegate('.card-line-top,.card-line-center','vclick', me.toServiceDetail);
				$p.delegate('.vbt .vr .icon-right .service','vclick',me.toServiceDetail);
                //$p.delegate('.vbt.submit', 'vclick', me.submitReview);
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
	},toUseService:function(){
		viewJs.dialogPop('<p>确定服务已完成？</p><div class="vct">请确认已于服务方约好服务事宜，避免不必要的损失。</div>',
			function(isOk){
				if(isOk){
					var params = mainJs.parseUrlSearch();
					dmJs.confirmService(params.serviceOwnID, function(){	
						location.reload();
					});
				}
			}
		);
	},getServiceOwnByID:function(){
		var me = orderDetailJs;
		var params = mainJs.parseUrlSearch();
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null){
			dmJs.sStore.toLogin({
				url:'./myOrders.html'
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
					url:'./myOrders.html'
				});
			},
			callback:function(data){
				data.userType = type;
				me.initOrderDetails(data);
			}
		});
	},parseSellerInfo:function(ret){
		var me = orderDetailJs;
		var data = ret.serviceOwn;
		var tpl = $('#order-card-tpl').html();
		var $c = $('#order-card-ct').show();
		var svr = data.serviceVersion;
		var item = {};
		item.code = data.code;
		item.price = svr.newPrice;
		item.serviceName = svr.serviceName;
//		item.realname = data.userByUserId.realname;
//		item.contactPhone = data.userByUserId.contactPhone;
		item.realname = data.serviceVersion.userByUserId.realname;
		//item.contactPhone = data.serviceVersion.userByUserId.contactPhone;
		var contactTypeList = ["电话","邮箱","微信"];
		var contactTypeString = (data.serviceVersion.contactType>-1?contactTypeList[data.serviceVersion.contactType]+":":"")+data.serviceVersion.contactContent?data.serviceVersion.contactContent:"";
		item.contactContent = contactTypeString;
		item.statusTxt = me.orderStatus[data.status];
		item.actionStatus = me.actionStatus[data.status];
		if(!item.actionStatus){
			item.actionCls = "hidecls";
		} else {
			item.actionCls = "";
		}
		if(data.status == 1 ){
			me._action = me.toUseService;
            //alert(1)
		} else if(data.status == 7 || data.status == 11 ){
			me._action = function(){
				var params={serviceOwnID:data.id,type:svr.type,serviceID:data.service.id,serviceName:svr.serviceName};
				viewJs.navigator.next({
					next:{url:'./addReview.html', id:'addReview',options:{data:params}},
					lastAuto:true
				});
			};
		}
		item.serviceID = data.service.id;
		item.catId = svr.category.category.id;
		var html = viewJs.applyTpl(tpl,item);
		$c.html(html);
		if(svr.startTime!=undefined && svr.startTime!=''){
			$("#order-card-startTime").html("开始时间："+svr.startTime);
		}else{
			$("#order-card-startTime").hide();
		}
		if(svr.endTime!=undefined && svr.endTime!=''){
			$("#order-card-endTime").html("结束时间："+svr.endTime);
		}else{
			$("#order-card-endTime").hide();
		}
	},initOrderDetails:function(data){
		var me = orderDetailJs;
		var serviceOwn = data.serviceOwn;
		var code = serviceOwn.code;
		var status = serviceOwn.status;
		var orderUser = serviceOwn.userByUserId;
		var svr = serviceOwn.serviceVersion;
		var svrUser = svr.userByUserId;
		var serviceReviewByBuyer = data.serviceReviewByBuyer;
		var serviceReviewBySeller = data.serviceReviewBySeller;
		var teacherUser = svr.teacherUser;
        var catId = svr.category.category.id;
        //fsk
        var picFn = null;
        var fnArr = [mainJs.getSvrPicUrl,mainJs.getFunPicUrl,mainJs.getActPicUrl,mainJs.getCoursPicUrl];
        switch(catId){
            case 1:
                picFn = fnArr[0];
                break;
            case 3:
                picFn = fnArr[3];
                break;
            case 4:
                picFn = fnArr[2];
                break;
            case 8:
                picFn = fnArr[1];
                break;
        }
		var html = [];
		var $p = $('#orderDetail');
		var $svrShortcut = $p.find('.svrShortcut');
		$svrShortcut.html([
			'<a data-serviceID="',serviceOwn.service.id,'" class="vbt vr icon-right service">',
				'<div class="block left ">',
					'<img src="',picFn({url:svr.picUrl,size:2}),'">',
				'</div>',
				'<div class="block right">',
					'<div class="name ellipsis vt">',
						svr.serviceName,
					'</div>',
					'<div class="price">￥',
						serviceOwn.price,
					'</div>',
				'</div>',
			'</a>'
		].join(''));
		var $order = $p.find('.order');
		if(svr.category.category.id==3){
			$p.find('.vTitle').text('课程内容');
		}

		var userType = data.userType;
		var $ct = $p.find('.sec3>.ct');
		$ct.html(me.typesetting(svr.serviceDesc));
		//hw
		if(typeof(svr.hideInfo) == "undefined" || svr.hideInfo==""){
			$("#hiTitle").hide();
		}else{
			$p.find('.sec3>.hi').html(svr.hideInfo);
		}
		var $u = $('#orderDetail .svrUserInfo');
		$t = $u.find('.svrUserTages');
		if(teacherUser!=undefined && teacherUser.id!=undefined){
			$(".svrUser.info").show();
			var userTag = teacherUser.userTags;
			$u.data('userId', teacherUser.id);
			var rankArr = ["","创新预备生","一级创新学员","二级创新学员","三级创新学员","四级创新学员","五级创新学员","六级创新学员"
				,"七级创新学员","八级创新学员","九级创新学员","一级创新导师","二级创新导师","三级创新导师","四级创新导师","五级创新导师",
				"六级创新导师","七级创新导师" ,"八级创新导师","九级创新导师","十级创新导师"];
			var rankTeacherArr = ["","初级创新教练","一级创新教练","二级创新教练","三级创新教练","四级创新教练","五级创新教练","六级创新教练",
				"七级创新教练","八级创新教练","九级创新教练","初级创新导师","一级创新导师","二级创新导师","三级创新导师","四级创新导师",
				"五级创新导师","六级创新导师","七级创新导师","八级创新导师","九级创新导师","师圣"];
			var idcardValidated = 'empty';
			$u.find('.user-rank').text(rankArr[teacherUser.rank]);
			if(teacherUser.type == 2){
				idcardValidated = teacherUser.isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
				var rankStr = "";
				for(var i=0;i<parseInt((teacherUser.rank-1)/5);i++){
					rankStr+='<img src="resource/images/icon_diamond_img.png"/>';
				}
				for(var i=0;i<parseInt((teacherUser.rank-1)%5);i++){
					rankStr+='<img src="resource/images/icon_star_img.png"/>';
				}
				$u.find('.user-rank').html(rankStr);
			} else if(teacherUser.isTeacherValidated == 1 || teacherUser.type == 3){
				idcardValidated = teacherUser.isIdcardValidated == 1?'teacher':'unauthorized-teacher';
				$u.find('.user-rank').text(rankTeacherArr[teacherUser.rank]);
			}else if(teacherUser.isIdcardValidated == 1){
				idcardValidated = 'person';
			}
			$u.find('.svrUserName').html([teacherUser.realname,
				'<span class="mark idcardValidated ',idcardValidated,'"></span>'/*,
				'<span class="mark bank ',(teacherUser.isMoneyGuaranteed == 1 ? 'validateBankCardOK' : ''),'"></span>'*/].join(''));
			$u.find('img').attr('src', mainJs.getProfilePicUrl({url:teacherUser.profileImageUrl, sex:teacherUser.sex}));
			//$u.find('.user-rank').text(rankTeacherArr[teacherUser.rank]);
			$t = $u.find('.svrUserTages');
			var htmls = [],tag;
			if(userTag != null){
				var l = userTag.length, i = 0;
				for(; i < l; i++){
					tag = userTag[i];
					if($.trim(tag.tagName) == "北大创新"){
						continue;
					}
					htmls.push(['<div class="tagItem"><span class="tagName">', tag.tagName,
						'</span><span class="prvalue">', Math.floor(tag.prvalue),'</span></div>'].join(''));
				}
			}
			$t.html(htmls.join(''));
		}
		//hw
		if(userType == 1){
			me.parseSellerInfo(data);
			var $sec2 = $p.find('.sec2').attr('status', status);
			if(status == 8 || status == 7 || status == 11 || status == 12){
				var view1 = '', view2 = '';
				var cunterpartiesReview = userType == 1 ? serviceReviewBySeller : serviceReviewByBuyer;
				var myReview = userType == 1 ? serviceReviewByBuyer : serviceReviewBySeller;
				if(myReview!= null){
					view1 = ['<div class="line1">',
						'<span class="vt">我的评价</span>',
						'<span class="reviewGrade">',
						viewJs.getStars({grade:myReview.value1}).join(''),
						'</span>',
						'<span class="reviewTime">',myReview.reviewTime.substring(0,10),'</span>',
						'</div>',
						'<div class="vc reviewContent">',
						myReview.reviewContent || '',
						'</div>'
					].join('');
				} else {
					view1 = ['<a class="vbt vr icon-right addReview" ',
						'data-serviceName="',svr.serviceName,'"',
						'data-serviceID="',
						serviceOwn.service.id,
						'"data-serviceOwnID="',serviceOwn.id,'" data-reviewType="',userType,'">',
						'<span class="vt">我的评价</span>',
						'<span class="reviewGrade">',
						viewJs.getStars({grade:0}).join(''),
						'</span>',
						'<span class="reviewTime">去评价</span>',
						'</a>'
					].join('');
				}
				if(cunterpartiesReview!= null){
					view2 = ['<div class="line1">',
						'<span class="vt">',userTypeText,'评价</span>',
						'<span class="reviewGrade">',
						viewJs.getStars({grade:cunterpartiesReview.value1}).join(''),
						'</span>',
						'<span class="reviewTime">',cunterpartiesReview.reviewTime.substring(0,10),'</span>',
						'</div>',
						'<div class="vc reviewContent">',
						cunterpartiesReview.reviewContent || '',
						'</div>'
					].join('');
				} else {
					view2 = ['<div class="line1">',
						'<span class="vt">',userTypeText,'评价</span>',
						'<span class="reviewGrade">',
						viewJs.getStars({grade:0}).join(''),
						'</span>',
						'<span class="reviewTime">暂无评价</span>',
						'</div>'
					].join('');
				}
                var str =svr.category.category.id==8?'': ['<div class="review">',
                    '<div class="myReview">',
                    view1,
                    '</div>',
                    '<div class="sellerReview">',
                    view2,
                    '</div>',
                    '</div>'
                    ].join('');
				$sec2.html();
			}
			return;
		}
		var userTypeText = userType == 1 ?  '卖家' : '买家';
		var cunterparties;
		if(userType == 1){
			cunterparties = svrUser;
		} else {
			cunterparties = orderUser;
		}
		var cunterpartiesReview = userType == 1 ? serviceReviewBySeller : serviceReviewByBuyer;
		var myReview = userType == 1 ? serviceReviewByBuyer : serviceReviewBySeller;
		$order.html([
			'<div>',
			'<span class="vt">订单编号：</span>',
			'<span class="vc">', code,'</span>',
			'</div>',
			'<div>',
			'<div style="display:inline-block;width:80px;" class="vt"><span>状</span><span style="float:right">态：</span></div>',
			'<span class="vc">', me.orderStatus[status],'</span>',
			'</div>'
		].join(''));
		var $seller = $p.find('.seller');
		$seller.html([
			'<a data-userId="', cunterparties.id,'"class="vbt vr icon-right u">',
				'<div>',
					'<span class="vt">',userTypeText,'姓名：</span>',
					'<span class="ellipsis">', cunterparties.realname,'</span>',
				'</div>',
				'<div>',
					'<span class="vt">联系方式：</span>',
					'<span class="vc">', cunterparties.contactPhone,'</span>',
				'</div>',
			'</a>'
		].join(''));
		var $sec2 = $p.find('#customer-info .sec2').attr('status', status);
		if(status == 1){
            alert(1)
			$sec2.html(['<a class="btn1 toUseService" data-serviceOwnID="',serviceOwn.id,'">确认服务完成</a>'].join(''));
		} else if(status == 5){
			$sec2.html(['<a class="btn1 disable">已退款</a>'].join(''));
		}else if(status == 9){
			//$sec2.html(['<a class="btn1 disable">等待买家使用</a>'].join(''));
		}
		else if(status == 8 || status == 7 || status == 11 || status == 12){
			var view1 = '', view2 = '';
			if(myReview!= null){
				view1 = ['<div class="line1">',
						'<span class="vt">我的评价</span>',
						'<span class="reviewGrade">',
							viewJs.getStars({grade:myReview.value1}).join(''),
						'</span>',
						'<span class="reviewTime">',myReview.reviewTime.substring(0,10),'</span>',
					'</div>',
					'<div class="vc reviewContent">',
						myReview.reviewContent || '',
					'</div>'
					].join('');
			} else {
					view1 = ['<a class="vbt vr icon-right addReview" ',
					'data-serviceName="',svr.serviceName,'"',
					'data-serviceID="',
					serviceOwn.service.id,
					'"data-serviceOwnID="',serviceOwn.id,'" data-reviewType="',userType,'">',
						'<span class="vt">我的评价</span>',
						'<span class="reviewGrade">',
							viewJs.getStars({grade:0}).join(''),
						'</span>',
						'<span class="reviewTime">去评价</span>',
					'</a>'
					].join('');
			}
			if(cunterpartiesReview!= null){
				view2 = ['<div class="line1">',
						'<span class="vt">',userTypeText,'评价</span>',
						'<span class="reviewGrade">',
							viewJs.getStars({grade:cunterpartiesReview.value1}).join(''),
						'</span>',
						'<span class="reviewTime">',cunterpartiesReview.reviewTime.substring(0,10),'</span>',
					'</div>',
					'<div class="vc reviewContent">',
						cunterpartiesReview.reviewContent || '',
					'</div>'
					].join('');
			} else {
				view2 = ['<div class="line1">',
						'<span class="vt">',userTypeText,'评价</span>',
						'<span class="reviewGrade">',
							viewJs.getStars({grade:0}).join(''),
						'</span>',
						'<span class="reviewTime">暂无评价</span>',
					'</div>'
					].join('');
			}
			$sec2.html(['<div class="review">',
				'<div class="myReview">',
					view1,
				'</div>',
				'<div class="sellerReview">',
					view2,
				'</div>',
			'</div>'
			].join(''));

		}
		$('#customer-info').show();
        //fsk
        if(catId == 8){
            $('.order div:eq(1)').hide()
        }
	},typesetting:function(str){
		if(str == null){
			return '';
		}
		return '&nbsp;&nbsp;&nbsp;'+(str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
	},orderStatus:{
		1:'未确认',
		5:'已退款',
		7:'待评价',
		8:'已评价',
		9:'等待买家确认',
		11:'待评价',
		12:'已评价'
	},actionStatus:{
		1:'确认支付',
		7:'去评价',
		11:'去评价'
	},toSvrUserInfo:function(){
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