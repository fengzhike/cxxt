addAnswerJs = {
	_data:null,
	init:function(){
		//hw
		var user;
		if(!(user = viewJs.chkLogin())){
			return;
		}
		//hw
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
		var me = addAnswerJs;
		if(bInit){
			me._data = {urlMap:{}};
		} else {
			me._data = null;
		}
	},toggleEvents:function(isBind){
		var me = addAnswerJs;
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
                }).delegate('.submit', 'vclick',me.submitAnswer);

				me.$file.change(me.takePic);
                $p.delegate('input.wantName','input',viewJs.validInput);
				$p.delegate('#cameraContainer>.camera-thumbnails', 'vclick', me.toEditImage)
				viewJs.toggleAddServiceEvents(true);
				$p.delegate('[data-format]', 'input', viewJs.validInput);
				$p.delegate('#toAddLink', 'vclick', me.toAddDescLink);
			}, 500);

		}
	},addLink:function(){
		var me = addAnswerJs;
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
		var $desc = $('#serviceDesc');
		var $descVal = $desc.val();
		var insertIndex = me._data._descIndex;
		$desc.val([$descVal.substring(0,insertIndex), lnkName,$descVal.substring(insertIndex)].join(''));
		me.cancelAddLink();

	},cancelAddLink:function(){
		var me = addAnswerJs;
		me.toggleEvents();
		$('#toAddDescLink').remove();
		me.toggleEvents(true);

	},toAddDescLink:function(){
		var me = addAnswerJs;
		me._data._descIndex = viewJs.getFocus($('#serviceDesc')[0]);
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
		me.toggleEvents(true);
	},submitAnswer:function(){
		var me = addAnswerJs;
		var $ap = $.mobile.activePage;
		var initParam = mainJs.parseUrlSearch();

		var $p = $ap.find('.vForm-1');
		var wantID = initParam.wantID;
		var serviceDesc = $.trim($p.find('#serviceDesc').val());
		var isAnonymousAnswer = $p.find('#isAnonymousAnswer').is(":checked")?1:0;
		var geolocation = dmJs.params.geolocation;
		var latitude = geolocation.latitude;
		var longitude = geolocation.longitude;
		var city = geolocation.city;
		var area2 = geolocation.area2;
		var area3 = geolocation.area3;
		var msg;
		if(!msg && serviceDesc.length ==0){
			msg = ('请输入描述');
		}
		/*
		if(!msg && serviceDesc.length < 10){
			msg = ('描述，至少10个字');
		}
		*/
		if(msg){
			viewJs.showPopMsg(msg);
			$ap.data('busy', false);
			return;
		}

		if(me._data.urlMap){
			var lnkMap  = me._data.urlMap;
			var lnkVal;
			var sep = encodeURIComponent('哈1&');
			var lnkNames = [];
			for(var lnkName in lnkMap){
				lnkNames.push(lnkName);
			}
			lnkNames.sort(function(o1,o2){
				return o1.length - o2.length;
			});
			var lnkCount = lnkNames.length;
			for(var ii=0; ii < lnkCount; ii++){
				lnkName = lnkNames[ii];
				lnkVal = lnkMap[lnkName];
				serviceDesc = serviceDesc.replace(new RegExp(lnkName,'g'),function(w){
					return [
						'<a href="',lnkVal,'" data-ajax="false">', w.split('').join(sep),'</a>'
					].join('');
				});
			}
			serviceDesc = serviceDesc.replace(new RegExp(sep,'g'),'')
		}

		var formData = new FormData();
		var url = mainJs.getApiUrl('/urming_quan/service/addAnswer');
		if(initParam.serviceID != undefined && initParam.serviceID != null){
			url = mainJs.getApiUrl('/urming_quan/service/updateService');
			formData.append("serviceID", initParam.serviceID);
		}
		var $ctr = $('#cameraContainer');
		var oldPic =  $ctr.data('oldPic');
		if(oldPic != null && oldPic.length> 0){
			formData.append("isOldPic", oldPic.join(','));
		}
		var picStrings = [];
		$ap.find('#cameraContainer').find(':not([oldPic]).camera-thumbnails').each(function(index, img){
			picStrings.push(img.src.split(',')[1]);
		});
		if(picStrings.length > 0){
			formData.append("picStrings", picStrings.join(','));
		}
		formData.append('accessToken', dmJs.getAccessToken());
		formData.append("wantID", wantID);
		formData.append("serviceDesc", serviceDesc);
		formData.append("isAnonymousAnswer", isAnonymousAnswer);
		formData.append("latitude", latitude);
		formData.append("longitude", longitude);
		formData.append("city", city);
		formData.append("area2", area2);
		formData.append("area3", area3);
		viewJs.hideBusyMask('submitService');
		dmJs.ajaxForm(formData, url, function(){
			//viewJs.navigator.next({next:{url:'./question.html',id:'question',options:{data:{wantID:wantID}}}});
			viewJs.navigator.pre();
			$ap.data('busy', false);
		},{busyDesc:"答案发布中"}).complete(function(){
			$ap.data('busy', false);
		});
	},takePic:function(){
		var files = this.files;
		if (!files.length) return;
		var f = files[0];
		addAnswerJs.makeThumb(f);
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
		var me = addAnswerJs;
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
					$('input.wantName').focus().click();
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
			console.log(arguments);
			viewJs.hideBusyMask('takePic');
			viewJs.showPopMsg('加载图片失败');
		}}});
	},initPage:function(){
		var me = addAnswerJs;
		var $p = $.mobile.activePage;
		var params = mainJs.parseUrlSearch();
		//me.envWx = $p.is('[wx]');
		//me.defaultUrl = '/urming_quan/service/addService';
		//if(me.envWx){
		//	$p.find('.wx').show();
		//	me.defaultUrl = '/urming_quan/service/addServiceByVerifyCode';
		//}
		if(params.serviceID != null){
            //me.setTitle('编辑服务');
			//me.initEditeQuestion(params);
		}  else {
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
	},initLabels:function(){
		var me = addAnswerJs;
		var $p = $.mobile.activePage;
        viewJs.checkInputEmpty()
		var params = mainJs.parseUrlSearch();
		if(params.serviceID != null){
			//me.initProvideService(params);
			//viewJs.setTitle('编辑答案');
		} else {
			me.initProvideService(params);
			var $p = $.mobile.activePage;
			viewJs.setTitle('回答问题');
		}
	},initProvideService:function(params){
        var me = addAnswerJs;
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
				var wantName = want.wantName;
				var price = Number(want.price);
				var picUrl = $.trim(want.picUrls);
				me.setFormVals({
					wantName:wantName,
					price:price
				});
			}});
	},setFormVals:function(f){
		var $p = $.mobile.activePage;
		var $f = $p.find('.vForm-1');
		$f.find('.wantName input').val(f.wantName);
	},initEditeQuestion:function(params){
		var me = addAnswerJs;
		var $p = $.mobile.activePage;
		var userInfo = dmJs.sStore.getUserInfo();
		if(userInfo == null){
			viewJs.dialogPop('请先登录！', function(){
				viewJs.navigator.pre();
			}, '错误', {onlyBtnOk:true});
			return;
		}
		var params = mainJs.parseUrlSearch();

		dmJs._ajax({id:'initPublishPage',
			url: '/urming_quan/service/getServiceByID',
			params:{serviceID:params.serviceID,accessToken:userInfo.accessToken}, 
			callback:function(data){
				var service = data.service.serviceVersion;
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
							$(thumb).addClass('camera-thumbnails').appendTo($ctr).attr('oldPic', index).data('img-index', index);
							oldPic[index] = 1;
						});
						$ctr.data('oldPic', oldPic);
					}
				}
				dmJs.findCatById(catId, function(cat){
					var user = service.userByUserId;
					var tags = [];
					var userTags = user.userTags;
					if(userTags != null){
						$.each(userTags, function(index, item){
                            if(viewJs._keepDfTag(item.tagName)){
                                tags.push(item.tagName);
                            }
						});
					}
					me.resetLinkMap(service.wantDesc);
					me.setFormVals({
						wantName:service.wantName.replace(/[<>]/g,''),
						tags:tags,
						cat:cat,
						wantDesc:service.wantDesc,
						price:service.newPrice,
					});
				});
		}});
	},resetLinkMap:function(html){
		var me = addAnswerJs;
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
	},toEditImage:function(){
		var $img = $(this);
		viewJs.top();
		var imgIndex  = $img.data('img-index')
		var me = addAnswerJs;
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