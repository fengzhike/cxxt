addServiceJs = {
	_data:null,
	init:function(){
		var user;
		if(!(user = viewJs.chkLogin())){
			return;
		}
		this.initLabels();
		var $p = $.mobile.activePage;
		$p.find('.wx').hide();
		//this.$file = $p.find('#take-pic');
		$('#take-pic').remove();
		this.$file = $('<input id="take-pic" type="file" accept="image/png,image/jpeg" capture="camera">');

		this.resetData(true);
		this.toggleEvents(true);
		this.loadThumb(this.initPage);

	},resetData:function(bInit){
		var me = addServiceJs;
		if(bInit){
			me._data = {urlMap:{},urlHideMap:{}};
		} else {
			me._data = null;
		}
	},toggleEvents:function(isBind){
		var me = addServiceJs;
		var $p = $.mobile.activePage;
		$p.unbind('selCatTagShow');
		$p.unbind('addServiceDescShow');
		me.$file.unbind('change');
        $p.undelegate();
		viewJs.toggleAddServiceEvents(false);
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
				viewJs.toggleParentShow(true);
				$('#toDeleteImageDlg').remove();
				me.resetData();

			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('#cameraBtn', 'tap',function(e){
					e.preventDefault();
					e.stopPropagation();
                    var $bt = $(this);
                    if($bt.data('busy') == true){
                        return;
                    }


                    $bt.data('busy', true);
                    var $ctr = $('#cameraContainer');
                    var l = $ctr.find('img').length;
                    if(l>=15){
                        viewJs.showPopMsg('最多添加15张图片');
                        $bt.data('busy', false);
                        return;
                    }

					me.$file.click();
                    var handler = $bt.data('busy-handler');
                    clearTimeout( handler);
                    handler =  setTimeout(function(){
                        $bt.data('busy', false);
                    },1000);
                    $bt.data('busy-handler',handler);
                }).delegate('.submit', 'vclick',me.submitService);

				me.$file.change(me.takePic);
                $p.delegate('input.serviceName','input',viewJs.validInput);
                $p.delegate('.fullScreen','vmousemove',function(e){
                    if($('.fullScreen .content').height()<document.documentElement.clientHeight){
                        e.preventDefault();
                    }

                });
				$p.delegate('#cameraContainer>.camera-thumbnails', 'vclick', me.toEditImage)
				viewJs.toggleAddServiceEvents(true);
				$p.delegate('.vbt.sendCode.enable:not(.busy)', 'vclick', me.getVerifyCode);
				$p.delegate('[data-format]', 'input', viewJs.validInput);
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
                //fsk
                $p.delegate('textarea','blur',function(){
                    viewJs.top()
                })
                //fsk 解决苹果手机文本域不能滚动问题
                if(viewJs.testbroswer()=='safari'){
                    $p.delegate('textarea','vmousedown',function(event){
                            var  y0 = event.clientY,
                                top = $(this).scrollTop();
                            $(this).on('vmousemove',function(event){
                                var  y = event.clientY;
                                $(this).scrollTop(y0-y+top);
                            })
                        })
                }
			}, 500);

		}
	}, getVerifyCode: function () {
		var $p = $.mobile.activePage;
		var mobile = $p.find('.line.phone input').val();
		mobile = $.trim(mobile);
		if (mobile == '') {
			return;
		}
		if($p.is('[wx]')){
			viewJs.getVerifyCode();
			return;
		}
		dmJs._ajax({id: 'validateMobile', method: 'POST', params: {mobile: mobile}, url: '/urming_quan/user/validateMobile',
			callback: function (data) {
				if (!data.exsit) {
					viewJs.dialogPop('手机号不存在', function () {
					}, '错误', {onlyBtnOk: true});
					return;
				}
				viewJs.getVerifyCode();
			}});
	},addLink:function(){
		var me = addServiceJs;
		me.toggleEvents();
		var err;
		var lnkName = $.trim($('#toAddDescLink .lnk-name').val());
		var lnkValue = $.trim($('#toAddDescLink .lnk-value').val());
		if(lnkName==''){
			err = '链接名称不能为空';
		}
		if(!err && lnkValue==''){
			err = '链接地址不能为空';
		}
		if(!err){
			if(!viewJs.validate.url(lnkValue)){
				err = "链接地址不正确";
			}
		}
		if(err){
			viewJs.showPopMsg(err);
			me.toggleEvents(true);
			return;
		}
		me._data.urlMap[lnkName] = lnkValue;
		var $desc = $('#addServiceWantDesc textarea');
		var $descVal = $desc.val();
		var insertIndex = me._data._descIndex;
		$desc.val([$descVal.substring(0,insertIndex), lnkName,$descVal.substring(insertIndex)].join(''));
		me.cancelAddLink();

	},addHideLink:function(){
		var me = addServiceJs;
		me.toggleEvents();
		var err;
		var lnkName = $.trim($('#toAddDescLink .lnk-name').val());
		var lnkValue = $.trim($('#toAddDescLink .lnk-value').val());
		if(lnkName==''){
			err = '链接名称不能为空';
		}
		if(!err && lnkValue==''){
			err = '链接地址不能为空';
		}
		if(!err){
			if(!viewJs.validate.url(lnkValue)){
				err = "链接地址不正确";
			}
		}
		if(err){
			viewJs.showPopMsg(err);
			me.toggleEvents(true);
			return;
		}
		me._data.urlHideMap[lnkName] = lnkValue;
		var $desc = $('#addHide');
		var $descVal = $desc.val();
		var insertIndex = me._data._hideIndex;
		$desc.val([$descVal.substring(0,insertIndex), lnkName,$descVal.substring(insertIndex)].join(''));
		me.cancelAddLink();
	},cancelAddLink:function(){
		var me = addServiceJs;
		me.toggleEvents();
		$('#toAddDescLink').remove();
		me.toggleEvents(true);

	},toAddDescLink:function(){
		var me = addServiceJs;
		me._data._descIndex = viewJs.getFocus($('#addServiceWantDesc textarea')[0]);
		var $p = $.mobile.activePage;
		viewJs.toggleCameraShow();
		viewJs.top();
		var $dlg =$('#toAddDescLink').remove();
		var tpl = $('#addLinkDescTpl').html();
		me.toggleEvents();
		$dlg = $(tpl).hide().enhanceWithin();
		$p.append($dlg);
		setTimeout(function(){
			$dlg.delegate('.cancel-add-link', 'vclick',me.cancelAddLink).
				delegate('.add-link', 'vclick',me.addLink);
		},700);
		$dlg.show();
        var params = mainJs.parseUrlSearch();
        if(params.catName == 'bigsai'){
            var lang = sessionStorage.getItem('lang');
            var pubData =null;
            if(lang == 'en'){
                pubData = pubEnJs
            }else{
                pubData = pubCnJs
            }
            $('#toAddDescLink .ui-title').html(pubData.dec)
            $('#toAddDescLink .add-link.ui-btn-right').html(pubData.pubSub)
            $('#toAddDescLink .lnk-name').attr('placeholder',pubData.linkNamePlace)
            $('#toAddDescLink .lnk-value').attr('placeholder',pubData.linkValuePlace)
            $('#toAddDescLink .lnk-value').parent().prev().html(pubData.linkValue)
            $('#toAddDescLink .lnk-name').parent().prev().html(pubData.linkName)

        }
		me.toggleEvents(true);
	},submitService:function(){
		var me = addServiceJs;
		if(mainJs.parseUrlSearch().catId==8){
			viewJs.dialogPop('为保障融资项目双方权益，融资项目发布后将不可修改，并在到达融资期限后下线，请确认信息无误后进行发布！', function(res){
				if(res){
					addServiceJs._submitService();
				}
			},"提示",{okText:"确认发布",noText:"暂不发布"});
		}else{
            me._submitService();
		}
	},_submitService:function(){
        var $p = $.mobile.activePage;
		var me = addServiceJs;
		var options = {serviceName:'serviceName',serviceDesc:'serviceDesc',price:'newPrice',
			url:mainJs.getApiUrl(me.defaultUrl)
		};
		var params = mainJs.parseUrlSearch();
		options.busyDesc ="服务发布中";
		if(params.serviceID != null){
            if($p.find('.toSelTag').attr('bigSai')){
                options.isBigSai = true;
            }
			options.url = mainJs.getApiUrl('/urming_quan/service/updateService');
			options.extraParams = {
//              '北大创新',
//                platformType:2,
				serviceID:params.serviceID,
				catId:params.catId
			};
			var $ctr = $('#cameraContainer');
			var oldPic =  $ctr.data('oldPic');
			if(oldPic != null && oldPic.length> 0){
				options.extraParams.isOldPic = oldPic.join(',');
			}
			options.busyDesc ="服务提交修改";
			options.callback = function(){
				viewJs.navigator.next({next:{url:'./myServices.html',id:'myServices',options:{data:{catId:params.catId}}}});
			};
		} else if(params.wantID != null){
			options.url = mainJs.getApiUrl('/urming_quan/want/responseWantForService');
			options.callback = function(){
                if( me._bLoan){
                    viewJs.dialogPop('感谢您的参与，我们的工作人员会尽快处理！', function(){
                        viewJs.navigator.next({next:{url:'./myServices.html',id:'myServices',options:{data:{catId:params.catId}}}});
                    }, '贷款申请已提交！', {onlyBtnOk:true,okText:'确认'})
                } else {
					viewJs.navigator.pre();
					/*
                    viewJs.dialogPop('需求方会收到您的服务信息', function(){
                        viewJs.navigator.next({next:{url:'./myServices.html',id:'myServices',options:{data:{catId:params.catId}}}});
                    }, '发布成功！', {onlyBtnOk:true,okText:'查看我的服务'});
                    */
                }

			};
			options.extraParams = {
//              '北大创新',
//                platformType:2,
				wantID:params.wantID,
				catId:params.catId,
				online:$('#responseMess>input').is(":checked")?1:0
			};
		} else {
			options.envWx = me.envWx;
            options.extraParams = {
//              '北大创新',
//                platformType:2
            };
            viewJs._keepDfTag(true);
			if(!options.envWx){
				options.callback = me.matchWatnts;
			} else {
				options.callback = viewJs.wxBack;

			}

		}

		options.urlMap = me._data.urlMap;
        options.onlyGroup=$('#show_check').is(":checked")?1:0;
		//hw
		options.urlHideMap = me._data.urlHideMap;
		//hw
        //console.log(options)
		viewJs._publish(options);
	},takePic:function(){
		var files = this.files;
		if (!files.length) return;
		var f = files[0];
		addServiceJs.makeThumb(f);
	},_chkTransparent:function($canvas){
        viewJs.maskReadImg('检查图片是否空白');
        var c = $canvas[0];
        var ctx=c.getContext("2d");
        var imgData=ctx.getImageData(0,0,c.width,c.height).data;
        var dl = imgData.length;
        var transparent = true;
        var a, b, c,d;
        for(var i = 0; i < dl; i+=4){
            a = imgData[i];
            b = imgData[i+1];
            c = imgData[i+2];
            d = imgData[i+3];
            if((a != 255 || b != 255 || c != 255 ) && d != 0){
                transparent = false;
                break;
            }
        }
        $canvas.remove();
        return transparent;
    },makeThumb:function(file){
		var me = addServiceJs;
		var $file = me.$file;
		viewJs.maskReadImg();
		$file.makeThumb(file, {
			maxWidth:1024,
            keepCanvas:true,
			maxHeight:1024,
			success: function(dataURL, tSize, file, sSize, fEvt, $canvas) {
				// 可以得到图片名, 高度等信息, 用来做一些判断, 比如图片大小是否符合要求等..
				// console.log(fEvt.target, file.name, sSize, sSize.width, sSize.height);
				// console.log(file.name, sSize.width +'->'+ tSize.width, sSize.height +'->'+ tSize.height);
               if(me._chkTransparent($canvas)){
                    viewJs.finishReadImg();
                    viewJs.showPopMsg('图片空白');
                    return;
               }
                viewJs.maskReadImg();
				var $ctr = $('#cameraContainer');
				var l = $ctr.find('img').length;
				var thumb = new Image();
                thumb.onload = function(){//appendTo($ctr)  insertBefore($('#cameraBtn'))
                    $(thumb).addClass('camera-thumbnails').insertBefore($('#cameraBtn')).data('img-index', l);
                    $file.val('');
					me.$file = $file.clone(true);
					$file.remove();
					$('#cameraBtn').replaceWith($('#cameraBtn').clone(true));
                    viewJs.finishReadImg();
					$('input.serviceName').focus().click();
                };
				thumb.src = dataURL;
			},error:function(){
				viewJs.finishReadImg();
				viewJs.showPopMsg('文件读取失败');
			}
		});
	},loadThumb:function(callback){
		if( !$.support.filereader){
			$('.cameraCtr').hide();
			callback();
			return;
		}
		viewJs.maskBusy(null, 'takePic');
		$.getJs({ns:$('<div>'), varName:'makeThumb', url:mainJs.getResourceURL('/js/make-thumb/make-thumb.min.js?__ver=2'), ajaxOpt:{
		success:function(){
			viewJs.hideBusyMask('takePic');
			callback();
		},error:function(){
			//console.log(arguments);
			viewJs.hideBusyMask('takePic');
			viewJs.showPopMsg('加载图片失败');
		}}});
	},initPage:function(){
		var me = addServiceJs;
		var $p = $.mobile.activePage;
		var params = mainJs.parseUrlSearch();
        //console.log(params)
		//me.envWx = $p.is('[wx]');
		//me.defaultUrl = '/urming_quan/service/addService';
		//if(me.envWx){
		//	$p.find('.wx').show();
		//	me.defaultUrl = '/urming_quan/service/addServiceByVerifyCode';
		//}
		if(params.serviceID != null){
            //me.setTitle('编辑服务');
			me.initEditeService(params);

		} else if(params.wantID != null){
			me.initProvideService(params);
		} else {
			//var $p = $.mobile.activePage;
            //$p.find('.toaddServiceWantDesc>.vCt').html(" \n   我能\n\n   我的资质\n   1. \n   2.\n\n   注意事项\n   1.\n   2.\n\n  常见问题\n  1.\n  2.");
			//var label = "服务";
			//if(params.catId){
			//	var catNames = {44:'课程',45:'活动'};
			//	label = catNames[params.catId];
			//	$p.find('.toSelCategories .vCt').attr('catId',params.catId).html(label);
			//}
			//me.setTitle('创新学堂-发布'+label);
			//$('#publish_title').attr('placeholder','提供的'+label);
		}
        if(params.catName == 'bigsai'){
            var lang = sessionStorage.getItem('lang');
            var pubData =null;
            if(lang == 'en'){
                pubData = pubEnJs
            }else{
                pubData = pubCnJs
            }

            $p.find('.service_name_l strong').html(pubData.projectName)
            $p.find('.ui-title').html(pubData.publishTitle)
            $p.find('#publish_title').attr('placeholder',pubData.namedec)
            $p.find('.submit').html(pubData.pubSub)
            $p.find('.toSelTag').parent().find('strong').html(pubData.categories)
            $p.find('.toSelTag .vCt').html(pubData.catPlaceh)
            $p.find('.connect .title_l strong').html(pubData.contact)
            $p.find('#publish_contactContent').attr('placeholder',pubData.contactCon)
            $p.find('#publish_contactType option:eq(0)').html(pubData.phone)
            $p.find('#publish_contactType option:eq(1)').html(pubData.email)
            $p.find('#publish_contactType option:eq(2)').html(pubData.WeChat)
            $p.find('.toaddServiceWantDesc .vCt').html(me.typesetting( pubData.introdec))
            $p.find('.toaddServiceWantDesc').parent().find('strong').html(pubData.dec)
            $p.find('#cameraBtn-desc').html(pubData.picture)
            $('#toAddDescLink .ui-title').html(pubData.dec)
            $p.find('.ui-btn.ui-icon-back.logout').html(pubData.exit)
            $('.lang_turn').html(pubData.turnLang)



            ///console.log(pubData.catPlaceh)

        }
	},initLabels:function(){
		var me = addServiceJs;
		var $p = $.mobile.activePage;
        viewJs.checkInputEmpty()
		var params = mainJs.parseUrlSearch();
		var user = dmJs.sStore.getUserInfo();
		me.envWx = $p.is('[wx]');
		me.defaultUrl = '/urming_quan/service/addService';
		if(me.envWx){
			$p.find('.wx').show();
			me.defaultUrl = '/urming_quan/service/addServiceByVerifyCode';
		}
		if(params.serviceID != null){
			var label = "服务";
			if(params.catId){
				var catNames = {1:'服务',3:'课程',4:'活动',6:'答案',8:'融资'};
				label = catNames[params.catId];
			}
			me.setTitle('编辑'+label);
			//$('#publish_title').attr('placeholder','提供的'+label);
		} else if(params.wantID != null){
			$p.find('.toSelCategories').hide();
			$p.find('.toSelTag').hide();
			$p.find('#cancelHide').hide();
			$p.find('#responseMess').show();
			$('#publish_unit').parent().hide();
            $p.find('.is_classmate').hide()
			$('#publish_address').parent().parent().parent().hide();
			$('#publish_startTime').parent().parent().parent().hide();
			$p.find('#publish_mobile').val(user.user.mobile?user.user.mobile:"");
		} else {
			var $p = $.mobile.activePage;
			var descHtml = '';
			if(params.catId == 3){
				descHtml = '授课对象:\n授课时间:\n授课人数:\n课程简介:\n授课老师及简介:\n课程价格:\n授课地点:\n课时:\n';
                $p.find('.toaddServiceWantDesc .vCt').html('说点啥吧，让大家了解你的课程，增强效果！10字以上哦');
			}else if(params.catId == 1 && params.catName == '服务'){
				descHtml = '我的特长:\n1.\n\n我的资质:\n1.\n\n奖项成就:\n1.\n\n购买限制:\n1.\n ';
			}else if(params.catId == 1 && params.catName == 'bigsai'){
                descHtml = '详细的介绍能吸引更多的支持者吆';
                $p.find('.toaddServiceWantDesc .vCt').html(descHtml);
            }else if(params.catId == 4){
				descHtml = '人员要求:\n活动内容:\n1.\n\n注意事项:\n1.\n\n ';
                $p.find('.toaddServiceWantDesc .vCt').html('说点啥吧，让大家了解你的活动，增强效果！10字以上哦');
			}else if(params.catId == 8){
				descHtml = '项目简介：\n1.\n\n投资资格条件：\n1.\n\n';
                $p.find('.service_name_l strong').html('项目名称')
                $p.find('.toaddServiceWantDesc .vCt').html('说点啥吧，让大家了解你的项目，增强效果！10字以上哦');
			}
			//$p.find('.toaddServiceWantDesc>.vCt').html(descHtml);
			var label = "服务";
			if(params.catId){
				var catNames = {1:'服务',3:'课程',4:'活动',6:'答案',8:'融资'};
				label = catNames[params.catId];
				//if(params.catName == '众筹让股'){
				//	$p.find('.toSelCategories .vCt').attr('catId','98').html('众筹让股');
				//}
				//$p.find('.toSelCategories .vCt').attr('catId',params.catId).html(label);
			}
            if(params.catId == 1 && params.catName == 'bigsai'){
                label = '赛事项目';
                $p.find('.toSelCategories .vCt').html('创业项目').attr('catid','96').attr('edit','1').parent().parent().hide();
                $p.find('#price').val(1)
                $p.find('#publish_unit').val('票')
                $p.find('.price').hide();
                $p.find('#addHide').parent().parent().parent().hide()
                $p.find('.is_classmate').hide()
                $p.find('.toCitylist').hide()
               // $p.find('.loginShow').append('<a class="lang_turn">To English</a>')
            }
			me.setTitle('发布'+label);
			//$('#publish_title').attr('placeholder','提供的'+label);
			$p.find('#publish_mobile').val(user.user.mobile?user.user.mobile:"");
		}
		//hw
		$("#cancelHideInfo").click(function(){
			if(!params.wantID){
				$("#cancelHide").show();
			}
			$("#addHideDiv").hide();
		});$("#addHideInfo").click(function(){
			$("#cancelHide").hide();
			$("#addHideDiv").show();
		});
		//if(params.catId != 1){
		//	$("#publish_unit").parent().parent().parent().hide();
		//}
		if(params.catId != 4){
			$('#publish_address').parent().parent().parent().hide();
			$('#publish_startTime').parent().parent().parent().hide();
		}
		if(params.catId != 8){
			$('#publish_maxBuyerCount').parent().parent().parent().hide();
			$('#publish_worth').parent().parent().parent().hide();
			$('#publish_maxSingleSaleCount').parent().parent().parent().hide();
			$('#publish_minSingleSaleCount').parent().parent().parent().hide();
			$('#publish_totalNum').parent().parent().parent().hide();
			$('#publish_endTime').parent().parent().parent().hide();
		}else{
			$p.find('#price').attr('placeholder','项目融资单股价格');
			$p.find('.price .title_l strong').html('单股价格');
			$p.find('#price').parent().parent().addClass('crowdfunding-price');
			$p.find('#addHideInfo').parent().parent().find(".vLabel").html('成交留言<em>|</em>');
			$p.find('#cancelHide').html('如果您选择添加成交留言，则该成交留言中的内容，将在买家支付购买金额后在订单中查看');
			//$p.find('#addHide').attr('placeholder','请输入您想要输入的成交留言，最大可输入1000字符');
			$('#publish_unit').parent().hide();
            $p.find('.price .title_r').html('元/股')
            $('#price').css('width','7rem')
			$('.message_show').hide();
		}
        if(params.catId == 8){
            $p.find('.dec .title_l strong').html('项目介绍')
            $p.find('.toaddServiceWantDesc .vCt').html('详细的介绍，吸引更多的购买吆！')
            $('.is_classmate').hide()
        }
		$("#toAddHideLink").click(function(){
			me._data._hideIndex = viewJs.getFocus($('#addHide')[0]);
			var $p = $.mobile.activePage;
			viewJs.toggleCameraShow();
			viewJs.top();
			//var $dlg =$('#toAddDescLink').remove();
			var tpl = $('#addLinkDescTpl').html();
			me.toggleEvents();
			$dlg = $(tpl).hide().enhanceWithin();
			$p.append($dlg);
			setTimeout(function(){
				$dlg.delegate('.cancel-add-link', 'vclick',me.cancelAddLink).
					delegate('.add-link', 'vclick',me.addHideLink);
			},700);
			$dlg.show();
			me.toggleEvents(true);
		});
		//hw
	},typesetting:function(str){
		if(str == null){
			return '';
		}
		return '&nbsp;&nbsp;&nbsp;'+(str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
	},setTitle:function(title){
        var me = addServiceJs;
        me._bLoan = false;
        var $p = $.mobile.activePage;
        var $btn = $p.find('.ui-content:first .vbt.submit');
        if(title == null){
            $btn.hide();
        } else {
            if(title=="贷款申请"){
                $btn.html('申请');
                me._bLoan = true;
            } else {
                $btn.html('提交');
            }
            $btn.show();
        }
        viewJs.setTitle(title || '创新学堂');
    },initProvideService:function(params){
        var me = addServiceJs;
		var userInfo = dmJs.sStore.getUserInfo();
		if(userInfo == null){
			viewJs.dialogPop('请先登录！', function(){
				viewJs.navigator.pre();
			}, '错误', {onlyBtnOk:true});
			return;
		}
		var $p = $.mobile.activePage;
		// 需求详情
		dmJs._ajax({id:'getUserWants',params:params,url:'/urming_quan/want/getWantByID',
			callback:function(data){
				var want = data.want;
				var catId = want.category.id;
				var mapping = {66:26,82:42,71:31,72:32,78:38,57:17,95:96,97:17};
				var serviceCatId = mapping[catId]?mapping[catId]:17;
                if(viewJs.bLoan(want.user.userTags)){
                    me.setTitle('贷款申请');
                } else {
                    //me.setTitle('提供服务');
                    me.setTitle('响应信息');
                    $('.toSelCategories').parent().hide()
                    $('.toSelTag').parent().hide()
                }
				dmJs.findCatById(serviceCatId, function(cat){

					var wantName = want.wantName;
					var wantDesc = want.wantDesc;
					var price = Number(want.price);
					var keyWords = want.user.userTags;
					var unit = want.unit?want.unit:"";
                    var onlyGroup = want.onlyGroup;
					var i = 0,l = keyWords.length;
					for(; i < l; i++){
						keyWords[i] = keyWords[i].tagName;
					}
					var descHtml = '说点啥吧，让大家了解你的服务，增强效果！10字以上200字以内哦';
					wantDesc = descHtml;
					$p.find('.price-unit').html("元"+(unit?("/"+unit):""));
                    $('.title_r').html('元/'+unit)
					me.setFormVals({
						serviceName:wantName,
						tags:keyWords,
						cat:cat,
						serviceDesc:wantDesc,
						price:price,
						unit:unit,
                        onlyGroup:onlyGroup,
                        resInit:true

					});
				});
			}});
	},setFormVals:function(f){
		var me = addServiceJs;
        var tagStr = f.tags.join('，');
		var $p = $.mobile.activePage;
		var $f = $p.find('.vForm-1');
        var on = f.onlyGroup? true:false;
		$f.find('.serviceName').val(f.serviceName);
		$f.find('.toSelCategories .vCt').html(f.cat.categoryName).attr('catId', f.cat.id).attr('edit',1);
		$f.find('.vCt.tags').html(tagStr).attr('edit',1);
		$f.find('.price input').val(Number(f.price));
		$f.find('.toaddServiceWantDesc .vCt').html(me.typesetting(f.serviceDesc) );
        if(!f.resInit){
            $f.find('.toaddServiceWantDesc .vCt').attr('edit',1)
        }
		$f.find('#show_check').attr('checked',on);
		if(typeof(f.hideInfo)!="undefined"){
			$('#addHide').text($('<p>'+f.hideInfo+'</p>').text());
			$("#addHideInfo").click();
		}
		if(typeof(f.address)!="undefined"){
			$("#publish_address").val(f.address);
		}
		if(typeof(f.startTime)!="undefined" && f.startTime.length==19){
			$("#publish_startTime").val(f.startTime.substr(0,10)+"T"+f.startTime.substr(11,5));
		}
		if(typeof(f.unit)!="undefined"){
			$("#publish_unit").val(f.unit);
		}
		if(typeof(f.contactContent)!="undefined"){
			$("#publish_contactContent").val(f.contactContent);
		}
		if(f.contactType>=0){
			$("#publish_contactType").val(f.contactType);
		}
		if(typeof(f.endTime)!="undefined"){
			$("#publish_endTime").val(f.endTime.substr(0,10)+"T"+f.endTime.substr(11,5));
		}
		if(typeof(f.totalNum)!="undefined"){
			$("#publish_totalNum").val(f.totalNum);
		}
		if(typeof(f.maxBuyerCount)!="undefined"){
			$("#publish_maxBuyerCount").val(f.maxBuyerCount);
		}
		if(typeof(f.minSingleSaleCount)!="undefined"){
			$("#publish_minSingleSaleCount").val(f.minSingleSaleCount);
		}
		if(typeof(f.maxSingleSaleCount)!="undefined"){
			$("#publish_maxSingleSaleCount").val(f.maxSingleSaleCount);
		}
		if(typeof(f.worth)!="undefined"){
			$("#publish_worth").val(f.worth);
		}
        if(f.isBigSai){
            $(".toSelCategories").parent().hide()
            $(".price").hide()
        }

	},initEditeService:function(params){
		var me = addServiceJs;
		var $p = $.mobile.activePage;
		var userInfo = dmJs.sStore.getUserInfo();
		if(userInfo == null){
			viewJs.dialogPop('请先登录！', function(){
				viewJs.navigator.pre();
			}, '错误', {onlyBtnOk:true});
			return;
		}
		var params = mainJs.parseUrlSearch();

        function deletArrItem(item,arr){
            var newArr = [];
            for(var i=0;i<arr.length;i++){
                if(item!==arr[i]){
                    newArr.push(arr[i]);
                }
            }
            return newArr;
        }

		dmJs._ajax({id:'initPublishPage',
			url: '/urming_quan/service/'+(params.catId==8?"getCrowdfundingDetail":"getServiceByID"),
			params:{serviceID:params.serviceID,accessToken:userInfo.accessToken}, 
			callback:function(data){
                //console.log(data.service.serviceVersion.tags.indexOf('2016大赛'))

                if(data.service.serviceVersion.tags.indexOf('2016大赛')!='-1'){
                    me.setTitle('编辑大赛项目');
                    var bSai = true;

                }

				var service = params.catId==8?data.detail:data.service.serviceVersion;
				var $p = $.mobile.activePage;
				var catId = service.category.id;
				var picUrl = $.trim(service.picUrl);
				if(picUrl != ''){
					picUrl = picUrl.split(',');
					if(picUrl.length > 0){
						var $ctr = $('#cameraContainer');
						var oldPic = [];
						$.each(picUrl, function(index, item){
							var thumb = new Image();
							thumb.src = mainJs.getSvrPicUrl({url:item,size:2});
							$(thumb).addClass('camera-thumbnails').insertBefore($('#cameraBtn')).attr('oldPic', index).data('img-index', index);
							oldPic[index] = 1;
						});
						$ctr.data('oldPic', oldPic);
					}
				}
				dmJs.findCatById(catId, function(cat){
					var user = params.catId==8?service.user:service.userByUserId;
					var tags = [];
					var userTags = user.userTags;
					if(userTags != null){
						$.each(userTags, function(index, item){
                            if(viewJs._keepDfTag(item.tagName)){
                                tags.push(item.tagName);
                            }
						});
					}
                    if(bSai){
                        tags = deletArrItem('2016大赛',tags)
                        $p.find('.toSelTag').attr('bigSai',true)
                    }
					me.resetLinkMap(service.serviceDesc);
					//hw
					me.resetLinkHideMap(service.hideInfo);
					//hw
					me.setFormVals({
						serviceName:params.catId==8?service.name.replace(/[<>]/g,''):service.serviceName.replace(/[<>]/g,''),
						tags:tags,
						cat:cat,
						serviceDesc:params.catId==8?service.describe:service.serviceDesc,
						price:params.catId==8?service.price:service.newPrice,
						//hw
						hideInfo:service.hideInfo,
						unit:service.unit,
						address:service.address,
						startTime:service.startTime,
						contactContent:service.contactContent,
						contactType:service.contactType,
                        onlyGroup:service.onlyGroup,
						endTime:service.endTime,
						totalNum:service.totalNum,
						maxBuyerCount:service.maxBuyerCount,
						minSingleSaleCount:service.minSingleSaleCount,
						maxSingleSaleCount:service.maxSingleSaleCount,
						worth:service.worth,
                        isBigSai:bSai
						//hw
					});
				});
		}});
	},resetLinkMap:function(html){
		var me = addServiceJs;
		var val = $.trim(html);
		var urlMap = me._data.urlMap;
		for(var k in urlMap){
			if(val.indexOf(k) < 0){
				delete urlMap[k];
			}
		}
		$(['<div>',val,'</div>'].join('')).find('a').each(function(index, lnk){
			var $lnk = $(lnk);
			var txt = $.trim($lnk.text());
			var url = $.trim($lnk.attr('href'));
			if(txt != '' && url!= ''){
				urlMap[txt] = url;
			}
		});
	},resetLinkHideMap:function(html){
		var me = addServiceJs;
		var val = $.trim(html);
		var urlMap = me._data.urlHideMap;
		for(var k in urlMap){
			if(val.indexOf(k) < 0){
				delete urlMap[k];
			}
		}
		$(['<div>',val,'</div>'].join('')).find('a').each(function(index, lnk){
			var $lnk = $(lnk);
			var txt = $.trim($lnk.text());
			var url = $.trim($lnk.attr('href'));
			if(txt != '' && url!= ''){
				urlMap[txt] = url;
			}
		});
	},matchWatnts:function(){
		if(mainJs.parseUrlSearch().catId != 1){
			viewJs.navigator.next({next:{
				url:'myServices.html',id:'myServices',options:{data:{catId:mainJs.parseUrlSearch().catId}}
			}});
			return;
		}
        if(mainJs.parseUrlSearch().catName === 'bigsai'){
            viewJs.navigator.next({
                next:{url:'./searchResult.html', id:'searchResult',options:{
                    data:{orderType:4,
                        area1:'中国',
                        pageSize:20,
                        offset:0,
                        keyword:'2016大赛',
                        longitude:dmJs.params.geolocation.longitude,
                        latitude:dmJs.params.geolocation.latitude,
                        catId:1,
                        categoryParentId:1,
                        searchKind:'services'
                    }
                }},
                lastAuto:false
            });
            return;
        }
        var sec = mainJs.MATCH_WAIT;
		$('#matchWatntsDlg').remove();
		var $m = $(['<div id="matchWatntsDlg"  class="dlgunionPayPop-overlay">',
			'<div class="dlgPop-box ui-footer-fixed">',
			  '<div class="dlg-header">',
				'匹配需求',
			  '</div>',
			  '<div class="dlg-content">',
				'<a  data-role="button"  class="viewResults">查看我的服务</a>',
				'<a data-role="button" data-theme="f" class="matchResults">匹配需求（<span>',sec,'</span> s）</a>',
			  '</div>',
				'</div>',
			'</div>'].join('')).enhanceWithin().appendTo(document.body);
		var $p = $.mobile.activePage;
		var $clock = $m.find('.matchResults>span');
		var $clockHandler;
		var clockFnc = function(){
			if(!$m.is(':hidden')){
				if(sec > 0){
					$clock.html(--sec);
					$clockHandler = setTimeout(clockFnc, 1000);
				} else {
					$m.find('.matchResults').click();
				}
			}
		};
		$clockHandler = setTimeout(clockFnc, 1000);
		$m.undelegate().delegate('.ui-btn', 'click', function(){
			$m.fadeOut();
			var $el = $(this);
			if($el.is('.viewResults')){
				viewJs.navigator.next({next:{
					url:'myServices.html',id:'myServices',options:{data:{catId:mainJs.parseUrlSearch().catId}}
				}});
			} else {
				var categoryName = $.trim($p.find('.toSelCategories>.vCt').text());
				var tagName = (viewJs._appendDfTag($p.find('.toSelTag>.vCt[edit]').text())).replace(/，/g, ',');
				var keyword = $.trim($p.find('.inputCtr>div>.serviceName').val());
				var params = {categoryName:categoryName,tagName:tagName,keyword:keyword};
				viewJs.navigator.next({next:{
					id:'matchWants',
					url:'./matchWants.html',
					options:{
						data:params
					}
				}});
			}
		});
		viewJs.top();
		$m.show();
	},toEditImage:function(){
		var $img = $(this);
		viewJs.top();
		var imgIndex  = $img.data('img-index')
		var me = addServiceJs;
		var isOldPic = $img.is('[oldPic]');
		me.toggleEvents();
		$('#toDeleteImageDlg').remove();
		var src =  isOldPic ? this.src.replace('/160_100/', '/480_300/') : this.src;
		var $dlg = $([
			'<div id="toDeleteImageDlg" class="ui-page itemEditor fullScreen vChild">',
			'<div data-role="header"  style="z-index: 2;">',
			'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
			'<h1>编辑图片</h1>',
			'<a	class="ui-btn finish">删除</a> ',
			'</div>',
			'<div class="content" style="text-align:center;background-repeat:no-repeat;',
			'background-position:center center;background-image:url(',src,');">',
				// '<div style="background-image:url(',this.src,')"></div>',
			'</div>',
			'</div>'].join('')).enhanceWithin();
		$(document.body).append($dlg);
		var $p = $.mobile.activePage;
		$p.hide();
		setTimeout(function(){
			$dlg.delegate('.finish', 'vclick', function(e){
                $dlg.undelegate();
				$img.remove();
				if(isOldPic){
					var $ctr = $('#cameraContainer'); 
					var oldPic = $ctr.data('oldPic');
					oldPic[$img.attr('oldPic')] = 0;
					$ctr.data('oldPic', oldPic);
				}
                me.toggleEvents();
                setTimeout(function(){
                    me.toggleEvents(true);
                    viewJs.toggleCameraShow(true);
                    $p.show();
                    viewJs.top();
                    $dlg.remove();
                }, 500);
			}).delegate('.vBack', 'vclick', function(e){
                viewJs.toggleCameraShow(true);
				$p.show();
				me.toggleEvents(true);
				viewJs.top();
				$dlg.remove();
			});
		}, 500);
	}
};