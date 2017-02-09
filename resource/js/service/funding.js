fundingJs = {
	offset:0,
	init:function(){
        var $p = $.mobile.activePage;
		this.initData();
		this.toggleEvents(true);
		if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
			$("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
				'<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
		}
        viewJs.setRem($p);
	},toggleEvents:function(isBind){
		var me = fundingJs;
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
				$p.delegate('.progress_box .cancle','vclick', me.delCrowdfundingProgress);
                $p.delegate('.action', 'vclick', me.doAction);
                $p.delegate('.pic_list img', 'vclick',function(){
                    setTimeout(function(){
                        me.showOringeImg();
                    },100)
                });
                $p.delegate('.disapear', 'vclick',function(){
                    setTimeout(function(){
                        $('#showOringeImg_box').remove();
                    },200)

                });

                $p.delegate('#pro_prograss .add_pro', 'vclick',me.toAddPro);
			},500);
		}
		$(window).on("orientationchange",me.orientationchange);
	},touchSlide:function(params){
        var me = fundingJs;
        $.getScript("resource/js/move/TouchSlide.1.1.js")
            .done(function() {
                /* 耶，没有问题，这里可以干点什么 */
                me.getServiceByID(params,me.initServiceDetailInfo)
            })
            .fail(function() {
                /* 靠，马上执行挽救操作 */
            });
    },showOringeImg:function(){
        var $p = $.mobile.activePage;
        var oriImgArr = [];
        var iw = $p.find('.ui-content').outerWidth()+'px';
        //console.log(iw)
        $p.find('.pic_list img').each(function(i,item){
            oriImgArr[i]= $(item).attr('src');
        });
        var l = Math.ceil($('#focus .bd li').length/2);
        /*console.log(oriImgArr)
        console.log(l)*/
        var htl = '<div id="showOringeImg_box">' +
                    '<div class="show_header">' +
                        '<span class="disapear">&lt;</span>' +
                        '<b class="progress">1/'+l+'</b>'+
                    '</div>';

             htl+='<div class="show_content"> ';
                for(var i=0; i< l;i++){
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
            var me = fundingJs;
            direction = direction? direction:'left';
            var iw = $p.find('.ui-content').outerWidth();
            if(direction =='left'){
                numPic ++;
                if(numPic>l-1) numPic = l-1;
                $('.show_pic11').eq(numPic-1).css('left',-iw);
                $('.show_pic11').eq(numPic).css('left','0');
            }else{
                numPic --;
                if(numPic<0 ) numPic = 0;
                $('.show_pic11').eq(numPic+1).css('left',iw);
                $('.show_pic11').eq(numPic).css('left','0');
            }
            $('.progress').html((numPic+1)+'/'+l)
        }
        $p.find('#showOringeImg_box').on('vmousemove',function(e){
            e.preventDefault()
        });
        $('#showOringeImg_box').css('top', $(document).scrollTop()-44);

    },toAddPro:function(){
        var serviceID = mainJs.parseUrlSearch().serviceID;
        viewJs.navigator.next({
            next:{url:'./addProgress.html', id:'addProgress',
                options:{
                    data:{serviceID:serviceID}
                }},
            lastAuto:true
        });
    },delCrowdfundingProgress:function(){
        var $p = $.mobile.activePage;
        var $oLi = $(this).parent().parent();

        var params = {
            id:$oLi.attr('data_id'),
            accessToken:dmJs.getAccessToken()
        }



        setTimeout(function(){
            $oLi.remove();
            var lP = $('.timeline li').length;
            if(lP>0){
                $("div[action='pro_prograss'] .msg_num").css('display','inline-block').html(lP);
            }else{
                $("div[action='pro_prograss'] .msg_num").hide();
                $('#result_not_found_container').show();
                $('#result_not_found_tip').html('暂时没有相关信息');
                $p.addClass('not-found');
            }
        },100)
        dmJs._ajax({
            id:'del',
            params:params,
            url:'/urming_quan/service/delCrowdfundingProgress',
            callback:function(){
               //console.log('删除成功')
                //_self.busy = false;
            },error:function(){
                //_self.busy = false;
            }
        });
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
		var me = fundingJs;
		var action = $el.attr('action');
		$(".info,#chapter,#wants").hide();
		$('#result_not_found_container').hide();
		$p.removeClass('not-found');
		switch(action){
			case 'info':
				me.toggleTab.call($el);
				$(".info").show();
                $("#pro_prograss").hide();
                $("#support").hide();
				break;
			case 'pro_prograss':
				me.toggleTab.call($el);
                $(".info").hide();
                $("#support").hide();
                $("#pro_prograss").show();
                //console.log($("#pro_prograss li").length)
                if($("#pro_prograss li").length<=0){
                    $(".timeline").hide();
                    $('#result_not_found_container').show();
                    $('#result_not_found_tip').html('暂时没有相关信息');
                    $p.addClass('not-found');
                }else{
                    $('#result_not_found_container').hide();
                    $(".timeline").show();
                }
				break;
			case 'support':
				me.toggleTab.call($el);
				//me.recommendWants(true);
				if(!($("#support li").length > 0)){
					$('#result_not_found_container').show();
					$('#result_not_found_tip').html('暂时没有相关信息');
					$p.addClass('not-found');
                    $("#support").hide();
                }else{
                    $("#support").show();
                    $('#result_not_found_container').hide();
                }

                $(".info").hide();
                $("#pro_prograss").hide();
				break;
		}
	},playVoice:function(){
		$(this).siblings('audio')[0].play();
	},toSvrUserInfo:function(){
		var $el = $(this),
            userId = $el.data('userId');

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
				dmJs.sStore.toLogin({href:'./funding.html',id:'funding', options:{data:{serviceID:serviceID}}});
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
		var me = fundingJs;
		var $p = $.mobile.activePage;
		var $b = $(this);
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null && !$b.is('[live]')){
			dmJs.sStore.toLogin({url:'./funding.html', options:{data:mainJs.parseUrlSearch()}});
		}/* else if(typeof(currentUser.user.mobile) == 'undefined' || currentUser.user.mobile == ''){
			viewJs.dialogPop('绑定手机号才能购买！', function(res){
				if(res){
					viewJs.navigator.next({next:{url:'./bindMobile.html', id:'bindMobile'},lastAuto:true});
				}
			});
		} */else {
			var service = $b.data('service');
            var dFunding = $b.data('funding')

            var currentUser = dmJs.sStore.getUserInfo();

            var serviceID = mainJs.parseUrlSearch().serviceID;
            if(currentUser == null){
                viewJs.navigator.next({
                    next:{url:'./signup.html', id:'signup', options:{data:{serviceID:serviceID}}},
                    lastAuto:true
                });
                return;
            }else{
                if($b.html() == '编辑'){
                    var json = {
                        serviceID:serviceID,
                        catId:8
                    }
                    viewJs.navigator.next({
                        next:{url:'./addService.html', id:'addService',
                            options:{
                                data:json
                            }},
                        last:{
                            url:'./funding.html', id:'funding',
                            options:{data:mainJs.parseUrlSearch()}
                        },
                        lastAuto:false
                    });
                }else{
                    var msg = '<h2>融资协议</h2>' +
                            '<span>购买即视为同意：</span><br/>' +
                            '<a class="protoco" href = "javascript:;" ><<创新学堂用户融资协议>></a> ',
                        callback = function (bOn){
                            if(bOn){
                                var params = {};
                                params.serviceID = serviceID;
                                params.price =dFunding.price;
                                params. minSingleSaleCount =dFunding. minSingleSaleCount;
                                params. maxSingleSaleCount =dFunding. maxSingleSaleCount;
                                params.serviceVersionID = dFunding.serviceVersionID;
                                params.serviceName = dFunding.name;
                                params.catId = 8;
                                params.isvirtualcurr = false;
                                viewJs.navigator.next({
                                    next:{url:'./submitOrder.html', id:'submitOrder',
                                        options:{
                                            data:params
                                        }},
                                    last:{
                                        url:'./funding.html', id:'funding',
                                        options:{
                                            data:mainJs.parseUrlSearch()
                                        }
                                    },
                                    lastAuto:false
                                });
                            }else{
                                viewJs.navigator.next({
                                    next:{url:'./funding.html', id:'funding',
                                        options:{
                                            data:mainJs.parseUrlSearch()
                                        }},
                                    lastAuto:false
                                });
                            }

                        },
                        title = '融资购买协议',
                        options = {
                            okText:'同意购买',
                            noText:'暂不参与'
                        }

                    viewJs.dialogPop(msg, callback, title, options);

                    $p.find('.protoco').on('click',function(){
                        viewJs.navigator.next({
                            next:{url:'./protocol_funding.html', id:'protocol_funding',
                                options:{
                                    data:mainJs.parseUrlSearch()
                                }},
                            last:{
                                url:'./funding.html', id:'funding',
                                options:{
                                    data:mainJs.parseUrlSearch()
                                }
                            },
                            lastAuto:false
                        });
                    })

                }

            }


            return;//众筹页面下面不管了
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
					viewJs.navigator.next({
						next:{url:'./liveCast.html', id:'liveCast', options:{data:{actId:$b.data("liveID"),serviceID:$b.data("relatedId")}}},
						lastAuto:true
					});
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
				//var svrVer = service.serviceVersion;
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
									url:'./funding.html', id:'funding',
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
								url:'./funding.html', id:'funding',
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
						url:'./funding.html', id:'funding',
						options:{data:mainJs.parseUrlSearch()}
					},
					lastAuto:false
				});
			}
		}
	},initData:function(){
		var me = fundingJs;
		if(!(/service/.test(location.href))){
			return;
		}
		var params = mainJs.parseUrlSearch();
		if($.trim(params.serviceID) == ''){
			viewJs.showApiError({error_code:'20201'});
			return;}
		if(typeof(params.offset) !=  "undefined" && params.offset !=  ""){
            fundingJs.offset = params.offset;
		}else{
            fundingJs.offset = 0;
		}

        this.touchSlide(params);
	},getServiceByID:function(params, callback){
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser != null){
			params.accessToken = currentUser.accessToken;
		}
		dmJs._ajax({url:'/urming_quan/service/getCrowdfundingDetail',
			params:params,
			id:'getCrowdfundingProgressDetail',
			callback:callback
		});
	},initServiceDetailInfo:function(data){
        var me= fundingJs;
        var $p = $.mobile.activePage;
        //console.log(data)

//info
        var detail = data.detail;

        var endtime = detail.endTime;
        var realTime = new Date().getTime();
        if(endtime){
            var endtimes = new Date(Date.parse(endtime.replace(/-/g,"/"))).getTime() ;
            var disDays = Math.floor((endtimes-realTime)/(24*3600*1000));
            if(disDays>0){
                $('.mes_mask .time_num').html('剩余：'+disDays+'天');
            }else{
            var timer =  setInterval(function(){
                $('.mes_mask .time_num').html(getDisTime());
                },1000)

                function getDisTime (){
                    var realTime0 = new Date().getTime();
                    var difference = endtimes - realTime0;

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
                    var countdown ='剩余：'+ (days>0?(days+"天"):"")+(hours>0?((hours<10?("0"+hours):hours)+"时"):"")+(minutes>0?((minutes<10?("0"+minutes):minutes)+"分"):"")+(seconds>0?((seconds<10?("0"+seconds):seconds)+"秒"):"");
                    if(difference<=0){
                        countdown = '已截止';
                        clearInterval(timer);
                    }
                    return countdown;
                }

            }


        }



        var maxBuyerCount = detail.maxBuyerCount? detail.maxBuyerCount:199,
            buyerCount   = detail.buyerCount? detail.buyerCount:0,
            buyerLast = maxBuyerCount - buyerCount;
        var price = detail.price;
        var worth = detail.worth,
            totalNum = detail.totalNum,
            soldNum = detail.soldNum,
            completionRate =detail.completionRate;
        var svrLastNum=totalNum -soldNum;
        var selfTotalNum = detail.selfTotalNum;
        //console.log(totalNum)
        var fundingName = detail.name;
        var status = detail.status;

        //$('.mes_mask .per_num').html(buyerLast);
        $('#svrNewPrice mark').html(price);

		document.title = fundingName;




        var publisherId = detail.user.id;
        var currentUser = dmJs.sStore.getUserInfo();
        if(!!currentUser&& currentUser.user.id ==publisherId ){
            //$('.buySvrBtn').html('编辑').attr('self','').addClass('enable');
            $('.buySvrBtn').hide();
            $('#pro_prograss .add_pro').show();

        }else{
            if(status ==0){
                $('.buySvrBtn').html('支持').addClass('enable');
                $('.buySvrBtn').data('funding',detail);
            }else if(status == 1){
                $('.buySvrBtn').html('限额已满');
                $('.buySvrBtn').removeClass('enable');
            }else if(status == 2){
                $('.buySvrBtn').html('已完成').removeClass('enable');
            }
        }

		var picUrl = $.trim(detail.picUrl);


		// 轮播
		var imgs = [];
		var $ctr = $('.servicePics');
        $ctr.empty();

        if(picUrl !=  ''){
            picUrl = picUrl.split(',');
            var l = picUrl.length,i=0;
            if(l > 1){
                for(i = 0; i < l; i++){
                    imgs.push(mainJs.getFunPicUrl({url:picUrl[i],size:1}));
                }

            } else {
                imgs[0] = mainJs.getFunPicUrl({url:picUrl[0],size:1});
            }
        } else {
            imgs[0] = mainJs.getFunPicUrl({});
        }

        var str = '<div id="focus" class="focus">';
        var navStr = '';
        str +='<div class="hd">\
        <ul></ul>\
        </div>';
        str += '<div class="bd"><ul>'
        for(var j=0;j<imgs.length;j++){
            str+='<li class="pic_list">' +
            '<img src="'+ imgs[j] +'"/>'+
            '</li>';
        }
        str += '</ul></div>';
        $ctr.html(str);
        if(l>1){
            TouchSlide({
                slideCell:"#focus",
                titCell:".hd ul", //开启自动分页 autoPage:true ，此时设置 titCell 为导航元素包裹层
                mainCell:".bd ul",
                effect:"leftLoop",
                autoPlay:true,//自动播放
                autoPage:true //自动分页
            });
        }

        var totalMoney = detail.totalMoney;
        var saleMoney = detail.completeTotalMoney;
        var minSale = detail.minSingleSaleCount;
        var maxSale = detail.maxSingleSaleCount;
        var realViewCount = detail.realViewCount;
        //console.log(detail)
        //console.log(minSale)
        $('#service_name').html(fundingName);
        $('.total_money span').html(totalMoney);
        $('.worth').html(worth);
        /*$('.this_range span').width(Math.round(totalMoney/worth*50) );
        $('.this_range i').html(totalMoney/worth*100+'%');*/
        $('.sale_money span').html(saleMoney);
        var nRate = completionRate>0.9? 0.9:completionRate;
        $('.done').width(nRate*$('.grun').width());
        var str = completionRate*100;
        $('.done_bar').css('left',nRate*$('.grun').width())
        $('.done_bar').html(str.toFixed(1)+'%');
        if(minSale == 1||!minSale){
            $('.min_sale').parent().parent().hide()
        }else{
            $('.min_sale').html(minSale);
        }
        if(!maxSale){
            $('.max_sale').parent().parent().hide();
        }else{
            $('.max_sale').html(maxSale)
        }
        ////$('.max_sale').html(maxSale)
        //$('.min_sale').html(minSale);
        $('.view_num i').html(realViewCount+'人');
        $('.view_num canvas').html(100+'%');
        $('.svrLastNum i').html(svrLastNum+'股 ');
        $('.svrLastNum canvas').html(svrLastNum/totalNum*100+'%');
        $('.selfTotalNum i').html(selfTotalNum+'股');
        $('.selfTotalNum canvas').html(selfTotalNum/totalNum*100+'%');
        var catId =detail.category.id;//分类
        dmJs.findCatById(catId, function(cat){
            if(cat != null){
                $('#svrCatName').html(cat.categoryName);
            } else {
                $('#svrCatName').html('未知');
            }
        });

        $('.end_time').html(endtime)

        me.canvasRate();





		// 服务提供者
		var $u = $('#funding .svrUserInfo');
		var user = detail.user;
        //console.log(user)
		var isMoneyGuaranteed = user.isMoneyGuaranteed;
		var isIdcardValidated = user.isIdcardValidated;
		var loginUser = dmJs.sStore.getUserInfo();

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
        var describe = me.typesetting($.trim(detail.describe));
        $('.serviceDesc').html(describe);
        //console.log(describe)

    //进展

        var progress = data.crowdfundingProgressList;
        var lP = progress.length;
        var htl = '';
        for(var i = 0; i<lP; i++){
            var item = progress[i];
            //console.log(item)
            var imgUrl = item.crowdfundingProgressImageList;
            var imgL = imgUrl.length;
            //console.log(imgUrl)

            htl += '<li data_id = '+ item.id +'>' +
            '<div class="three"></div>'+
            '<span class="dot"></span>'+
            '<time>'+ item.progressDate.split(' ')[0] +'<span class="cancle" style="display:none">删除</span></time>'+
            '<p>'+item.progressContent + '</p>';
            if(imgL>0){
                htl+= '<nav class="pic_box">';
                for(var k=0;k<imgL;k++){
                    htl+= '<div class="prograss_pic">'+
                    '&nbsp;<img src= '+ mainJs.getFunPicUrl({url:imgUrl[k].url,size:1}) +' alt='+imgUrl[k].content+'>'+
                    '</div>';
                }

                htl+='</nav>';
            }
            htl+='</li>';
        }

        $('.progress_box').html(htl);
        if(!!currentUser&& currentUser.user.id ==publisherId ){
            $('.timeline .cancle').show();

        }

        $('.progress_box li').each(function(index,item){
            //console.log($(item).find('.prograss_pic').length)
            if($(item).find('.prograss_pic').length>3){
                $(item).find('.prograss_pic').hide();
                $(item).find('.prograss_pic').eq(0).show()
                $(item).find('.prograss_pic').eq(1).show()
                $(item).find('.prograss_pic').eq(2).show()
                //alert(1)
            }
            if($(item).find('.prograss_pic').length>0){
                $(item).find('.prograss_pic').on('vclick',function(){
                    //alert($(this).find('img').length)
                    var imgArr = [];
                    var $_this = $(this).parent().parent();
                    $_this.find('img').each(function(index,item){
                        imgArr.push({
                            src:$(item).attr('src'),
                            content:$(item).attr('alt')
                        })
                    })
                    //console.log(imgArr)
                    var numPic =$(this).index();
                    showImg(numPic);
                    function showImg(numPic){
                        console.log(numPic)
                        var $p = $.mobile.activePage;
                        var iw = $('.ui-content').outerWidth()+'px';
                        //console.log(oriImgArr.length)
                        var l = imgArr.length;
                        //console.log(oriImgArr)
                        var htl = '<div id="showOringeImg_box">' +
                            '<div class="show_header">' +
                            '<span class="disapear">&lt;</span>' +
                            '<b class="progress">1/'+l+'</b>'+
                            '</div>';

                        htl+='<div class="show_content"> ';
                        for(var i=0; i< l;i++){
                            var iL =0;
                            if(i<numPic){
                                iL = -iw;
                            }else if(i==numPic){
                                iL = 0;
                            }else{
                                iL = iw;
                            }
                            //console.log(iL)
                            htl+='<img src =' +imgArr[i].src+' class = "show_pic11" style =" left : '+ iL+' " />';

                        }
                        htl+='<div class="imgContent" ></div>'
                        htl+= '</div></div>';
                        $('.servicePicsCtr').append($(htl));
                        $p.find('#showOringeImg_box').on('vmousemove',function(e){
                            e.preventDefault()
                        });
                        $('#showOringeImg_box').css('top', $(document).scrollTop()-44);
                        $('.progress').html((numPic+1)+'/'+l)
                        var zIdexs = 0;
                        $('.imgContent').html(imgArr[numPic].content!=='undefined'? imgArr[numPic].content:'暂无描述');
                        $p.find('.show_pic11').on('swipeleft',function(){
                            swipe('left');
                        });
                        $p.find('.show_pic11').on('swiperight',function(){
                            swipe('right');
                        });
                        function swipe(direction){
                           // console.log(iw)
                            zIdexs++;
                            var me = fundingJs;
                            direction = direction? direction:'left';
                            var iw = $('.ui-content').outerWidth();
                            if(direction =='left'){
                                numPic ++;
                                if(numPic>l-1) numPic = l-1;
                                $('.show_pic11').eq(numPic-1).css('left',-iw);
                                $('.show_pic11').eq(numPic).css('left','0');

                                $('.imgContent').html(imgArr[numPic].content!=='undefined'? imgArr[numPic].content:'暂无描述');
                            }else{
                                numPic --;
                                if(numPic<0 ) numPic = 0;
                                $('.show_pic11').eq(numPic+1).css('left',iw);
                                $('.show_pic11').eq(numPic).css('left','0');
                                $('.imgContent').html(imgArr[numPic].content!=='undefined'? imgArr[numPic].content:'暂无描述');
                            }

                            $('.show_pic11').eq(numPic).css('z-index',zIdexs)
                            $('.progress').html((numPic+1)+'/'+l)
                        }
                    }
                })
            }

        })

    //支持人数
        var supportors = data.ownList;
        var lSup = supportors.length;
        var htmlSup = '';
        for(var j = 0;j<lSup;j++){
            var itemSup = supportors[j];
            //console.log(itemSup)
            htmlSup +=' <li>\
            <div class="svrUserInfo vbt vr">\
            <img src = '+ mainJs.getProfilePicUrl({url:itemSup.profileImageUrl, sex:user.sex}) +'>\
            <div class="svrUserName">'+itemSup.realname +'</div>\
            </div>\
            <div class="sup_money">\
            支持： <i>'+itemSup.price +'</i> 元\
            </div>\
            </li>'
        }
        $('.supportor').html(htmlSup);



		me.recommendWantsByData(data);
		//hw
		// 服务描述
		var $f = $('#funding .svrUserFooter');
		me.initConcatFooter($f,user.realname, user.contactPhone);
	},canvasRate:function(){
        var $p = $.mobile.activePage;
        var heigth = 80;
        $p.find('canvas').each(function() {
            var text = $(this).text();
            var process = text.substring(0, text.length-1);
            var canvas = this;
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, heigth, heigth);
            context.beginPath();
            context.moveTo(heigth/2, heigth/2);
            context.arc(heigth/2, heigth/2, heigth/2, 0, Math.PI * 2, false);
            context.closePath();
            context.fillStyle = '#ddd';
            context.fill();
            context.beginPath();
            context.moveTo(heigth/2, heigth/2);
            context.arc(heigth/2, heigth/2, heigth/2, 0, Math.PI * 2 * process / 100, false);
            context.closePath();
            context.fillStyle = '#67BBAB';
            context.fill();
            context.beginPath();
            context.moveTo(heigth/2, heigth/2);
            context.arc(heigth/2, heigth/2, heigth/2-5, 0, Math.PI * 2, true);
            context.closePath();
            context.fillStyle = 'rgba(255,255,255,1)';
            context.fill();
            context.beginPath();
            context.arc(heigth/2, heigth/2, heigth/2-7, 0, Math.PI * 2, true);
            context.closePath();
            /*context.strokeStyle = '#ddd';
            context.stroke();
            context.font = "bold 14pt Arial";
            context.fillStyle = '#67BBAB';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.moveTo(heigth/2, heigth/2);*/
            //context.fillText(text, heigth/2, heigth/2);
        });
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
				dmJs.sStore.toLogin({url:'./funding.html',id:'funding',options:{data:currentParams}});
			},callback:function(data){
				var serviceCartID = data.serviceCartID;
				// 使用余额支付
				dmJs._ajax({
					id:'buySuc',
					url:'/urming_quan/service/buySuc',
					params:{accessToken:params.accessToken, serviceCartID:serviceCartID},
					accessInvalid:function(){
						dmJs.sStore.toLogin({url:'./funding.html',id:'funding',options:{data:currentParams}});
					},callback:function(){
						viewJs.dialogPop('感谢您的参与', null, null, {onlyBtnOk:true});
					}
				});
			}});
			*/
		var me = fundingJs;
		var res;
		/*
		$.ajax(mainJs.getApiUrl('/urming_quan/service/buyFreefunding'),params , function(data, statusText, jqhr){
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
					$('#funding .buySvrBtn').addClass('enable').html('已购买').removeClass("enable");
					$('#funding .buySvrBtn').remove();
				}
			}
		});
		return res;
	},getVideoID:function(){
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null){
			dmJs.sStore.toLogin({url:'./funding.html', options:{data:mainJs.parseUrlSearch()}});
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
			var yesterdayTime = fundingJs.getEffectivetime(effectivetime);
			var yesterday=new Date();
			yesterday.setTime(yesterdayTime);
			if(new Date().getTime()<yesterdayTime/* && freeData=='false'*/ && $('#funding .buySvrBtn').html()!='编辑' && currentUser.user.id!=$('#funding .svrUserInfo').data('userId')){
				viewJs.showPopMsg('该章节将于'+yesterday.getFullYear()+'-'+(yesterday.getMonth()+1)+'-'+yesterday.getDate()+' 19点开启,敬请期待');
				return;
			}
			if(buyNum<1 && $('#funding .buySvrBtn').html()!='编辑' && currentUser.user.id!=$('#funding .svrUserInfo').data('userId')){
				//viewJs.dialogPop('购买后才能观看！', null, null, {onlyBtnOk:true});
				if($('#funding .buySvrBtn').is('[free]')){
					var service = $('#funding .buySvrBtn').data('service').service;
					var svrVer = service.serviceVersion;
					var params = {serviceID:service.id, price:svrVer.newPrice, serviceVersionID:svrVer.id,serviceName:svrVer.serviceName,catId:service.serviceVersion.category.category.id,isvirtualcurr:service.isvirtualcurr};
					var me = fundingJs;
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
					if(typeof(data.error_code)!="undefined"){
						viewJs.showApiError(data);
					}else{
                        fundingJs.play(videoid,data.streamUrl,"1");
					}
				}
			});
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
             fundingJs.play(res.videoID,"1");
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
		$('#funding .servicePics').hide();
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
				"stretch_patch": false,//默认为 false ,设置为 true 支持将开始、暂停、结束时的图片贴片,铺满播放器
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

		/*
		qcVideo.use("startup", function (mod) {
			var option ={"auto_play":status,"file_id":videoID,"app_id":"1251442472","width":window.screen.width>480?480:window.screen.width,"height":336};
			mod.start(
				"id_video_container",
				option
			);
		});
		*/
		//$("#id_video_container").empty();
		//$("#id_video_container").append('<iframe id="video" name="video" src="http://play.video.qcloud.com/iplayer.html?$appid=1251442472&$fileid='+videoID+'&$autoplay='+status+'&$sw='+(window.screen.width>480?480:window.screen.width)+'&$sh=250" frameborder="0" width="'+(window.screen.width>480?480:window.screen.width)+'" height="250" scrolling="no"></iframe>');
	},toggleContent:function(){
		var $m = $(this);
		var currentUser = dmJs.sStore.getUserInfo();
		if(currentUser == null){
			dmJs.sStore.toLogin({url:'./funding.html', options:{data:mainJs.parseUrlSearch()}});
		} else {
			var chaterID = $m.attr('data-chapterid');
			var buyNum = $m.attr('data-buynum');
			var freeData = $m.attr('data-free');
			var effectivetime = $m.attr('data-effectivetime');
			var yesterdayTime = fundingJs.getEffectivetime(effectivetime);
			var yesterday=new Date();
			yesterday.setTime(yesterdayTime);
			if(new Date().getTime()<yesterdayTime/* && freeData=='false'*/ && $('#funding .buySvrBtn').html()!='编辑' && currentUser && currentUser.user.id!=$('#funding .svrUserInfo').data('userId')){
				viewJs.showPopMsg('该章节将于'+yesterday.getFullYear()+'-'+(yesterday.getMonth()+1)+'-'+yesterday.getDate()+' 19点开启,敬请期待');
				return;
			}
			if(buyNum<1 && $('#funding .buySvrBtn').html()!='编辑' && currentUser && currentUser.user.id!=$('#funding .svrUserInfo').data('userId')){
				//viewJs.dialogPop('购买后才能查看课程详情！', null, null, {onlyBtnOk:true});
				if($('#funding .buySvrBtn').is('[free]')){
					var service = $('#funding .buySvrBtn').data('service').service;
					var svrVer = service.serviceVersion;
					var params = {serviceID:service.id, price:svrVer.newPrice, serviceVersionID:svrVer.id,serviceName:svrVer.serviceName,catId:service.serviceVersion.category.category.id,isvirtualcurr:service.isvirtualcurr};
					var me = fundingJs;
					if(!me.buyFreeSvr(params)){
						return;
					}
				}else{
					viewJs.showPopMsg('购买后才能查看课程详情！');
					return;
				}
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
		var me = fundingJs;
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
			offset:fundingJs.offset,
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
					offset:fundingJs.offset || 0,
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
					pageInfo.hasPre = fundingJs.offset > 0 ? '' : 'disabled';
					pageInfo.hasNext = (fundingJs.offset+_PAGE_SIZE) < total ? '' : 'disabled';
					var pageCurrent = Math.ceil(fundingJs.offset/_PAGE_SIZE+0.1);
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
        //console.log(res)
        var progress = res.crowdfundingProgressList;
        var suporter = res.ownList;
		var me = fundingJs;
		var $p = $.mobile.activePage;

		var dP =res.crowdfundingProgressList,
		    lP = dP.length;
        var dS =res.ownList,
		    lS = dS.length;

		if(lP>0){
			$("div[action='pro_prograss'] .msg_num").css('display','inline-block').html(lP);

		}
        if(lS>0){
            $("div[action='support'] .msg_num").css('display','inline-block').html(lS);

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

