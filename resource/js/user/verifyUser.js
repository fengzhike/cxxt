var verifyUserJs = {
	init:function(){
		$('#toViewLargerImageDlg').remove();
		var user;
		if(!(user = this.preInit())){
			return;
		}
		this.initPage(user);
		this.loadThumb();
		this.toggleEvents(true);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		$p.undelegate();
		$p.find('#verify-idNumber').unbind('input');
		var me = this;
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			$p.find('#verify-idNumber').on('input', me.alphanumeric);
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('#addIDPhotoBtn', 'vclick',function(){
					$('#addIDPhoto').click();
				});
				$p.delegate('#addIDPhoto', 'change', me.takePic);
				$p.delegate('.camera-thumbnails', 'vclick', me.toViewLargerImage);
				$p.delegate('.vbt.submit', 'vclick', me.submit);
                $p.delegate('input[name=name]','input',viewJs.validInput);
			},500);
		}
	},preInit:function(){
		var userInfo = dmJs.sStore.getUserInfo();
		var invalid;
		if(userInfo == null){
			viewJs.showPopMsg('请先登录');
			dmJs.sStore.toLogin({
				url:'./verifyUser.html',
				id:'verifyUser',
				options:{data:mainJs.parseUrlSearch()}
			});
			return;
		} else if(userInfo.user.isIdcardValidated==2 || userInfo.user.isTeacherValidated==2){
			invalid = "认证正在审核中";
		} else if((userInfo.user.type==1 && userInfo.user.isTeacherValidated==1) || (userInfo.user.type>1 && userInfo.user.isIdcardValidated==1)){
			invalid = "您已通过认证";
		}
		if(invalid){
			viewJs.showPopMsg(invalid);
			viewJs.navigator.pre();
			return;
		}/*else if(invalid = viewJs.isLockVerifyIdentity(userInfo.user.isIdcardValidated)){
			viewJs.showPopMsg(invalid);
			viewJs.navigator.pre();
			return;
		}*/
		return userInfo.user;
	},initPage:function(user){
		var $p = $.mobile.activePage;
		$p.removeClass('isEnterprise isPerson isTeacher');
        var initParams = mainJs.parseUrlSearch();
        var userType = $.trim(initParams.userType);
		if(userType == '' || userType == 'person'){
			$p.addClass('isPerson');
		} else if(userType == 'teacher'){
			$p.addClass('isTeacher');
		} else {
			$p.addClass('isEnterprise');
		}
		if(userType == 'teacher'){
			$p.find('.vbt.submit').html("下一步");
		}
		if(viewJs.isLockVerifyIdentity(user.isIdcardValidated)  || user.isMoneyGuaranteed == '1'){
			$p.find('#verify-name').attr('readonly', '').val(user.realname);
		}
	},alphanumeric:function(){
		var $el = $(this);
		var val = $.trim($el.val());
		$el.val(val.replace(/[^\da-zA-Z]/g,''));
 	},submit:function(){
		viewJs.maskBusy(null, 'submit');
		var $p = $.mobile.activePage;
		var me = verifyUserJs;
		var f = {};
		$p.find('.vForm-3:visible input').each(function(i, item){
			var $item = $(item);
			f[$item.attr('name')] = $.trim($item.val());
		});
		var name = f.name;
		var num = f.num;
		
		var userInfo = dmJs.sStore.getUserInfo();
		// 1-个人；2-公众号
		var userType,label1,label2,label3;
		if($p.is('.isEnterprise')){
			userType = 2;
			label1 = '公众号名称';
			label2 = '营业执照编号';
			label3 = '请上传证明文件照片';
		} else {
			userType = 1;
			label1 = '姓名';
			label2 = '身份证号';
			label3 = '请上传 身份证照片';
		}
		var msg = viewJs.validate({must:true, val:name, name:label1});
		if(!msg && userType == 1){
			msg = viewJs.validate({must:true, val:num, name:label2});
		}
        if(!msg && userType == 1){
            msg = me.validateIDCard(num+'');
        }
		var picString;
		if(!msg){
			picString= $('#addIDPhotoCtr').find('img.camera-thumbnails').attr('src');
			if(picString == null){
				msg = label3;
			}
		}
		if(msg){
			viewJs.hideBusyMask('submit');
			viewJs.showPopMsg(msg);
			return;
		}
		picString = picString.split(',')[1];
		var formData = new FormData();
		formData.append("picString", picString);
		formData.append("accessToken", dmJs.getAccessToken());
		formData.append("name"+1, name);
		formData.append("num"+1, num);
		formData.append("type", userType);
		viewJs.hideBusyMask('submit');
		dmJs.ajaxForm(formData, mainJs.getApiUrl('/urming_quan/user/userVerify'), function(){
//			viewJs.showPopMsg('敬请等待审核');
			var userInfo =dmJs.sStore.getUserInfo();
			if(mainJs.parseUrlSearch().userType=='teacher'){
				viewJs.navigator.next({next:{
					id:'verifyTeacher',
					url:'./verifyTeacher.html'
				},last:{
					url:'./account.html',
					id:'account',
				}});
			}else{
				userInfo.user.isIdcardValidated = 2;
				userInfo.saveSelf();
				$p.find('.ui-content').css('text-align', 'center').html(
					[
						'<div class="success-tip"><div class="icon-checkround">!</div><p>您的身份信息已提交，正在审核中！</p></div>',
						'<a id="verySuccessBtn" class="ui-link ui-btn ui-shadow ui-corner-all">点击返回</a>'
					].join('')
				);
				setTimeout(function(){
					$('#verySuccessBtn').unbind().on('vclick', function(){
						viewJs.navigator.next({next:{
							id:'account',
							url:'./account.html'
						}});
					})}, 500);
			}
//			viewJs.dialogPop('敬请期待审核通过', function(){
//				viewJs.navigator.next({next:{url:'./mine.html',id:'mine'}});
//			}, '提示',{onlyBtnOk:true});
			
		}).error(function(){
			console.log(arguments);
		});
	},toViewLargerImage:function(){
		viewJs.top();
		var $p = $.mobile.activePage;
		var me = verifyUserJs;
		me.toggleEvents();
		$('#toViewLargerImageDlg').remove();
		var  i = 0;
		var $dlg = $([
			'<div id="toViewLargerImageDlg" class="ui-page itemEditor fullScreen vChild">',
			'<div data-role="header"  >',
			'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
			'<h1>查看大图</h1>',
			'<a	class="ui-btn delete">删除</a> ',
			'</div>',
			'<div class="content">',
				'<div class="photoViewCtr" style="max-width:100%;max-height:100%;overflow:auto;">',
				'</div>',
			'</div>',
			'</div>'].join('')).hide().enhanceWithin();
		$(document.body).append($dlg);
		var $img = $(this).removeClass('camera-thumbnails');
		$dlg.find('.content>.photoViewCtr').empty().append($img);
		$dlg.slideDown();
		setTimeout(function(){
			$dlg.delegate('.ui-btn.vBack', 'vclick', function(){
				viewJs.top();
				$('#addIDPhotoCtr').append($img.addClass('camera-thumbnails'));
                me.toggleEvents();
				$dlg.remove();
                $.mobile.document.unbind('vclick');
                setTimeout(function(){
                    me.toggleEvents(true);
                   mainJs.bindClick();
                }, 800);
			});
			$dlg.delegate('.ui-btn.delete', 'vclick', function(){
				viewJs.top();
				$('#addIDPhotoCtr').find('.ui-input-text').css('margin-left', -40+'px');
				$('#addIDPhoto').clearVal();
                me.toggleEvents();
				$dlg.remove();
                setTimeout(function(){
                    me.toggleEvents(true);
                }, 800);
			});
		}, 500);
	},takePic:function(){
		viewJs.maskReadImg();
		// // TODO
		// window.aaa = window.aaa == null ? 0 : (window.aaa+1)
		// $('#verify-idNumber').val(window.aaa+':'+this.value);
		var files = this.files;
		if (!files.length) {viewJs.finishReadImg();return;}
		var f = files[0];
		verifyUserJs.makeThumb(f);
	},loadThumb:function(){
		viewJs.maskBusy(null, 'takePic');
		$.getJs({ns:$('<div>'), varName:'makeThumb', url:mainJs.getResourceURL('/js/make-thumb/make-thumb.min.js?__ver=2'), ajaxOpt:{
		success:function(){
			viewJs.hideBusyMask('takePic');
		},error:function(){
			console.log(arguments);
			viewJs.hideBusyMask('takePic');
			viewJs.showPopMsg('加载图片失败');
		}}});
	},makeThumb:function(file){
		var me = verifyUserJs;
		var $file = $('#addIDPhoto');

		$file.makeThumb(file, {
			maxWidth:1024,
			maxHeight:1024,
			success: function(dataURL, tSize, file, sSize, fEvt) {
				// 可以得到图片名, 高度等信息, 用来做一些判断, 比如图片大小是否符合要求等..
				// console.log(fEvt.target, file.name, sSize, sSize.width, sSize.height);
				// console.log(file.name, sSize.width +'->'+ tSize.width, sSize.height +'->'+ tSize.height);
				var $ctr = $('#addIDPhotoCtr');
				$ctr.find('.camera-thumbnails').remove();
				var thumb = new Image();
				thumb.src = dataURL;
				$(thumb).addClass('camera-thumbnails').appendTo($ctr);
				$ctr.find('.ui-input-text').css('margin-left', -(40+45)+'px');
				$file.clearVal();
				viewJs.finishReadImg();
			},error:function(){
				viewJs.finishReadImg();
				viewJs.showPopMsg('文件读取失败');
			}
			});
	},validateIDCard:function(val){
        var me = verifyUserJs;
        var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        var ret = !reg.test(val)
        if (!ret) {
            var sId = val.replace(/x$/i, "a");
            ret = me.aCardCity[parseInt(sId.substr(0, 2))] == null;
            if(!ret){
                var sBirthday = sId.substr(6, 4) + "-" + Number(sId.substr(10, 2)) + "-" + Number(sId.substr(12, 2));
                var d = new Date(sBirthday.replace(/-/g, "/"));
                var td = new Date();
                ret = (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()));
            }
        }
        if(ret){
            return '身份证号格式不正确';
        }
    },aCardCity:{ 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外" }
};