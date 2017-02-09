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
		} else if(invalid = viewJs.isLockVerifyIdentity(userInfo.user.isIdcardValidated)){
			viewJs.showPopMsg(invalid);
			viewJs.navigator.pre();
			return;
		}
		return userInfo.user;
	},initPage:function(user){
		var $p = $.mobile.activePage;
		$p.removeClass('isEnterprise isPerson');
		if(user.type == '1'){
			$p.addClass('isPerson');
		} else {
			$p.addClass('isEnterprise');
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
		// 1-个人；2-机构
		var userType,label1,label2,label3;
		if($p.is('.isEnterprise')){
			userType = 2;
			label1 = '证书名称';
			label2 = '证书编号';
			label3 = '请上传 资质证书照片';
		} else {
			userType = 1;
			label1 = '姓名';
			label2 = '身份证号';
			label3 = '请上传 身份证照片';
		}
		var msg = viewJs.validate({must:true, val:name, name:label1});
		if(!msg){
			msg = viewJs.validate({must:true, val:num, name:label2});
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
		formData.append("name"+userType, name);
		formData.append("num"+userType, num);
		formData.append("type", userType);
		formData.append("type", userType);
		viewJs.hideBusyMask('submit');
		dmJs.ajaxForm(formData, mainJs.getApiUrl('/urming_quan/user/userVerify'), function(){
			viewJs.showPopMsg('敬请等待审核');
			var userInfo =dmJs.sStore.getUserInfo();
			userInfo.user.isIdcardValidated = 2;
			userInfo.saveSelf();
			viewJs.dialogPop('敬请期待审核通过', function(){
				viewJs.navigator.next({next:{url:'./mine.html',id:'mine'}});
			}, '提示',{onlyBtnOk:true});
			
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
				$dlg.remove();
				me.toggleEvents(true);
			});
			$dlg.delegate('.ui-btn.delete', 'vclick', function(){
				viewJs.top();
				$('#addIDPhotoCtr').find('.ui-input-text').css('margin-left', -40+'px');
				$('#addIDPhoto').clearVal();
				$dlg.remove();
				me.toggleEvents(true);
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
		$.getJs({ns:$('<div>'), varName:'makeThumb', url:mainJs.getResourceURL('/js/make-thumb/make-thumb.min.js'), ajaxOpt:{
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
	}
};