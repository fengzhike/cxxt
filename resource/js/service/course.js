courseJs = {
	offset:0,
	init:function(){
		if(mainJs.parseUrlSearch().serviceID==17834){
			viewJs.navigator.next({
				next:{url:'./jinDaoLecture.html', id:'jinDaoLecture'},
				lastAuto:false
			});
			return;
		}
		this.initData();
		this.toggleEvents(true);
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
			$("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
				'<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
		}
	},toggleEvents:function(isBind){
		var me = courseJs;
		var $p = $.mobile.activePage;
		$p.undelegate();
		$('#id_video_container').bind('contextmenu',function() { return false; }); 
		if(isBind){
			$p.one('pagebeforehide', function(){	me.toggleEvents();});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.buySvrBtn.enable','vclick', me.buySvr);
				$p.delegate('.btn-store','vclick', me.doStoreSvr);
				$p.delegate('.reportBt','vclick', me.report);
				$p.delegate('.svrGrade.isBtn','vclick', me.toSvrReviewsDetail);
				$p.delegate('.svrUserInfo','vclick', me.toSvrUserInfo);
				$p.delegate('.svrVoiceLength','vclick', me.playVoice);
				$p.delegate('.chapter','vclick', me.getVideoID);
				$p.delegate('.content','click', me.toggleContent);
                $p.delegate('.action', 'vclick', me.doAction);
                $p.delegate('.slideImgs', 'vclick',function(){
                    setTimeout(function(){
                        me.showOringeImg()
                    },100)
                });
                $p.delegate('.disapear', 'vclick',function(){
                    setTimeout(function(){
                        $('#showOringeImg_box').remove();
                    },200)

                });
			},500);
		}
		$(window).on("orientationchange",me.orientationchange);
	},showOringeImg:function(){
        var $p = $.mobile.activePage;
        var oriImgArr = [];
        var iw = $p.find('.ui-content').outerWidth()+'px';
        $p.find('.slide.slider.item').each(function(i,item){
            oriImgArr[i]= $(item).css('background-image').split('(')[1].split(')')[0];
        });
        //console.log(oriImgArr)
        var htl = '<div id="showOringeImg_box">' +
                    '<div class="show_header">' +
                        '<span class="disapear">&lt;</span>' +
                        '<b class="progress">1/'+oriImgArr.length+'</b>'+
                    '</div>';

             htl+='<div class="show_content"> ';
                for(var i=0; i< oriImgArr.length;i++){
                    //console.log(iL)
                    if(i == 0){
                        var iL = 0;
                    }else{
                        var iL = iw;

                    }
                    htl+='<img src =' +oriImgArr[i]+' class = "show_pic11" style =" left : '+ iL+' " />';
                }

        htl+= '</div></div>';
        $('.servicePicsCtr').append($(htl));
        var numPic=0;
        $p.find('.show_pic11').on( 'swipeleft',function(){
            swipe('left');
        });
        $p.find('.show_pic11').on( 'swiperight',function(){
            swipe('right');
        });
         function swipe(direction){
            var me = courseJs;
            direction = direction? direction:'left';
            var iw = $p.find('.ui-content').outerWidth();
            if(direction =='left'){
                numPic ++;
                if(numPic>oriImgArr.length-1) numPic = oriImgArr.length-1;
                $('.show_pic11').eq(numPic-1).css('left',-iw);
                $('.show_pic11').eq(numPic).css('left','0');
            }else{
                numPic --;
                if(numPic<0 ) numPic = 0;
                $('.show_pic11').eq(numPic+1).css('left',iw);
                $('.show_pic11').eq(numPic).css('left','0');
            }
            $('.progress').html((numPic+1)+'/'+oriImgArr.length)
        }
        $p.find('#showOringeImg_box').on('vmousemove',function(e){
            e.preventDefault()
        });
        $('#showOringeImg_box').css('top', $(document).scrollTop()-44);
    } ,toggleTab:function(){
		var $el = $(this);
		if($el.is('.sel')){
			return;
		}
		var $p = $.mobile.activePage;
		$p.find('[tab].sel').removeClass('sel');
		$p.find('[tab="'+$el.attr('tab')+'"]').addClass('sel');
	},doAction:function(e){
		var $p = $.mobile.activePage;
		e.preventDefault();
		e.stopPropagation();
		var $el = $(this);
		var me = courseJs;
		var action = $el.attr('action');
		$(".info,#chapter,#wants").hide();
		$('#result_not_found_container').hide();
		$p.removeClass('not-found');
		switch(action){
			case 'info':
				me.toggleTab.call($el);
				$(".info").show();
				break;
			case 'chapter':
				me.toggleTab.call($el);
				$("#chapter").show();
				if($(".chapter").length == 0){
					$('#result_not_found_container').show();
					$('#result_not_found_tip').html('暂时没有相关信息');
					$p.addClass('not-found');
				}
				break;
			case 'wants':
				me.toggleTab.call($el);
				//me.recommendWants(true);
				if(!($(".msg_num").html() > 0)){
					$('#result_not_found_container').show();
					$('#result_not_found_tip').html('暂时没有相关信息');
					$p.addClass('not-found');
				}
				$("#wants").show();
				break;
			case 'want':
				var params = {wantID:$el.attr('data-wantId')};
				var lastParams=mainJs.parseUrlSearch();
				lastParams.tab = 'wants';
				lastParams.offset = me.offset;
				viewJs.navigator.next({
					next:{url:'./want.html', id:'want', options:{data:params}},
					last:{url:'course.html', id:'course', options:{data:lastParams}}
				});
				break;
			case 'pageNav':
				$("#wants").show();
				if($el.is('.disabled')){
					return;
				}
				//if(me._data.busy){
				//	return;
				//}
				//me._data.busy = true;
				courseJs.offset = ($el.attr('data-page-num')-1)*5;
				me.recommendWants(true);
				break;
		}
	},playVoice:function(){
		$(this).siblings('audio')[0].play();
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
	},report:function(){
		var params = mainJs.parseUrlSearch();
		viewJs.navigator.next({
			next:{url:'./report.html', id:'report',
				options:{
					data:params
			}},
			lastAuto:true
		});
	},doStoreSvr:function(){
        var _self = arguments.callee;
        if(_self.busy){
            return;
        }
        _self.busy = true;
		var $el = $(this);
        var bCancel = $el.is('.cancel');
		var accessToken = dmJs.getAccessToken();
		var serviceID = mainJs.parseUrlSearch().serviceID;
		if(accessToken == null){
            _self.busy = false;
			if(serviceID != null){
				dmJs.sStore.toLogin({href:'./course.html',id:'course', options:{data:{serviceID:serviceID}}});
			} else {
				dmJs.sStore.toLogin();
			}
		} else {
			var params = {serviceID:serviceID};
			params.accessToken = accessToken;
			dmJs._ajax({
				id:'store',
				params:params,
				url:'/urming_quan/service/'+(bCancel ? 'removeStore' :'store'),
				callback:function(){
                    $el.toggleClass('cancel');
					$('#storeResult').html(bCancel ? '取消收藏成功' : '收藏成功').show().delay(3000).hide(1);
                    _self.busy = false;
				},error:function(){
                    _self.busy = false;
                }
			});
		}
	},buySvr:function(){
		var me = courseJs;
		var $p = $.mobile.activePage;
		var $b = $(this);
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null && !$b.is('[live]')){
			dmJs.sStore.toLogin({url:'./course.html', options:{data:mainJs.parseUrlSearch()}});
		}/* else if(typeof(currentUser.user.mobile) == 'undefined' || currentUser.user.mobile == ''){
			viewJs.dialogPop('绑定手机号才能购买！', function(res){
				if(res){
					viewJs.navigator.next({next:{url:'./bindMobile.html', id:'bindMobile'},lastAuto:true});
				}
			});
		} */else {
			var service = $b.data('service');
			if(service != null){
				var service = service.service;
				if($b.is('[needEnter]')){
					viewJs.navigator.next({
						next:{url:'./signup.html', id:'signup', options:{data:{serviceID:service.id}}},
						lastAuto:true
					});
					return;
				}
				if($b.is('[live]')){
                    //console.log(window.location)
                    //console.log(window.location.href.replace(/course/,'liveCast2').split('?')[0]+'?actId='+$b.data("liveID")+'&serviceID='+$b.data("relatedId"))
                    var sLiveHref =window.location.href.replace(/course/,'liveCast2').split('?')[0]+'?actId='+$b.data("liveID")+'&serviceID='+$b.data("relatedId");
                    window.location.href = sLiveHref;
					/*viewJs.navigator.next({
						next:{url:'./liveCast2.html', id:'liveCast', options:{data:{actId:$b.data("liveID"),serviceID:$b.data("relatedId")}}},
						lastAuto:true
					});*/
					return;
				}
                if( $b.is('[self]')){
                    viewJs.navigator.next({
                        next:{url:'./addService.html', id:'addService',
                            options:{
                                data:{serviceID:service.id,catId:service.serviceVersion.category.category.id}
                            }},
                        lastAuto:true
                    });
                    return;
                }
                var fnc = arguments.callee;
				if($b.is('[notValid]')){
                    viewJs.dialogPop('该服务提供者还没有经过身份认证,购买需要谨慎哦！',function(ret){
                        if(ret){
                            $b.attr('notValid', null);
                            fnc.apply($b);
                        }
                    },'提示',{
                        onlyBtnOk:true
                    })
                    return;
                }
				var svrVer = service.serviceVersion;
				var params = {serviceID:service.id, price:svrVer.newPrice, serviceVersionID:svrVer.id,serviceName:svrVer.serviceName,catId:service.serviceVersion.category.category.id,isvirtualcurr:service.isvirtualcurr};

                if($b.is('[free]')){
					var data = me.buyFreeSvr(params);
					if(data.status="suc"){
						viewJs.navigator.next({
							next:{url:'./buyorderDetail.html', id:'buyorderDetail',
								options:{
									data:{serviceOwnID:data.id,type:1}
								}},
								last:{
									url:'./course.html', id:'course',
									options:{data:mainJs.parseUrlSearch()}
								},
							lastAuto:false
						});
						/*
						viewJs.navigator.next({
							next:{url:'./myOrders.html', id:'myOrders',
								options:{
									data:{serviceID:service.id,catId:service.serviceVersion.category.category.id,tab:'review'}
								}},
							last:{
								url:'./course.html', id:'course',
								options:{data:mainJs.parseUrlSearch()}
							},
							lastAuto:false
						});
						*/
					}
					return;
				 }
                //console.log(typeof params.serviceName)
				viewJs.navigator.next({
					next:{url:'./submitOrder.html', id:'submitOrder',
						options:{
							data:params
						}},
					last:{
						url:'./course.html', id:'course',
						options:{data:mainJs.parseUrlSearch()}
					},
					lastAuto:false
				});
			}
		}
	},initData:function(){
		var me = courseJs;
		if(!(/service/.test(location.href))){
			return;
		}
		var params = mainJs.parseUrlSearch();
		if($.trim(params.serviceID) == ''){
			viewJs.showApiError({error_code:'20201'});
			return;}
		if(typeof(params.offset) !=  "undefined" && params.offset !=  ""){
			courseJs.offset = params.offset;
		}else{
			courseJs.offset = 0;
		}
		params.longitude = dmJs.params.geolocation.longitude;
		params.latitude = dmJs.params.geolocation.latitude;
		this.getServiceByID(params,  this.initServiceDetailInfo);
		if(params.tab == 'wants'){
			var $p = $.mobile.activePage;
			var $el = $(".ui-block-c");
			$(".info,#chapter,#wants").hide();
			$('#result_not_found_container').hide();
			$p.removeClass('not-found');
			$p.find('[tab].sel').removeClass('sel');
			$p.find('[tab="'+$el.attr('tab')+'"]').addClass('sel');
			$("#wants").show();
		}
	},getServiceByID:function(params, callback){
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser != null){
			params.accessToken = currentUser.accessToken;
		}
		dmJs._ajax({url:'/urming_quan/service/getServiceByID',
			params:params,
			id:'getServiceByID',
			callback:callback
		});
	},initServiceDetailInfo:function(data){
        //console.log(data)
        var $p = $.mobile.activePage;
        var me = courseJs;
        //console.log(data)
       // var oImg =new Image();

       // oImg.onload=function(){console.log("img is loaded")};
        //oImg.onerror=function(){alert("error!")};


        var store = data.store;
		var service = data.service;
		var serviceVersion = service.serviceVersion;
		var serviceName = serviceVersion.serviceName;
		var teacherUser = serviceVersion.teacherUser;
		var buyNum = data.buyNum;
		if(typeof(buyNum) == "undefined"){
			buyNum = 0;
		}
		document.title = serviceName;
		var catId = serviceVersion.category.id;
		//var preTitle = "课程";
		//$p.find('.prePageTitle').html(preTitle);
		var newPrice = serviceVersion.newPrice;
		var picUrl = $.trim(serviceVersion.picUrl);
        var serviceDesc = courseJs.typesetting($.trim(serviceVersion.serviceDesc));
		viewJs.formateVideoUrl($p.find('.serviceDesc').html(serviceDesc));
		// 收藏
		$('#storeResult').hide();
		var $store = $('.btn-store');
		if(store != 0){
			$store.addClass('cancel');
		} else {
			$store.removeClass('cancel');
		}
		var picCtr = $('.servicePics');
		picCtr.empty();
		$('.buySvrBtn').data('service', data);
		// 轮播
		var imgs = [];
		var $ctr = $('#course .servicePics');
		if(picUrl !=  ''){
			picUrl = picUrl.split(',');
			var l = picUrl.length,i=0;
			if(l > 1){
				for(i = 0; i < l; i++){
					imgs.push(mainJs.getCoursPicUrl({url:picUrl[i],size:1}));
				}
				
			} else {
				imgs[0] = mainJs.getCoursPicUrl({url:picUrl[0],size:1});
			}
		} else {
            imgs[0] = mainJs.getCoursPicUrl({});
		}
        //oImg.src=imgs[0];
        //console.dir(oImg.height)
        //console.dir(oImg.width)
		viewJs.createSlideImgs(imgs ,$ctr, 'service',{width:480,height:300});

		$('#svrName').html(serviceName);
		dmJs.findCatById(catId, function(cat){
			if(cat != null){
					$('#svrCatName').html(cat.categoryName);
				} else {
					$('#svrCatName').html('未知');
				}
			});
		$('#svrWatchNum').html(service.realViewCount);
		$('#svrCreTime').html(service.creTime);
        if(newPrice){
            $('#svrNewPrice').html(newPrice+'<span class="little">元</span>');
        }else{
            $('#svrNewPrice').hide()
        }

		if(serviceVersion.startTime!=undefined){
			$('#svrCreTime').prev().html("开课时间：");
			$('#svrCreTime').html(serviceVersion.startTime);
		}
		var svrGrade = $('#course .svrGrade');
		// viewJs.setDfReviewNumbers(serviceVersion);
		 viewJs.getReviewCmp(service.reviewNumbers, svrGrade, {serviceID: service.id});
		// 服务提供者
		var $u = $('#course .svrUserInfo');
		var user = serviceVersion.userByUserId;
        //console.log(user)
		var isMoneyGuaranteed = user.isMoneyGuaranteed;
		var isIdcardValidated = user.isIdcardValidated;
		var loginUser = dmJs.sStore.getUserInfo();
		var buySvrBtn = $('#course .buySvrBtn').addClass('enable');
		if(loginUser != null && loginUser.user.id == user.id){
			$('#course .buySvrBtn').addClass('enable').attr('self','').html('编辑');
			buySvrBtn.hide();
			$('#svrSoldNum').html(service.soldNum);
		} else {
			$('.svrSoldNum').hide();
			if(newPrice == 0){
				//buySvrBtn.html('选课');
				buySvrBtn.attr('free', '');
				buySvrBtn.hide();
				if(serviceVersion.online){
					$(".buySvrCtr").append('<span class="freeCourseTitle">免费学习</span>');
				}
			}

			if(buyNum > 0){
				buySvrBtn.html('已选').removeClass("enable");
				//buySvrBtn.hide();
			}

			if(!serviceVersion.online){
				//data.liveTime="2016-04-18 15:50:00";
				$("#svrNewPrice").hide();
                buySvrBtn.hide();
                $(".buySvrCtr").append('<span class="freeCourseTitle">内部课程</span>');
			}
            if(data.courseLive){
                var liveTime = new Date(Date.parse(data.courseLive.liveTime.replace(/-/g, "/"))).getTime();
                //var reminderTime = liveTime - 1000*60*60*1;
                var endTime = new Date(Date.parse(data.courseLive.endTime.replace(/-/g, "/"))).getTime();
                var now = new Date().getTime();
                /*
                 if(now<reminderTime || now>endTime){
                 buySvrBtn.hide();
                 $(".buySvrCtr").append('<span class="freeCourseTitle">内部课程</span>');
                 }else if(now>reminderTime && now<liveTime){
                 */
                if(now<endTime){
                    function start(){
                        var realTime = new Date().getTime();
                        if(realTime>=liveTime){
                            buySvrBtn.attr('live','');
                            buySvrBtn.data('liveID',data.courseLive.liveID);
                            buySvrBtn.data('relatedId', data.courseLive.relatedId);
                            buySvrBtn.html('观看直播').addClass("enable");
                            buySvrBtn.removeClass("live");
                            buySvrBtn.show();
                            $(".freeCourseTitle").hide();
                            clearInterval(t);
                        }else{
                            var difference = liveTime-realTime;
                            //计算出相差天数
                            var days=Math.floor(difference/(24*3600*1000));
                            //计算出小时数
                            var leave1=difference%(24*3600*1000);
                            //计算天数后剩余的毫秒数
                            var hours=Math.floor(leave1/(3600*1000));
                            //计算相差分钟数
                            var leave2=leave1%(3600*1000);
                            //计算小时数后剩余的毫秒数
                            var minutes=Math.floor(leave2/(60*1000));
                            //计算相差秒数
                            var leave3=leave2%(60*1000);
                            //计算分钟数后剩余的毫秒数
                            var seconds=Math.round(leave3/1000);
                            var countdown = (days>0?(days+"天"):"")+(hours>0?((hours<10?("0"+hours):hours)+"时"):"")+(minutes>0?((minutes<10?("0"+minutes):minutes)+"分"):"")+(seconds>0?((seconds<10?("0"+seconds):seconds)+"秒"):"");
                            buySvrBtn.html('直播 倒计时'+countdown).removeClass("enable");
                            buySvrBtn.addClass("live");
                            buySvrBtn.show();
                            $(".freeCourseTitle").hide();
                        }
                    };
                    start();
                    var t=setInterval (start, 1000);
                }
            }

			if(data.courseEnterInfo.needEnter==1){
				if(data.courseEnterInfo.enterStatus==0){
					buySvrBtn.html('报名');
					buySvrBtn.attr('needEnter','');
				}else if(data.courseEnterInfo.enterStatus==2){
					buySvrBtn.html('审核中').removeClass("enable");
				}else if(data.courseEnterInfo.enterStatus==3||data.courseEnterInfo.enterStatus==4){
					buySvrBtn.html('报名结束').removeClass("enable");
				}/*else if(data.courseEnterInfo.enterStatus==4){
					buySvrBtn.html('报名结束').removeClass("enable");
				}*/
				buySvrBtn.show();
				$(".freeCourseTitle").hide();
			}
            if(isIdcardValidated != 1){
                buySvrBtn.attr('notValid','');
            }
		}
		var userTag = user.userTags;
		$u.data('userId', user.id);
		var rankArr = ["","创新预备生","一级创新学员","二级创新学员","三级创新学员","四级创新学员","五级创新学员","六级创新学员"
			,"七级创新学员","八级创新学员","九级创新学员","一级创新导师","二级创新导师","三级创新导师","四级创新导师","五级创新导师",
			"六级创新导师","七级创新导师" ,"八级创新导师","九级创新导师","十级创新导师"];
		var rankTeacherArr = ["","初级创新教练","一级创新教练","二级创新教练","三级创新教练","四级创新教练","五级创新教练","六级创新教练",
			"七级创新教练","八级创新教练","九级创新教练","初级创新导师","一级创新导师","二级创新导师","三级创新导师","四级创新导师",
			"五级创新导师","六级创新导师","七级创新导师","八级创新导师","九级创新导师","师圣"];
		var idcardValidated = 'empty';
		$u.find('.user-rank').text(rankArr[user.rank]);
		if(user.type == 2){
			idcardValidated = user.isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
			var rankStr = "";
			for(var i=0;i<parseInt((user.rank-1)/5);i++){
				rankStr+='<img src="resource/images/icon_diamond_img.png"/>';
			}
			for(var i=0;i<parseInt((user.rank-1)%5);i++){
				rankStr+='<img src="resource/images/icon_star_img.png"/>';
			}
			$u.find('.user-rank').html(rankStr);
		} else if(user.isTeacherValidated == 1 || user.type == 3){
			idcardValidated = user.isIdcardValidated == 1?'teacher':'unauthorized-teacher';
			$u.find('.user-rank').text(rankTeacherArr[user.rank]);
		}else if(user.isIdcardValidated == 1){
			idcardValidated = 'person';
		}
		$u.find('.svrUserName').html([user.realname,
							'<span class="mark idcardValidated ',idcardValidated,'"></span>'/*,
							'<span class="mark bank ',(isMoneyGuaranteed == 1 ? 'validateBankCardOK' : ''),'"></span>'*/].join(''));

		$u.find('>img').attr('src', mainJs.getProfilePicUrl({url:user.profileImageUrl, sex:user.sex}));
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
		if(teacherUser!=undefined && teacherUser.id!=undefined){
			$("#svrUserName").html(user.realname);
			$(".prePageTitle").html('授课教师');
			$("#svrUserName").parent().show();
			var userTag = teacherUser.userTags;
			$u.data('userId', teacherUser.id);
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
		}else{
			$("#svrUserName").parent().hide();
		}
		var me = courseJs;
		//hw
		var opt={
			dataKey:'chapters',
            paperTpl:'',
            $content:$('#chapter'),
            offset:0
		}
		opt.itemParser = me.formatChapterItem;
        opt.tpl = $('#chapter_item_tpl').html();
		viewJs.parseList(data, opt);
		if(typeof(service.videoid) == "undefined" || service.videoid == ""){
			$ctr.show();
			$("#id_video_container").hide();
		}else{
			courseJs.play(service.videoid,service.streamUrl,"0");
		}
		$(".chapter").attr("data-buynum",buyNum);
		$(".content").attr("data-buynum",buyNum);
		me.recommendWantsByData(data);
		//hw
		// 服务描述
		var $f = $('#course .svrUserFooter');
		me.initConcatFooter($f,user.realname, user.contactPhone);
	},formatChapterItem:function(item, opt){
		var info = {};
		info.id = item.id;
		info.title = item.title;
		info.content = item.content;
		var loginUser = dmJs.sStore.getUserInfo();
		if(item.free){
			info.free = '<span style="background:#E7A71C;border-radius:10px;padding:0 5px;margin-left:5px;">免费</span>';
		}else{
			info.free = "";
		}
		if(item.videoid != undefined){
			info.videoid = item.videoid;
		}else{
			//没有视频
			info.videoid = '0';
		}
		if(typeof(item.content)=='undefined' || item.content==''){
			info.chapterwidth = '98';
			info.chapterpadding = '0';
			info.contentwidth = 'display:none';
		}else{
			info.chapterwidth = '85';
			info.chapterpadding = '12';
			info.contentwidth = 'width:10.7%';
		}
		if(item.effectivetime != undefined){
			if(new Date().getTime()>courseJs.getEffectivetime(item.effectivetime)){
				if(item.videoid != undefined && item.videoid!=''){
					info.images = 'play_show.png';
				}else{
					info.images = 'doc_show.png';
				}
			}else{
				if(item.videoid != undefined && item.videoid!=''){
					if(/*item.free || */$('#course .buySvrBtn').html()=='编辑' || (loginUser && loginUser.user.id==$('#course .svrUserInfo').data('userId'))){
						info.images = 'play_show.png';
					}else{
						info.images = 'play.png';
					}
				}else{
					if(/*item.free || */$('#course .buySvrBtn').html()=='编辑' || (loginUser && loginUser.user.id==$('#course .svrUserInfo').data('userId'))){
						info.images = 'doc_show.png';
					}else{
						info.images = 'doc_normal.png';
					}
				}
			}
			info.effectivetime = item.effectivetime;
		}else{
			info.effectivetime = '0';
			if(item.videoid != undefined && item.videoid!=''){
				info.images = 'play_show.png';
			}else{
				info.images = 'doc_show.png';
			}
		}
		info.freedata = item.free;
		return info;
	},typesetting:function(str){
		if(str == null){
			return '';
		}
		return '&nbsp;&nbsp;&nbsp;'+(str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
	},initConcatFooter:function($f, realname, contactPhone){
		if(true){//!dmJs.hasLogin()
			$f.hide();
			return;
		} else {
			$f.show();
		}
        var dispPhone = $.trim(contactPhone);
        dispPhone = dispPhone.substring(0, dispPhone.length-4)+'****';
        var info = {realname:realname,contactPhone:dispPhone};
        if(dmJs.isAndroid){
            info.phoneScheme = "wtai://wp/mc;"+contactPhone;
        } else{
            info.phoneScheme = "callto:"+contactPhone;
        }
        var tpl = $('#contract_footer_tpl').html();
        $f.html(viewJs.applyTpl(tpl, info));
        setTimeout(function(){
            $f.find('.usePhone').css('display', 'inline-block');
        },500);
        return;
	},buyFreeSvr:function(options){
		var url = mainJs.getApiUrl('/urming_quan/service/order');
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null){
			viewJs.showPopMsg('请登录后操作！');
		}
		var params = {buyNumber:1,serviceVersionID:options.serviceVersionID};
		params.accessToken = currentUser.accessToken;
		var currentParams = mainJs.parseUrlSearch();
		params.serviceID = currentParams.serviceID;
		/*
		dmJs._ajax({
			id:'buyFreeSvr',
			url:'/urming_quan/service/order',
			params:params,
			accessInvalid:function(){
				dmJs.sStore.toLogin({url:'./course.html',id:'course',options:{data:currentParams}});
			},callback:function(data){
				var serviceCartID = data.serviceCartID;
				// 使用余额支付
				dmJs._ajax({
					id:'buySuc',
					url:'/urming_quan/service/buySuc',
					params:{accessToken:params.accessToken, serviceCartID:serviceCartID},
					accessInvalid:function(){
						dmJs.sStore.toLogin({url:'./course.html',id:'course',options:{data:currentParams}});
					},callback:function(){
						viewJs.dialogPop('感谢您的参与', null, null, {onlyBtnOk:true});
					}
				});
			}});
			*/
		var me = courseJs;
		var res;
		/*
		$.ajax(mainJs.getApiUrl('/urming_quan/service/buyFreeCourse'),params , function(data, statusText, jqhr){
				var res = $.parseJSON(data);
				if(typeof(res.error_code)!="undefined"){
					viewJs.showApiError(res);
				}else{
					$(".chapter").attr("data-buynum",1);
					$(".content").attr("data-buynum",1);
					b = true;
				}
			}
		).error(function(){
				viewJs.showPopMsg('网络错误');
				viewJs.delayCancelBusy(me._data);
		});
		*/
		$.ajax({
			type: "post",
			url: mainJs.getApiUrl('/urming_quan/service/buyFreeService'),
			data: params,
			dataType: "json",
			async: false,
			success: function(data){
				if(typeof(data.error_code)!="undefined"){
					viewJs.showApiError(data);
				}else{
					$(".chapter").attr("data-buynum",1);
					$(".content").attr("data-buynum",1);
					res = data.data;
					$('#course .buySvrBtn').addClass('enable').html('已购买').removeClass("enable");
					$('#course .buySvrBtn').remove();
				}
			}
		});
		return res;
	},getVideoID:function(){
        var me = courseJs;
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null){
			dmJs.sStore.toLogin({url:'./course.html', options:{data:mainJs.parseUrlSearch()}});
		} else {
			var $m = $(this);
			var chaterID = $m.attr('data-chapterid');
			var buyNum = $m.attr('data-buynum');
			var freeData = $m.attr('data-free');
			var videoid = $m.attr('data-videoid');
			var effectivetime = $m.attr('data-effectivetime');
			if((videoid==undefined || videoid==0)){
				viewJs.showPopMsg('该章节无视频,请点击下拉获取章节内容！');
				return;
			}
			var yesterdayTime = courseJs.getEffectivetime(effectivetime);
			var yesterday=new Date();
			yesterday.setTime(yesterdayTime);
			if(new Date().getTime()<yesterdayTime/* && freeData=='false'*/ && $('#course .buySvrBtn').html()!='编辑' && currentUser.user.id!=$('#course .svrUserInfo').data('userId')){
				viewJs.showPopMsg('该章节将于'+yesterday.getFullYear()+'-'+(yesterday.getMonth()+1)+'-'+yesterday.getDate()+' 19点开启,敬请期待');
				return;
			}
			if(buyNum<1 && $('#course .buySvrBtn').html()!='编辑' && currentUser.user.id!=$('#course .svrUserInfo').data('userId')){
				//viewJs.dialogPop('购买后才能观看！', null, null, {onlyBtnOk:true});
				if($('#course .buySvrBtn').is('[free]')){
					var service = $('#course .buySvrBtn').data('service').service;
					var svrVer = service.serviceVersion;
					var params = {serviceID:service.id, price:svrVer.newPrice, serviceVersionID:svrVer.id,serviceName:svrVer.serviceName,catId:service.serviceVersion.category.category.id,isvirtualcurr:service.isvirtualcurr};
					var me = courseJs;
					if(!me.buyFreeSvr(params)){
						return;
					}
				}else if(freeData=='false'){
					viewJs.showPopMsg('购买后才能观看！');
					return;
				}
			}

			$.ajax({
				type: "post",
				url: mainJs.getApiUrl('/urming_quan/service/getVideoID'),
				data: {"chaterID":chaterID,"accessToken":dmJs.getAccessToken()},
				dataType: "json",
				async: false,
				success: function(data){
                    //console.log(data)
					if(typeof(data.error_code)!="undefined"){
						viewJs.showApiError(data);
					}else{
                        //console.log(1)
						courseJs.play(videoid,data.streamUrl,"1");



					}
				}
			});
            if(buyNum>0){
                var paramsPro={
                    accessToken:currentUser.accessToken,
                    chapterID:chaterID
                };
                //console.log(paramsPro)
                dmJs._ajax({
                    id:'addChapterProgress',
                    url:'/urming_quan/service/addChapterProgress',
                    params:paramsPro,
                    callback:function(data1){
                        console.log(data1)
                    },error:function(res){
                        console.log(res)
                    }
                });
            }
			$(".chapter").css("background-color","#fff");
			$("#chapter"+chaterID).css("background-color","#6CA9ED");
			/*
			var params={
				accessToken:currentUser.accessToken,
				chaterID:chaterID
			};
			$.post(mainJs.getApiUrl('/urming_quan/service/getVideoID'),params , function(data, statusText, jqhr){
					var res = $.parseJSON(data); 
					if(typeof(res.error_code)!="undefined"){
						if(res.error_code=="20254"){
							//viewJs.dialogPop('购买后才能观看！', null, null, {onlyBtnOk:true});
							viewJs.showPopMsg('购买后才能观看！');
						}else{
							viewJs.showApiError(res);
						}
					}else{
						courseJs.play(res.videoID,"1");
						$(".chapter").css("background-color","#fff");
						$("#chapter"+chaterID).css("background-color","#6CA9ED");
					}
				}
			).error(function(){
				viewJs.showPopMsg('网络错误');
				viewJs.delayCancelBusy(me._data);
			});*/
		}
	},play:function(videoID,url,status){

        //console.log(arguments)
		$('#course .servicePics').hide();
		$("#id_video_container").show();
		$('body,html').animate({scrollTop:0},1000);
		//alert(status);
		var player = new qcVideo.Player(
			//页面放置播放位置的元素 ID
			"id_video_container",
			{
				//视频 ID (必选参数)
				"file_id": videoID,
				//应用 ID (必选参数),同一个账户下的视频,该参数是相同的
				"app_id": "1251442472",
				//是否自动播放 默认值0 (0: 不自动,1: 自动播放)
				"auto_play": status,
				//播放器宽度,单位像素
				"width": Math.min(Math.floor($(window).width()*1.35),650),
				//播放器高度,单位像素
				"height": 336,
				//屏蔽全屏播放标识,默认值0 (0: 支持全屏播放,1: 禁用全屏播放)
				"disable_full_screen": 0,
				//禁止拖动标识,默认值0 (0: 允许拖拽,1: 禁止拖拽)
				"disable_drag":0,
				//如视频尺寸小于播放器尺寸,拉伸视频至播放器大小,默认值0 (0: 不拉伸,1: 拉伸全屏)
				"stretch_full":0,
				//"stop_time": 60,//60秒后停止播放(试看功能) , 并且触发"playStatus"事件
				"remember": 1 ,//1:记住上一次未看完的时间点,下次再播放,从该时间点开始播放
				//开启防盗链后,可以通过配置下面的可访问的视频地址,支持播放器播放；清晰度类型通过 url 与后台查出的 url 前缀匹配得到
				"playbackRate": 1,//加速播放,譬如 2,表示2倍速度播放, 1/2表示慢正常速度一倍播放, 注意这个值暂时只对 h5播放生效;
				"hide_h5_setting": true,//隐藏 h5的设置按钮 ,默认不隐藏,true 为隐藏
				"videos": [
					url
				],
				//注意,下面所有的地址必须是上面对应的 file_id 的视频资源地址,否则不会生效
				"WMode": "window",//默认 window 不支持其他页面元素覆盖在上面,如需要可以修改为 opaque 或其他 flash Vmode 的参数值
				"stretch_patch": false//默认为 false ,设置为 true 支持将开始、暂停、结束时的图片贴片,铺满播放器
			},
			{
				//全屏/退出全屏操作 ,isFullScreen: true全屏 ; false 退出全屏
				'fullScreen': function(isFullScreen){
				//console.debug('out listener isFullScreen == ',isFullScreen);
				},
				//播放状态
				'playStatus': function(status){
					/*status 可为 {ready: "播放器已准备就绪",seeking:"搜索",
					 suspended:"暂停", playing:"播放中" , playEnd:"播放结束" , stop: "试看
					 结束触发"}'*/
					//console.debug('out listener status == ',status);
				},
					//拖动播放位置变化 ； second 拖动播放的位置（单位秒）
				'dragPlay': function(second){
					//console.debug('out listener dragPlay == ',second);
				}
			}
		);
        /*setTimeout(function(){
            player.play(0)
        },700)*/

        /*var $p = $.mobile.activePage;
        setTimeout(function(){
            $p.find('.trump-play-controller').get().click();
        },20)*/

		/*qcVideo.use("startup", function (mod) {
			var option ={"auto_play":status,"file_id":videoID,"app_id":"1251442472","width":window.screen.width>480?480:window.screen.width,"height":336};
			mod.start(
				"id_video_container",
				option
			);
		});*/
		//$("#id_video_container").empty();
		//$("#id_video_container").append('<iframe id="video" name="video" src="http://play.video.qcloud.com/iplayer.html?$appid=1251442472&$fileid='+videoID+'&$autoplay='+status+'&$sw='+(window.screen.width>480?480:window.screen.width)+'&$sh=250" frameborder="0" width="'+(window.screen.width>480?480:window.screen.width)+'" height="250" scrolling="no"></iframe>');
	},toggleContent:function(){
		var $m = $(this);
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null){
			dmJs.sStore.toLogin({url:'./course.html', options:{data:mainJs.parseUrlSearch()}});
		} else {
			var chaterID = $m.attr('data-chapterid');
			var buyNum = $m.attr('data-buynum');
			var freeData = $m.attr('data-free');
			var effectivetime = $m.attr('data-effectivetime');
			var yesterdayTime = courseJs.getEffectivetime(effectivetime);
			var yesterday=new Date();
			yesterday.setTime(yesterdayTime);
			if(new Date().getTime()<yesterdayTime/* && freeData=='false'*/ && $('#course .buySvrBtn').html()!='编辑' && currentUser && currentUser.user.id!=$('#course .svrUserInfo').data('userId')){
				viewJs.showPopMsg('该章节将于'+yesterday.getFullYear()+'-'+(yesterday.getMonth()+1)+'-'+yesterday.getDate()+' 19点开启,敬请期待');
				return;
			}
			if(buyNum<1 && $('#course .buySvrBtn').html()!='编辑' && currentUser && currentUser.user.id!=$('#course .svrUserInfo').data('userId')){
				//viewJs.dialogPop('购买后才能查看课程详情！', null, null, {onlyBtnOk:true});
				if($('#course .buySvrBtn').is('[free]')){
					var service = $('#course .buySvrBtn').data('service').service;
					var svrVer = service.serviceVersion;
					var params = {serviceID:service.id, price:svrVer.newPrice, serviceVersionID:svrVer.id,serviceName:svrVer.serviceName,catId:service.serviceVersion.category.category.id,isvirtualcurr:service.isvirtualcurr};
					var me = courseJs;
					if(!me.buyFreeSvr(params)){
						return;
					}
				}else{
					viewJs.showPopMsg('购买后才能查看课程详情！');
					return;
				}
			}


            if(buyNum>0){
                var paramsPro={
                    accessToken:currentUser.accessToken,
                    chapterID:chaterID
                };
                //console.log(paramsPro)
                dmJs._ajax({
                    id:'addChapterProgress',
                    params:paramsPro,
                    url:'/urming_quan/service/addChapterProgress',
                    callback:function(data1){

                    },error:function(){
                    }
                });
            }
			$("#content"+chaterID).slideToggle(500);
			$("#content_down"+chaterID).toggle();
			$("#content_up"+chaterID).toggle();
		}
	},orientationchange:function(){
		switch(window.orientation) {
			case 0:
			case 180:
				break;
			case -90:
			case 90:
				break;
		}
	},recommendWants: function () {
		var me = courseJs;
		var tags =  '';
		$(".tagItem .tagName").each(function(i){
			tags += $(this).text();
			if(i < $(".tagItem .tagName").length-1){
				tags += ",";
			}
		});
		var $p = $.mobile.activePage;
		var params= {
			keyword:$("#svrName").text(),
			tagName:tags,
			offset:courseJs.offset,
			pageSize:'5',
			longitude:dmJs.params.geolocation.longitude,
			latitude:dmJs.params.geolocation.latitude
		}
		$.post(mainJs.getApiUrl('/urming_quan/search/getRecommendWants'),params , function(data, statusText, jqhr){
				var res = $.parseJSON(data);
				if(res.error != null){
					viewJs.showApiError(res);
					return;
				}
				var opt = {
					dataKey:'datas',
					paperTpl:'',//$('#paper_tpl').html(),
					$content:$p.find('#recommendWantsList'),
					offset:courseJs.offset || 0,
					itemParser : me.formatWantItem,
					tpl : $('#recommendWant_item_tpl').html()
				};

				var d =res.datas;
				var i = 0, l = d.length;

				viewJs.parseList(res, opt);
				//viewJs.delayCancelBusy(me._data);

				/*去掉分页
				var html = [];
				if(l > 0){
					var total = res.total;
					var _PAGE_SIZE = 5;
					var pageInfo = {};
					pageInfo.hasPre = courseJs.offset > 0 ? '' : 'disabled';
					pageInfo.hasNext = (courseJs.offset+_PAGE_SIZE) < total ? '' : 'disabled';
					var pageCurrent = Math.ceil(courseJs.offset/_PAGE_SIZE+0.1);
					pageInfo.pagePre = pageCurrent-1;
					pageInfo.pageNext = pageCurrent+1;
					pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
					html.push(viewJs.applyTpl($('#paper_tpl').html(), pageInfo));
				}
				$p.find('#recommendWantsList').append(html.join(''));
				*/
				if(res.total>0){
					$(".msg_num").css('display','inline-block');
					$(".msg_num").html(res.total>5?5:res.total);
				}
			}
		).error(function(){
				viewJs.showPopMsg('网络错误');
				viewJs.delayCancelBusy(me._data);
			});

	},recommendWantsByData: function (res) {
		var me = courseJs;
		var $p = $.mobile.activePage;
		var opt = {
			dataKey:'recommendWants',
			paperTpl:'',//$('#paper_tpl').html(),
			$content:$p.find('#recommendWantsList'),
			itemParser : me.formatWantItem,
			tpl : $('#recommendWant_item_tpl').html()
		};
		var d =res.recommendWants;
		viewJs.parseList(res, opt);
		var l = d.length;
		if(l>0){
			$(".msg_num").css('display','inline-block');
			$(".msg_num").html(l>5?5:l);
		}
	},formatWantItem:function(item, opt){
		return item;
	},getEffectivetime:function(t){
		var yesterday_milliseconds=new Date(Date.parse(t.replace(/-/g, "/"))).getTime()-1000*60*60*24;
		var yesterday=new Date();
		yesterday.setTime(yesterday_milliseconds);
		var date = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 19, 0, 0);
		return date.getTime();
	}
};

