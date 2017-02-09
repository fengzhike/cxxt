serviceJs = {
	init:function(){
		if(mainJs.parseUrlSearch().serviceID==17834){
			//viewJs.navigator.next({
			//	next:{url:'./jinDaoLecture.html', id:'jinDaoLecture'},
			//	lastAuto:false
			//});
			window.location.href="http://m.edu.euming.com/jinDaoLecture.html";
			return;
		}
		this.initData();
		this.toggleEvents(true);
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
			$("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
				'<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
		}
	},toggleEvents:function(isBind){
		var me = serviceJs;
		var $p = $.mobile.activePage;
		$p.undelegate();
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
                $p.delegate('.lang_turn','vclick',function(){
                    var lang = sessionStorage.getItem('lang');
                    if(lang == 'en'){
                        sessionStorage.setItem('lang','cn');
                    }else{
                        sessionStorage.setItem('lang','en')
                    }
                    setTimeout(function(){
                        window.location.href = location
                    },100)
                });
			},500);
		}
	},showOringeImg:function(){
        var $p = $.mobile.activePage;
        var oriImgArr = [];
        var iw = $p.find('.ui-content').outerWidth()+'px';
        $p.find('.slide.slider.item').each(function(i,item){
            oriImgArr[i]= $(item).css('background-image').split('(')[1].split(')')[0];
        });
        //alert(oriImgArr[0])
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
        $p.find('.servicePicsCtr').append($(htl));
        var numPic=0;
        $p.find('.show_pic11').on( 'swipeleft',function(){
            swipe('left');
        });
        $p.find('.show_pic11').on( 'swiperight',function(){
            swipe('right');
        });
        function swipe(direction){
            var me = serviceJs;
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
    },playVoice:function(){
		$(this).siblings('audio')[0].play();
	},toSvrUserInfo:function(){
		var $el = $(this),userId = $el.data('userId');
		if(userId != null){
			viewJs.navigator.next({
					next:{url:'./u.html', id:'u',
						options:{
							data:{userId:userId}
						}
                    },
					lastAuto:true
			});
		}
	},toSvrReviewsDetail:function(){
		var params = mainJs.parseUrlSearch();
		var $m = $(this);
		var reviewNumbers = $m.data('reviewNumbers');
		var extra = $m.data('extra');
        //console.log(extra)
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
				dmJs.sStore.toLogin({href:'./service.html',id:'service', options:{data:{serviceID:serviceID}}});
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
		var me = serviceJs;
		var $p = $.mobile.activePage;
		var $b = $(this);
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null && !$b.is('[live]')){
			dmJs.sStore.toLogin({url:'./service.html', options:{data:mainJs.parseUrlSearch()}});
		}/*else if(typeof(currentUser.user.mobile) == 'undefined' || currentUser.user.mobile == ''){
			viewJs.dialogPop('绑定手机号才能购买！', function(res){
				if(res){
					viewJs.navigator.next({next:{url:'./bindMobile.html', id:'bindMobile'},lastAuto:true});
				}
			});
		}*/ else {
			var service = $b.data('service');
			if(service != null){
				var service = service.service;

				if($b.is('[live]')){
                    var sLiveHref =window.location.href.replace(/service/,'liveCast2').split('?')[0]+'?actId='+$b.data("liveID")+'&serviceID='+$b.data("relatedId");
                    window.location.href = sLiveHref;
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
                    viewJs.dialogPop('该服务提供者还没有经过身份认证，购买需要谨慎哦！',function(ret){
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
				var params = {serviceID:service.id, price:svrVer.newPrice, serviceVersionID:svrVer.id,serviceName:svrVer.serviceName,catId:service.serviceVersion.category.category.id};
				 if($b.is('[free]')){
					 var data = me.buyFreeSvr(params);
					 if(data){
						 viewJs.navigator.next({
							 next:{url:'./buyorderDetail.html', id:'buyorderDetail',
								 options:{
									 data:{serviceOwnID:data.id,userType:1}
								 }},
							 last:{
								 url:'./service.html', id:'service',
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
								 url:'./service.html', id:'service',
								 options:{data:mainJs.parseUrlSearch()}
							 },
							 lastAuto:false
						 });
						 */
					 }
					 return;
				 }
				viewJs.navigator.next({
					next:{url:'./submitOrder.html', id:'submitOrder',
						options:{
							data:params
						}},
					last:{
						url:'./service.html', id:'service',
						options:{data:mainJs.parseUrlSearch()}
					},
					lastAuto:false
				});
			}
		}
	},initData:function(){
			if(!(/service/.test(location.href))){
				return;
			}
			var params = mainJs.parseUrlSearch();
			if($.trim(params.serviceID) == ''){
				viewJs.showApiError({error_code:'20201'});
				return;
			}
			this.getServiceByID(params,  this.initServiceDetailInfo);
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
		var store = data.store;
		var service = data.service;
		var serviceVersion = service.serviceVersion;
		var serviceName = serviceVersion.serviceName;
        //fsk
        var isBigSai =/2016大赛/.test(serviceVersion.tags);



		document.title = serviceName;
		var catId = serviceVersion.category.category.id;
		var buyNum = data.buyNum;
		if(typeof(buyNum) == "undefined"){
			buyNum = 0;
		}
		var preTitle = "服务";
		if(catId==3){
			preTitle = "课程";
		} else if(catId==4){
			preTitle = "活动";
		} else if(catId==6){
			preTitle = "答案";
		}
        //fsk
        if(isBigSai){
            preTitle = '参赛项目';
        }
		$p.find('.prePageTitle').html(preTitle);
		var newPrice = serviceVersion.newPrice;
		var picUrl = $.trim(serviceVersion.picUrl);
        var serviceDesc = serviceJs.typesetting($.trim(serviceVersion.serviceDesc));
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
        //console.log(picUrl+111);
		var $ctr = $('#service .servicePics');
		if(picUrl !=  ''){
			picUrl = picUrl.split(',');
			var l = picUrl.length,i=0;
			if(l > 1){
				for(i = 0; i < l; i++){
					imgs.push(mainJs.getSvrPicUrl({url:picUrl[i],size:1}));
				}
				
			} else {
				imgs[0] = mainJs.getSvrPicUrl({url:picUrl[0],size:1});
			}
		} else {
            if(isBigSai){
                imgs[0] = mainJs.getSvrPicUrl({},true);
            }else{
                imgs[0] = mainJs.getSvrPicUrl({});
            }

		}
		viewJs.createSlideImgs(imgs ,$ctr, 'service',{width:480,height:300});
		//
		$('#svrName').html(serviceName);
		dmJs.findCatById(serviceVersion.category.id, function(cat){
			if(cat != null){
					$('#svrCatName').html(cat.categoryName);
				} else {
					$('#svrCatName').html('未知');
				}
			});
		$('#svrWatchNum').html(service.realViewCount);
		$('#svrCreTime').html(service.creTime);
		if(serviceVersion.address){
			$('#address').html(serviceVersion.address);
		}else{
			$('#address').parent().hide();
		}
		if(serviceVersion.startTime){
			$('#startTime').html(serviceVersion.startTime);
		}else{
			$('#startTime').parent().hide();
		}
		$('#svrNewPrice').html(newPrice+'<span class="little">元'+((serviceVersion.unit==undefined || serviceVersion.unit=='')?'':('/'+serviceVersion.unit))+'</span>');
		var svrGrade = $('#service .svrGrade');
		// viewJs.setDfReviewNumbers(serviceVersion);
		 viewJs.getReviewCmp(service.reviewNumbers, svrGrade, {serviceID: service.id});
		// 服务提供者
		var $u = $('#service .svrUserInfo');
		var user = serviceVersion.userByUserId;
		var isMoneyGuaranteed = user.isMoneyGuaranteed;
		var isIdcardValidated = user.isIdcardValidated;
		var userType = user.type == 1 ?  'person' : 'enterprise';
		var loginUser = dmJs.sStore.getUserInfo();
		if(loginUser != null && loginUser.user.id == user.id){
			$('#svrSoldNum').html(service.soldNum);
			if(serviceVersion.online){
				$('#service .buySvrBtn').addClass('enable').attr('self','').html('编辑');
			}else{
				$('#service .buySvrBtn').hide();
			}
		} else {
			var buySvrBtn = $('#service .buySvrBtn').addClass('enable');
			$('.svrSoldNum').hide();
			if(newPrice == 0 && catId == 1){
				buySvrBtn.html('领取').attr('free', '');
				if(buyNum > 0){
					buySvrBtn.html('已领取').removeClass("enable");
				}
			}
			
			if(catId == 4){
				buySvrBtn.html('参与');
				$(".svrSold").html('报&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：');
				if(newPrice == 0){
					buySvrBtn.attr('free', '');
					$("#svrNewPrice").hide();
				}
				if(newPrice == 0 && buyNum > 0){
					buySvrBtn.html('已参与').removeClass("enable");
				}
			}

			if(serviceVersion.category.id==98){
				buySvrBtn.html('支持');
			}
			if(service.id==18782){
				$p.find(".buySvrCtr").hide();
			}

			if(data.courseLive) {
                var liveTime = new Date(Date.parse(data.courseLive.liveTime.replace(/-/g, "/"))).getTime();
                //var reminderTime = liveTime - 1000*60*60*1;
                var endTime = new Date(Date.parse(data.courseLive.endTime.replace(/-/g, "/"))).getTime();
				var now = new Date().getTime();
				if (now < endTime) {
					function start() {
						var realTime = new Date().getTime();
						if (realTime >= liveTime) {
                            //console.log(data.courseLive)
							buySvrBtn.attr('live', '');
							buySvrBtn.data('liveID', data.courseLive.liveID);
							buySvrBtn.data('relatedId', data.courseLive.relatedId);
							buySvrBtn.html('观看直播').addClass("enable");
							buySvrBtn.removeClass("live");
							clearInterval(t);
						} else {
							var difference = liveTime - realTime;
							//计算出相差天数
							var days = Math.floor(difference / (24 * 3600 * 1000));
							//计算出小时数
							var leave1 = difference % (24 * 3600 * 1000);
							//计算天数后剩余的毫秒数
							var hours = Math.floor(leave1 / (3600 * 1000));
							//计算相差分钟数
							var leave2 = leave1 % (3600 * 1000);
							//计算小时数后剩余的毫秒数
							var minutes = Math.floor(leave2 / (60 * 1000));
							//计算相差秒数
							var leave3 = leave2 % (60 * 1000);
							//计算分钟数后剩余的毫秒数
							var seconds = Math.round(leave3 / 1000);
							var countdown = (days > 0 ? (days + "天") : "") + (hours > 0 ? ((hours < 10 ? ("0" + hours) : hours) + "时") : "") + (minutes > 0 ? ((minutes < 10 ? ("0" + minutes) : minutes) + "分") : "") + (seconds > 0 ? ((seconds < 10 ? ("0" + seconds) : seconds) + "秒") : "");
							buySvrBtn.html('直播 倒计时' + countdown).removeClass("enable");
							buySvrBtn.addClass("live");
						}
					};
					start();
					var t = setInterval(start, 1000);
				}
			}
            if(isIdcardValidated != 1){
                buySvrBtn.attr('notValid','');
            }
		}
        if(isBigSai){
            var lang = sessionStorage.getItem('lang');
            var pubData = lang == 'en'? serviceEnJs:serviceCnJs;
            //console.log(pubData.buy)
            $('#service .buySvrBtn').html(pubData.buy);
            $('.ui-title').html('<span class="prePageTitle">'+pubData.title+'</span>');
            $p.find('.toCitylist').hide()
            $p.find('.lang_turn').html(pubData.turnLang)
            //$p.find('.btn-store').html(pubData.collect)
            $p.find('#svrCatName').prev().html(pubData.categories )
            $p.find('#svrCreTime').prev().html(pubData.creTime )
            $p.find('.reviewNumbers').html(pubData.reviewNumbers )
            $p.find('.svrUser .svrVTitle').html(pubData.provider)
            $p.find('div.svrDetail .svrVTitle').html(pubData.svrDetail)
            $p.find('.svrReport .reportBt').html(pubData.report)
            $p.find('a.ui-btn.ui-icon-back.logout').html(pubData.exit)
            $p.find('.lang_turn').html(pubData.turnLang)
            $p.find('.svrUserFooter').html(pubData.turnLang)


        }
		var userTag = user.userTags;
		$u.data('userId', user.id);
		var idcardValidated = 'empty';
		var rankArr = ["","创新预备生","一级创新学员","二级创新学员","三级创新学员","四级创新学员","五级创新学员","六级创新学员"
			,"七级创新学员","八级创新学员","九级创新学员","一级创新导师","二级创新导师","三级创新导师","四级创新导师","五级创新导师",
			"六级创新导师","七级创新导师" ,"八级创新导师","九级创新导师","十级创新导师"];
		$u.find('.user-rank').text(rankArr[user.rank]);
		if(user.type == 2){
			idcardValidated = user.isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
			var rankArr = "";
			for(var i=0;i<parseInt((user.rank-1)/5);i++){
				rankArr+='<img src="resource/images/icon_diamond_img.png"/>';
			}
			for(var i=0;i<parseInt((user.rank-1)%5);i++){
				rankArr+='<img src="resource/images/icon_star_img.png"/>';
			}
			$u.find('.user-rank').html(rankArr);
		} else if(user.isTeacherValidated == 1 || user.type == 3){
			idcardValidated = user.isIdcardValidated == 1?'teacher':'unauthorized-teacher';
			var rankTeacherArr = ["","初级创新教练","一级创新教练","二级创新教练","三级创新教练","四级创新教练","五级创新教练","六级创新教练",
				"七级创新教练","八级创新教练","九级创新教练","初级创新导师","一级创新导师","二级创新导师","三级创新导师","四级创新导师",
				"五级创新导师","六级创新导师","七级创新导师","八级创新导师","九级创新导师","师圣"];
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
		// 服务描述
		var me = serviceJs;
		var $f = $('#service .svrUserFooter');
		//me.initConcatFooter($f,user.realname, user.contactPhone);
		me.initConcatFooter($f,user.realname, serviceVersion.contactContent, serviceVersion.contactType);
 },typesetting:function(str){
		if(str == null){
			return '';
		}
		return '&nbsp;&nbsp;&nbsp;'+(str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
 },initConcatFooter:function($f, realname, contactContent,contactType){
		if(false){//!dmJs.hasLogin()
			$f.hide();
			return;
		} else {
			$f.show();
		}
        //var dispPhone = $.trim(contactContent);
        //dispPhone = dispPhone.substring(0, dispPhone.length-4)+'****';
		var contactTypeList = ["电话","邮箱","微信"];
		var contactTypeString = (contactType>-1?contactTypeList[contactType]+":":"")+(contactType==0?('<a href="tel:'+contactContent+'" style="color: rgb(41, 114, 249);text-decoration: none;">'+contactContent+'</a>'):contactContent);
		var info = {realname:realname,contactContent:contactTypeString};
        if(dmJs.isAndroid){
            info.phoneScheme = "wtai://wp/mc;"+contactContent;
        } else{
            info.phoneScheme = "callto:"+contactContent;
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
				dmJs.sStore.toLogin({url:'./service.html',id:'service',options:{data:currentParams}});
			},callback:function(data){
				var serviceCartID = data.serviceCartID;
				// 使用余额支付
				dmJs._ajax({
					id:'buySuc',
					url:'/urming_quan/service/buySuc',
					params:{accessToken:params.accessToken, serviceCartID:serviceCartID},
					accessInvalid:function(){
						dmJs.sStore.toLogin({url:'./service.html',id:'service',options:{data:currentParams}});
					},callback:function(){
						viewJs.dialogPop('感谢您的参与', null, null, {onlyBtnOk:true});
					}
				});
			}});
		*/
		var res;
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
					res = data.data;
					$('#service .buySvrBtn').addClass('enable').html('已购买').removeClass("enable");
				}
			}
		});
		return res;
	}
};