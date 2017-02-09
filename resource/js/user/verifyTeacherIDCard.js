var verifyTeacherIDCardJs = {
	init:function(){
		$('#toViewLargerImageDlg').remove();
		var user;
		if(!(user = this.preInit())){
			return;
		}
		$('#take-pic').remove();
		this.$file = $('<input id="take-pic" type="file" accept="image/png,image/jpeg" capture="camera">');
		this.initPage(user);
		this.loadThumb();
		this.toggleEvents(true);
	},toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		$p.undelegate();
		$p.find('#verify-idNumber').unbind('input');
		var me = this;
		me.$file.unbind('change');
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			$p.find('#verify-idNumber').on('input', me.alphanumeric);
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
					if(l>=5){
						viewJs.showPopMsg('最多添加5张图片');
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
				});

				me.$file.change(me.takePic);
				$p.delegate('#cameraContainer>.camera-thumbnails', 'vclick', me.toEditImage);
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
				url:'./verifyTeacher.html',
				id:'verifyTeacher',
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
		}
		return userInfo.user;
	},initPage:function(user){
		var $p = $.mobile.activePage;
	},alphanumeric:function(){
		var $el = $(this);
		var val = $.trim($el.val());
		$el.val(val.replace(/[^\da-zA-Z]/g,''));
 	},submit:function(){
		viewJs.maskBusy(null, 'submit');
		var $p = $.mobile.activePage;
		var me = verifyTeacherIDCardJs;

		var userInfo = dmJs.sStore.getUserInfo();
		var f = {};
		$p.find('.vForm-3:visible input').each(function(i, item){
			var $item = $(item);
			f[$item.attr('name')] = $.trim($item.val());
		});
		var name = f.name;
		var number = f.number;
		var institution = f.institution;
		var duties = f.duties;
		var workingLife = f.workingLife;
		var content = $p.find(".content").val();

		var msg;
		if(!msg){
			msg = viewJs.validate({must:true, val:name, name:"姓名"});
		}
		if(!msg){
			msg = viewJs.validate({must:true, val:number, name:"身份证号"});
		}
		if(!msg){
			msg = viewJs.validate({must:true, val:institution, name:"所在单位"});
		}
		if(!msg){
			msg = viewJs.validate({must:true, val:duties, name:"职位（职称）"});
		}
		if(!msg){
			msg = viewJs.validate({must:true, val:workingLife, name:"工作年限"});
		}
		if(!msg){
			msg = viewJs.validate({must:true, val:content, name:"个人简历"});
		}
		if(msg){
			viewJs.hideBusyMask('submit');
			viewJs.showPopMsg(msg);
			return;
		}
		var formData = new FormData();
		var picStrings = [];
		$p.find('#cameraContainer').find(':not([oldPic]).camera-thumbnails').each(function(index, img){
			picStrings.push(img.src.split(',')[1]);
		});
		if(picStrings.length > 0){
			formData.append("picStrings", picStrings.join(','));
		}
		formData.append("accessToken", dmJs.getAccessToken());
		formData.append("name", name);
		formData.append("number", number);
		formData.append("institution", institution);
		formData.append("duties", duties);
		formData.append("workingLife", workingLife);
		formData.append("content", content);
		viewJs.hideBusyMask('submit');
		dmJs.ajaxForm(formData, mainJs.getApiUrl('/urming_quan/user/teacherIDCardVerify'), function(){
			var userInfo =dmJs.sStore.getUserInfo();
			userInfo.user.isTeacherValidated = 2;
			userInfo.saveSelf();
		$p.find('.ui-content').css('text-align', 'center').html(
				[
					'<div class="success-tip"><div class="icon-checkround">!</div><p>您的信息已提交，正在审核中！</p></div>',
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
//			viewJs.dialogPop('敬请期待审核通过', function(){
//				viewJs.navigator.next({next:{url:'./mine.html',id:'mine'}});
//			}, '提示',{onlyBtnOk:true});
			
		}).error(function(){
			console.log(arguments);
		});
	},takePic:function(){
		var files = this.files;
		if (!files.length) return;
		var f = files[0];
		verifyTeacherIDCardJs.makeThumb(f);
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
		var me = verifyTeacherIDCardJs;
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
				thumb.onload = function(){
					$(thumb).addClass('camera-thumbnails').appendTo($ctr).data('img-index', l);
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
	},loadThumb:function(){
		if( !$.support.filereader){
			$('.cameraCtr').hide();
			return;
		}
		viewJs.maskBusy(null, 'takePic');
		$.getJs({ns:$('<div>'), varName:'makeThumb', url:mainJs.getResourceURL('/js/make-thumb/make-thumb.min.js?__ver=2'), ajaxOpt:{
			success:function(){
				viewJs.hideBusyMask('takePic');
			},error:function(){
				console.log(arguments);
				viewJs.hideBusyMask('takePic');
				viewJs.showPopMsg('加载图片失败');
			}}});
	},toEditImage:function(){
		var $img = $(this);
		viewJs.top();
		var imgIndex  = $img.data('img-index')
		var me = verifyTeacherIDCardJs;
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
					//viewJs.toggleCameraShow(true);
					$p.show();
					viewJs.top();
					$dlg.remove();
				}, 500);
			}).delegate('.vBack', 'vclick', function(e){
				me.toggleEvents();
				setTimeout(function(){
					me.toggleEvents(true);
					//viewJs.toggleCameraShow(true);
					$p.show();
					viewJs.top();
					$dlg.remove();
				}, 500);
			});
		}, 500);
	}
};