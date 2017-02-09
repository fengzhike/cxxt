var mineJs = {
	i18n:{
		I01:'裁剪图片贴士：<br>两根手指缩放图片，单根手指拖动裁剪框',
		I02:'裁剪图片贴士：<br>滚动鼠标缩放图片，鼠标左键拖动裁剪框'
	},
	init:function(){
		this.initPage();
		this.toggleEvents(true);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = mineJs;
		$p.unbind('pagebeforehide');
		var $ctr = $p.find('#loginUser-user');
		$ctr.find('#userTile-file').unbind('change');
		$p.undelegate();
		if(isBind){
			$p.on('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('#loginUser-user .myPic', 'vclick',function(e){
					e.preventDefault();
					e.stopPropagation();
					$('#userTile-file').click();
				}).delegate('.ui-header .ui-icon-back', 'vclick', function(){
                    viewJs.navigator.pre();
                });
				$p.delegate('.vbt.vr[child],.btn-grp-1 a[child],.myEnterprise', 'vclick', me.toChildPage);
				$p.delegate('.scan', 'vclick', me.scan);
				$p.delegate('.btn-grp-1 .btn-block.hasData', 'vclick', me.toGetDetailList)
					.delegate('.h-menu [action]', 'vclick',headerFooterJs. _action);
				$ctr.find('#userTile-file').change(me.takePic);
				$p.delegate('.user-rank','vclick',me.openRankDescribe);
			},500);
		}
	},toEditLargeImage:function($canvas){
		var me = mineJs;
		me.toggleEvents();
		$('#toEditLargeImageDlg').remove();
		var $dlg = $([
			'<div id="toEditLargeImageDlg" class="ui-page itemEditor fullScreen vChild">',
			'<div data-role="header"  style="z-index: 2;">',
			'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
			'<h1>编辑图片</h1>',
			'<a	class="ui-btn finish">完成</a> ',
			'</div>',
			'<div class="content">',
				'<div id ="quickCrop-help" style="position:relative;background-color: #2c3e50;margin-top:.5em;padding:.5em;"></div>',
				'<div class="photoViewCtr" style="max-width:100%;max-height:100%;text-align:center;">',
					'<div id="cropScaleTarget" class="imgEditor" style="display:inline-block;width:auto;height:auto;">',
						
					'</div>',
				'</div>',
			'</div>',
			'</div>'].join('')).hide().enhanceWithin();
		$(document.body).append($dlg);
		var w = Number($canvas.attr('id', 'cropCanvas').attr('width'));
		var h = Number($canvas.attr('height'));
		var bx = (w+4-230)/2;
		var by = (h+4+230)/2;
		 var crop  = $([
			'<div id= "cropTarget" draggable="true" style="margin-left:',bx+'px;margin-top:-',by+'px;',
			'position: absolute;outline:rgba(0, 0, 0, .6) solid 10000px;width:',230,'px;height:',230,'px;',
			'">',
				
			'</div>'
		].join(''));
		var $viewer = $dlg.find('.content>.photoViewCtr>.imgEditor').empty().append($canvas).append(crop);
		$dlg.show();
		var isMobile = browser.versions.mobile;
		var tip = isMobile ? me.i18n.I01 : me.i18n.I02;
		$('#quickCrop-help').html('<span class="vclose" style="float:right;padding: 0 .5em;">X</span><div>'+tip+'</div>')
			.show().find('.vclose').on('tap', function(){
				$('#quickCrop-help').slideToggle(700);
		});
		var setStyle = function(key, val){
			$(this).css(key, val);
			// var capitalizeKey = String.fromCharCode(key.charCodeAt(0)-32)+key.substr(1);
			// this.style[key] = this.style['Moz'+capitalizeKey]
			// = this.style['webkit'+capitalizeKey] = val;
		}
		setTimeout(function(){
			var cropScaleTarget = document.getElementById("cropCanvas");
			setStyle.apply(cropScaleTarget, ['transition', 'all ease 0.05s']);
			touch.on('#cropCanvas', 'touchstart', function(ev){
				ev.preventDefault();
			});
			var initialScale = 1;
			var currentScale;
			var dx, dy;
			var minScale = Math.max(200/w, 200/h);
			touch.on('#cropScaleTarget', 'pinch', function(ev){
				currentScale = ev.scale - 1;
				currentScale = initialScale + currentScale;
				currentScale = currentScale > 2 ? 2 : currentScale;
				currentScale = currentScale < minScale ? minScale : currentScale;
				setStyle.apply(cropScaleTarget, ['transform', 'scale(' + currentScale + ')']);
				//console.log("当前缩放比例为:" + currentScale + ".");
			});

			touch.on('#cropScaleTarget', 'pinchend', function(ev){
				initialScale = currentScale;
			});
			$('#cropCanvas').on('mousewheel', function(e){
				var ev = e.originalEvent;
				var diffScale = 0;
				if(ev.deltaY > 0){
					diffScale = 0.01;
				} else {
					diffScale = -0.01;
				}
				currentScale = initialScale + diffScale;
				currentScale = currentScale > 2 ? 2 : currentScale;
				currentScale = currentScale < minScale ? minScale : currentScale;
				setStyle.apply(cropScaleTarget, ['transform', 'scale(' + currentScale + ')']);
				initialScale = currentScale;
			});
			touch.on('#cropTarget', 'touchstart', function(ev){
				ev.preventDefault();
			});
			var target = crop[0];
			touch.on('#cropTarget', 'drag', function(ev){
				dx = dx || 0;
				dy = dy || 0;
				var offx = dx + ev.x + "px";
				var offy = dy + ev.y + "px";
				setStyle.apply(target, ['transform', "translate3d(" + offx + "," + offy + ",0)"]);
			});

			touch.on('#cropTarget', 'dragend', function(ev){
				dx += ev.x;
				dy += ev.y;
			});
			$dlg.delegate('.ui-btn.vBack', 'vclick', function(){
                me.toggleEvents();
				$dlg.remove();
				me.toggleEvents(true);
			});
			$dlg.delegate('.ui-btn.finish', 'vclick', function(){
				var scale = currentScale == null ? 1 : currentScale;
				var rw = rh = Math.round(150/scale);
				dx = dx == null ? 0 : dx;
				dy = dy == null ? 0 : dy;
				var x = Math.floor(w/2 + dx/scale - rw/2);
				var y = Math.floor(h/2 + dy/scale - rh/2);
				//console.log([x, y, rw, rh]);
				var c = $canvas[0];
				var t = c.getContext('2d');
				var d = t.getImageData(x, y, rw, rh);
				$canvas.attr({width:rw,height:rh});
				t.putImageData(d, 0, 0);
				var img = new Image();
				img.onload = function(){
					// 统一图片规格：150x150
					$canvas.attr({width:150,height:150});
					t.clearRect(0,0, c.width, c.height);
					t.drawImage(this, 0, 0, rw, rh,0,0,150,150);
					var dl = c.toDataURL();
					$('#loginUser-user').find('.myPic').attr('src', dl);
					$dlg.remove();
					me.toggleEvents(true);
					me.uploadPortraitByFile();
				};
				img.src = c.toDataURL();
			});
		}, 500);
	},setRemindTips:function(data){
        var $p = $.mobile.activePage;
        if(data.courseHint||data.serviceHint||data.wantHint||data.questionHint||data.activityHint){
            $p.find('.remind').show();
        }else{
            $p.find('.remind').hide();
        }
        //console.log(111)
    },uploadPortraitByFile:function(){
		var userInfo = dmJs.sStore.getUserInfo();
		var accessToken = userInfo.accessToken;
		var formData = new FormData();
		formData.append('accessToken', accessToken);
		formData.append('picString', $('#loginUser-user').find('.myPic').attr('src').split(',')[1]);
		dmJs.ajaxForm(formData, mainJs.getApiUrl('/urming_quan/user/uploadPortraitByFile'), function(data){
			userInfo.user.profileImageUrl = data.user.profileImageUrl;
			userInfo.saveSelf();
			viewJs.showPopMsg('修改头像成功');
		});
	},takePic:function(){
		var files = this.files;
		if (!files.length) return;
		var f = files[0];
		mineJs.makeThumb(f);
	},loadThumb:function(){
		viewJs.loadJs([{
				ns:$('<div>'), varName:'makeThumb', url:'/js/make-thumb/make-thumb.min.js?__ver=2',
				title:'缩略图工具'},
				{
					ns:window, varName:'touch', url:'/js/plugin/touch/touch-0.2.14.min.js',
					title:'触控组件'
				}
			], {});
	},getStaticNum:function(){
        var userInfo = dmJs.sStore.getUserInfo();
		var accessToken = userInfo.accessToken;
		if(accessToken == null || accessToken == ''){
			return;
		}
		var $p = $.mobile.activePage;
		var accessInvalid = function(){
			dmJs.sStore.toLogin({url:'./mine.html'});
		};

		dmJs._ajax({
			id:"getUserPageByAccessToken",
			url:'/urming_quan/user/getUserPageByAccessToken',
			accessInvalid:accessInvalid,
			params:{accessToken:accessToken,type:2},
			callback:function(data){
                var storeNumber = data.storeNumber;
                var followedNumber = data.followedNumber;
                var followingNumber = data.followingNumber;
                var balance = data.user.balance;
                var virtualcurr = data.user.virtualcurr;
                userInfo.user = data.user;
                userInfo.saveSelf();
                $p.find('.myBalance>span:nth-child(1)').html(Number(balance));
                $p.find('.myBalance>span:nth-child(2)').html(Number(virtualcurr));
				/*
                var numInfo = {
                    myStoreNum:storeNumber,
                    myFollowNum:followingNumber,
                    myFansNum:followedNumber,
                    myStoreNone:storeNumber == 0 ? '' : 'hasData',
                    myFollowNone:followingNumber == 0 ? '' : 'hasData',
                    myFansNone:followedNumber == 0 ? '' : 'hasData'
                };
                var tpl = $p.find('#btn-grp-1_tpl').html();
                var $btnGrp = $p.find('.btn-grp-1');
                $btnGrp.html(viewJs.applyTpl(tpl, numInfo));
				*/
			}
		});
	},toGetDetailList:function(){
		var action = $(this).attr('action');
        var next;
        switch(action){
            case 'myStore':
                next = {id:'favorite',url:'./favorite.html'};
                break;
            case 'myFollow':
                next = {id:'follow',url:'./follow.html'};
                break;
            case 'myFans':
                next = {id:'fans',url:'./fans.html'};
                break;
        }
        if(next){
            viewJs.navigator.next({next:next,lastAuto:true});
        }
	},toChildPage:function(){
		var $el = $(this);
		var child = $el.attr('child');
        //console.log(child)
		var me = mineJs;
		var user = dmJs.sStore.getUserInfo();
		var next,invalid;
        //if(child ==='')
		next = {url:'./'+child+'.html', id:child};
		if(user == null){
			next.last = {url:'./mine.html', id:'mine'};
			dmJs.sStore.reLogin(next);
			return;
		} 
		if(invalid != null){
			viewJs.showPopMsg(invalid);
			return;
		}
		var params = {};
		switch(child){
            case 'myOrders':
				//params.catId = '1';
				next.url='myOrders.html';
				next.id='myOrders';
				next.options={data:params};
                break;
			case 'myCourseOrders':
				params.catId = '3';
				next.url='myOrders.html';
				next.id='myOrders';
				next.options={data:params};
                break;
            case 'myActivityOrders':
				params.catId = '4';
				next.url='myOrders.html';
				next.id='myOrders';
				next.options={data:params};
                break;
			case 'myServices':
				params.catId = '1';
				next.url='myServices.html';
				next.id='myServices';
				next.options={data:params};
				break;
			case 'myCourses':
				params.catId = '3';
				next.url='myServices.html';
				next.id='myServices';
				next.options={data:params};
				break;
			case 'myCrowdfunding':
				params.catId = '8';
				next.url='myServices.html';
				next.id='myServices';
				next.options={data:params};
				break;
			case 'myActivities':
				params.catId = '4';
				next.url='myServices.html';
				next.id='myServices';
				next.options={data:params};
				break;
			case 'myWants':
				params.catId = '2';
				next.url='myWants.html';
				next.id='myWants';
				next.options={data:params};
				break;
			case 'myQuestions':
				params.catId = '5';
				next.url='myQuestions.html';
				next.id='myQuestions';
				next.options={data:params};
				break;
			case 'toMyTeachers':
				next.url='toMyTeachers.html';
				next.id='toMyTeachers';
				next.options={data:params};
				break;
			case 'u':
				params.userId = $el.data('institutionUserId');
				next.url='u.html';
				next.id='u';
				next.options={data:params};
				break;
            case 'mygroup':
                params.userId = dmJs.sStore.getUserInfo().user.id;
                next.url='mygroup.html';
                next.id='mygroup';
                next.options={data:params};
                break;
            case 'myProject':
                params.userId = dmJs.sStore.getUserInfo().user.id;
                next.url='myProject.html';
                next.id='myProject';
                next.options={data:params};
                break;
            case 'buyorder':
                //params.userId = dmJs.sStore.getUserInfo().user.id;
                params.type = 0;
                params.userType = 1;
                next.url='buyorder.html';
                next.id='buyorder';
                next.options={data:params};
                break;
            case 'saleorder':
                //params.userId = dmJs.sStore.getUserInfo().user.id;
                params.type = 0;
                params.userType = 2;
                next.url='buyorder.html';
                next.id='buyorder';
                next.options={data:params};
                break;
        }

		viewJs.navigator.next({next:next,lastAuto:true});
		
	},makeThumb:function(file){
		var me = mineJs;
		var $file = $('#userTile-file');
		viewJs.maskReadImg();
        //console.log(file.type)
		var maxSize  = [Math.max(150, Math.min(1024, $(window).width())),
			Math.max(150, Math.min(1024, $(window).height()))];
		$file.makeThumb(file, {
			keepCanvas:true,
			maxWidth:maxSize[0],
			maxHeight:maxSize[1],
			success: function(dataURL, tSize, file, sSize, fEvt, $canvas) {
				// 可以得到图片名, 高度等信息, 用来做一些判断, 比如图片大小是否符合要求等..
				me.toEditLargeImage($canvas);
				$file.val('');
				viewJs.finishReadImg();
			},error:function(){
				viewJs.finishReadImg();
				viewJs.showPopMsg('文件读取失败');
			}
			});
	},initPage:function(){
        var me = mineJs;
		viewJs.afterToggleLogin();
		var user = dmJs.sStore.getUserInfo();
		// 页面
		if(user == null){
			return;
		}
		this.loadThumb();
		this.getStaticNum();
		var $p = $('#mine');
		var info = user.user;
        var isGroup = info.isGroup;
		var accessToken = user.accessToken;
		var isMoneyGuaranteed = info.isMoneyGuaranteed;
		var isIdcardValidated = info.isIdcardValidated;
		var isTeacherValidated = info.isTeacherValidated;
		var userType = info.type;
		var balance = info.balance;
		var $s = $p.find('.signInDiv');
		$s.find('.myName .name').html(info.realname);
		viewJs.setSexMarkCls(info, $s.find('.mark.sex'));
		var rankArr = ["","创新预备生","一级创新学员","二级创新学员","三级创新学员","四级创新学员","五级创新学员","六级创新学员"
			,"七级创新学员","八级创新学员","九级创新学员","一级创新导师","二级创新导师","三级创新导师","四级创新导师","五级创新导师",
			"六级创新导师","七级创新导师" ,"八级创新导师","九级创新导师","十级创新导师"];
		$s.find('.user-rank').text(rankArr[info.rank]);
		// 认证
		$s.find('.mark.idcardValidated').removeClass('enterprise').removeClass('unauthorized-enterprise').removeClass('teacher').removeClass('unauthorized-teacher').removeClass('person').removeClass('empty');

        /*师资账户不显示我的公众号
        if(userType == 3||isTeacherValidated==1){
            $p.find('a[child="mygroup"]').show();
        }
        */
        if(userType == 2){
            var idcardValidated = isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
            if(isGroup){
                idcardValidated = 'project';
            }
			$s.find('.mark.idcardValidated').addClass(idcardValidated);
			var rankArr = "";
			for(var i=0;i<parseInt((info.rank-1)/5);i++){
				rankArr+='<img src="resource/images/icon_diamond_img.png"/>';
			}
			for(var i=0;i<parseInt((info.rank-1)%5);i++){
				rankArr+='<img src="resource/images/icon_star_img.png"/>';
			}
			$s.find('.user-rank').html(rankArr);
            if(isGroup==1){
                $p.find('.myProject').html('项目成员')
            }else{
                $p.find('a[child="myGroup"]').show();
                $p.find('a[child="myProject"]').hide();
            }
/*
            if(isGroup==1){
                $p.find('a[child="myTeachers"]').hide(hide);
                $p.find('a[child="myGroup1"]').show();
            }else{
                //$p.find('a[child="myTeachers"]').show();
                //$p.find('a[child="myGroup1"]').hide();
            }
*/
		} else if(isTeacherValidated == 1 || userType == 3){
			$s.find('.mark.idcardValidated').addClass(info.isIdcardValidated == 1?'teacher':'unauthorized-teacher');
			var rankTeacherArr = ["","初级创新教练","一级创新教练","二级创新教练","三级创新教练","四级创新教练","五级创新教练","六级创新教练",
				"七级创新教练","八级创新教练","九级创新教练","初级创新导师","一级创新导师","二级创新导师","三级创新导师","四级创新导师",
				"五级创新导师","六级创新导师","七级创新导师","八级创新导师","九级创新导师","师圣"];
			$s.find('.user-rank').text(rankTeacherArr[info.rank]);
		}else if(isIdcardValidated == 1){
			$s.find('.mark.idcardValidated').addClass('person');
		}else{
			$s.find('.mark.idcardValidated').addClass('empty');
		}
		/*
		if(isMoneyGuaranteed == '1'){
			$s.find('.mark.bank').addClass('validateBankCardOK');
		} else {
			$s.find('.mark.bank').removeClass('validateBankCardOK');
		}
		*/

		if(userType == 2){
			if(isGroup == 1){
				$p.find(".toMyTeachers").parent().hide();
			}else{
				$p.find('.mygroup').parent().hide();
			}
		}else{
			$p.find(".toMyTeachers").parent().hide();
			$p.find(".toPublishSvrs[child='myCrowdfunding']").hide();
		}
		if(info.institutionUserId){
			$p.find(".myEnterprise").data('institutionUserId',info.institutionUserId);
			$p.find(".myEnterprise img").attr('src',mainJs.getProfilePicUrl({url:info.institutionProfileImageUrl, sex:2}));
			$p.find(".myEnterprise .institutionUserName").html(info.institutionUserName);
		}else{
			$p.find(".myEnterprise").hide();
		}
		$p.find('.myPic').attr('src',mainJs.getProfilePicUrl({url:info.profileImageUrl, sex:info.sex}));
        //fsk红点提醒
        var params = {
            accessToken : dmJs.sStore.getUserInfo()?dmJs.sStore.getUserInfo().accessToken:'',
            distance:5000,
            longitude: dmJs.params.geolocation.longitude,
            latitude: dmJs.params.geolocation.latitude

        }

        dmJs._ajax({
            id:'getAroundHints',
            url:'/urming_quan/system/getAroundHints',
            params:params,
            callback:me.setRemindTips
        });



		/*if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger") {
			$.get(mainJs.getApiUrl('/urming_quan/user/getWxJsApi'), {
                url:location.href.split('#')[0],random:Math.random()
            }, function(data){
                //console.log('微信测试')
				var r = $.parseJSON(data);
                //console.log(r)
				wx.config({
					debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
					appId: 'wx3b462eee381207f3', // 必填，公众号的唯一标识
					timestamp: r.timestamp , // 必填，生成签名的时间戳
					nonceStr: r.noncestr, // 必填，生成签名的随机串
					signature: r.signature,// 必填，签名，见附录1
					jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
				});
				wx.ready(function(){
					wx.error(function(res){
						alert(res);
						// config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
					});
				});
			}).error(function(){
				viewJs.showPopMsg('网络错误');
			});
		}else{
			$(".scan").parent().hide();
		}*/
	},scan:function(){
		wx.scanQRCode({
            desc: 'scanQRCode desc',
			needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
			scanType: ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有
			success: function (res) {
				var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
				if(result.indexOf("euming.com")<0){
					viewJs.dialogPop('二维码无效！',function(ret){
						if(ret){

						}
					},'提示',{
						onlyBtnOk:true
					})
				}else{
					window.location.href=result;
				}
			}
		});
	},openRankDescribe:function(event){
		var user = dmJs.sStore.getUserInfo();
		var next = {id:'userRankDescribe',url:'./userRankDescribe.html',options:{data:{userId:user.user.id}}};
		var lastParams=mainJs.parseUrlSearch();
		var last = {url:'mine.html', id:'mine', options:{data:lastParams}};
		viewJs.navigator.next({next:next,last:last,lastAuto:false});
		event.stopPropagation();
	}
};

!function(a,b){"function"==typeof define&&(define.amd||define.cmd)?define(function(){return b(a)}):b(a,!0)}(this,function(a,b){function c(b,c,d){a.WeixinJSBridge?WeixinJSBridge.invoke(b,e(c),function(a){g(b,a,d)}):j(b,d)}function d(b,c,d){a.WeixinJSBridge?WeixinJSBridge.on(b,function(a){d&&d.trigger&&d.trigger(a),g(b,a,c)}):d?j(b,d):j(b,c)}function e(a){return a=a||{},a.appId=z.appId,a.verifyAppId=z.appId,a.verifySignType="sha1",a.verifyTimestamp=z.timestamp+"",a.verifyNonceStr=z.nonceStr,a.verifySignature=z.signature,a}function f(a){return{timeStamp:a.timestamp+"",nonceStr:a.nonceStr,"package":a.package,paySign:a.paySign,signType:a.signType||"SHA1"}}function g(a,b,c){var d,e,f;switch(delete b.err_code,delete b.err_desc,delete b.err_detail,d=b.errMsg,d||(d=b.err_msg,delete b.err_msg,d=h(a,d,c),b.errMsg=d),c=c||{},c._complete&&(c._complete(b),delete c._complete),d=b.errMsg||"",z.debug&&!c.isInnerInvoke&&alert(JSON.stringify(b)),e=d.indexOf(":"),f=d.substring(e+1)){case"ok":c.success&&c.success(b);break;case"cancel":c.cancel&&c.cancel(b);break;default:c.fail&&c.fail(b)}c.complete&&c.complete(b)}function h(a,b){var d,e,f,g;if(b){switch(d=b.indexOf(":"),a){case o.config:e="config";break;case o.openProductSpecificView:e="openProductSpecificView";break;default:e=b.substring(0,d),e=e.replace(/_/g," "),e=e.replace(/\b\w+\b/g,function(a){return a.substring(0,1).toUpperCase()+a.substring(1)}),e=e.substring(0,1).toLowerCase()+e.substring(1),e=e.replace(/ /g,""),-1!=e.indexOf("Wcpay")&&(e=e.replace("Wcpay","WCPay")),f=p[e],f&&(e=f)}g=b.substring(d+1),"confirm"==g&&(g="ok"),"failed"==g&&(g="fail"),-1!=g.indexOf("failed_")&&(g=g.substring(7)),-1!=g.indexOf("fail_")&&(g=g.substring(5)),g=g.replace(/_/g," "),g=g.toLowerCase(),("access denied"==g||"no permission to execute"==g)&&(g="permission denied"),"config"==e&&"function not exist"==g&&(g="ok"),b=e+":"+g}return b}function i(a){var b,c,d,e;if(a){for(b=0,c=a.length;c>b;++b)d=a[b],e=o[d],e&&(a[b]=e);return a}}function j(a,b){if(!(!z.debug||b&&b.isInnerInvoke)){var c=p[a];c&&(a=c),b&&b._complete&&delete b._complete,console.log('"'+a+'",',b||"")}}function k(){if(!("6.0.2">w||y.systemType<0)){var b=new Image;y.appId=z.appId,y.initTime=x.initEndTime-x.initStartTime,y.preVerifyTime=x.preVerifyEndTime-x.preVerifyStartTime,C.getNetworkType({isInnerInvoke:!0,success:function(a){y.networkType=a.networkType;var c="https://open.weixin.qq.com/sdk/report?v="+y.version+"&o="+y.isPreVerifyOk+"&s="+y.systemType+"&c="+y.clientVersion+"&a="+y.appId+"&n="+y.networkType+"&i="+y.initTime+"&p="+y.preVerifyTime+"&u="+y.url;b.src=c}})}}function l(){return(new Date).getTime()}function m(b){t&&(a.WeixinJSBridge?b():q.addEventListener&&q.addEventListener("WeixinJSBridgeReady",b,!1))}function n(){C.invoke||(C.invoke=function(b,c,d){a.WeixinJSBridge&&WeixinJSBridge.invoke(b,e(c),d)},C.on=function(b,c){a.WeixinJSBridge&&WeixinJSBridge.on(b,c)})}var o,p,q,r,s,t,u,v,w,x,y,z,A,B,C;if(!a.jWeixin)return o={config:"preVerifyJSAPI",onMenuShareTimeline:"menu:share:timeline",onMenuShareAppMessage:"menu:share:appmessage",onMenuShareQQ:"menu:share:qq",onMenuShareWeibo:"menu:share:weiboApp",onMenuShareQZone:"menu:share:QZone",previewImage:"imagePreview",getLocation:"geoLocation",openProductSpecificView:"openProductViewWithPid",addCard:"batchAddCard",openCard:"batchViewCard",chooseWXPay:"getBrandWCPayRequest"},p=function(){var b,a={};for(b in o)a[o[b]]=b;return a}(),q=a.document,r=q.title,s=navigator.userAgent.toLowerCase(),t=-1!=s.indexOf("micromessenger"),u=-1!=s.indexOf("android"),v=-1!=s.indexOf("iphone")||-1!=s.indexOf("ipad"),w=function(){var a=s.match(/micromessenger\/(\d+\.\d+\.\d+)/)||s.match(/micromessenger\/(\d+\.\d+)/);return a?a[1]:""}(),x={initStartTime:l(),initEndTime:0,preVerifyStartTime:0,preVerifyEndTime:0},y={version:1,appId:"",initTime:0,preVerifyTime:0,networkType:"",isPreVerifyOk:1,systemType:v?1:u?2:-1,clientVersion:w,url:encodeURIComponent(location.href)},z={},A={_completes:[]},B={state:0,res:{}},m(function(){x.initEndTime=l()}),C={config:function(a){z=a,j("config",a);var b=z.check===!1?!1:!0;m(function(){var a,d,e;if(b)c(o.config,{verifyJsApiList:i(z.jsApiList)},function(){A._complete=function(a){x.preVerifyEndTime=l(),B.state=1,B.res=a},A.success=function(){y.isPreVerifyOk=0},A.fail=function(a){A._fail?A._fail(a):B.state=-1};var a=A._completes;return a.push(function(){z.debug||k()}),A.complete=function(){for(var c=0,d=a.length;d>c;++c)a[c]();A._completes=[]},A}()),x.preVerifyStartTime=l();else{for(B.state=1,a=A._completes,d=0,e=a.length;e>d;++d)a[d]();A._completes=[]}}),z.beta&&n()},ready:function(a){0!=B.state?a():(A._completes.push(a),!t&&z.debug&&a())},error:function(a){"6.0.2">w||(-1==B.state?a(B.res):A._fail=a)},checkJsApi:function(a){var b=function(a){var c,d,b=a.checkResult;for(c in b)d=p[c],d&&(b[d]=b[c],delete b[c]);return a};c("checkJsApi",{jsApiList:i(a.jsApiList)},function(){return a._complete=function(a){if(u){var c=a.checkResult;c&&(a.checkResult=JSON.parse(c))}a=b(a)},a}())},onMenuShareTimeline:function(a){d(o.onMenuShareTimeline,{complete:function(){c("shareTimeline",{title:a.title||r,desc:a.title||r,img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},onMenuShareAppMessage:function(a){d(o.onMenuShareAppMessage,{complete:function(){c("sendAppMessage",{title:a.title||r,desc:a.desc||"",link:a.link||location.href,img_url:a.imgUrl||"",type:a.type||"link",data_url:a.dataUrl||""},a)}},a)},onMenuShareQQ:function(a){d(o.onMenuShareQQ,{complete:function(){c("shareQQ",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},onMenuShareWeibo:function(a){d(o.onMenuShareWeibo,{complete:function(){c("shareWeiboApp",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},onMenuShareQZone:function(a){d(o.onMenuShareQZone,{complete:function(){c("shareQZone",{title:a.title||r,desc:a.desc||"",img_url:a.imgUrl||"",link:a.link||location.href},a)}},a)},startRecord:function(a){c("startRecord",{},a)},stopRecord:function(a){c("stopRecord",{},a)},onVoiceRecordEnd:function(a){d("onVoiceRecordEnd",a)},playVoice:function(a){c("playVoice",{localId:a.localId},a)},pauseVoice:function(a){c("pauseVoice",{localId:a.localId},a)},stopVoice:function(a){c("stopVoice",{localId:a.localId},a)},onVoicePlayEnd:function(a){d("onVoicePlayEnd",a)},uploadVoice:function(a){c("uploadVoice",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},downloadVoice:function(a){c("downloadVoice",{serverId:a.serverId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},translateVoice:function(a){c("translateVoice",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},chooseImage:function(a){c("chooseImage",{scene:"1|2",count:a.count||9,sizeType:a.sizeType||["original","compressed"],sourceType:a.sourceType||["album","camera"]},function(){return a._complete=function(a){if(u){var b=a.localIds;b&&(a.localIds=JSON.parse(b))}},a}())},previewImage:function(a){c(o.previewImage,{current:a.current,urls:a.urls},a)},uploadImage:function(a){c("uploadImage",{localId:a.localId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},downloadImage:function(a){c("downloadImage",{serverId:a.serverId,isShowProgressTips:0==a.isShowProgressTips?0:1},a)},getNetworkType:function(a){var b=function(a){var c,d,e,b=a.errMsg;if(a.errMsg="getNetworkType:ok",c=a.subtype,delete a.subtype,c)a.networkType=c;else switch(d=b.indexOf(":"),e=b.substring(d+1)){case"wifi":case"edge":case"wwan":a.networkType=e;break;default:a.errMsg="getNetworkType:fail"}return a};c("getNetworkType",{},function(){return a._complete=function(a){a=b(a)},a}())},openLocation:function(a){c("openLocation",{latitude:a.latitude,longitude:a.longitude,name:a.name||"",address:a.address||"",scale:a.scale||28,infoUrl:a.infoUrl||""},a)},getLocation:function(a){a=a||{},c(o.getLocation,{type:a.type||"wgs84"},function(){return a._complete=function(a){delete a.type},a}())},hideOptionMenu:function(a){c("hideOptionMenu",{},a)},showOptionMenu:function(a){c("showOptionMenu",{},a)},closeWindow:function(a){a=a||{},c("closeWindow",{immediate_close:a.immediateClose||0},a)},hideMenuItems:function(a){c("hideMenuItems",{menuList:a.menuList},a)},showMenuItems:function(a){c("showMenuItems",{menuList:a.menuList},a)},hideAllNonBaseMenuItem:function(a){c("hideAllNonBaseMenuItem",{},a)},showAllNonBaseMenuItem:function(a){c("showAllNonBaseMenuItem",{},a)},scanQRCode:function(a){a=a||{},c("scanQRCode",{needResult:a.needResult||0,scanType:a.scanType||["qrCode","barCode"]},function(){return a._complete=function(a){var b,c;v&&(b=a.resultStr,b&&(c=JSON.parse(b),a.resultStr=c&&c.scan_code&&c.scan_code.scan_result))},a}())},openProductSpecificView:function(a){c(o.openProductSpecificView,{pid:a.productId,view_type:a.viewType||0},a)},addCard:function(a){var e,f,g,h,b=a.cardList,d=[];for(e=0,f=b.length;f>e;++e)g=b[e],h={card_id:g.cardId,card_ext:g.cardExt},d.push(h);c(o.addCard,{card_list:d},function(){return a._complete=function(a){var c,d,e,b=a.card_list;if(b){for(b=JSON.parse(b),c=0,d=b.length;d>c;++c)e=b[c],e.cardId=e.card_id,e.cardExt=e.card_ext,e.isSuccess=e.is_succ?!0:!1,delete e.card_id,delete e.card_ext,delete e.is_succ;a.cardList=b,delete a.card_list}},a}())},chooseCard:function(a){c("chooseCard",{app_id:z.appId,location_id:a.shopId||"",sign_type:a.signType||"SHA1",card_id:a.cardId||"",card_type:a.cardType||"",card_sign:a.cardSign,time_stamp:a.timestamp+"",nonce_str:a.nonceStr},function(){return a._complete=function(a){a.cardList=a.choose_card_info,delete a.choose_card_info},a}())},openCard:function(a){var e,f,g,h,b=a.cardList,d=[];for(e=0,f=b.length;f>e;++e)g=b[e],h={card_id:g.cardId,code:g.code},d.push(h);c(o.openCard,{card_list:d},a)},chooseWXPay:function(a){c(o.chooseWXPay,f(a),a)}},b&&(a.wx=a.jWeixin=C),C});