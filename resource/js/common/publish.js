publishJs = {};
viewJs.clickManuallyEnterIcon = function(el){
    var _self = arguments.callee;
    if(_self.busy){
        return;
    }
    _self.busy = true;
    setTimeout(function(){
        _self.busy = false;
    },500);
	var $el = $(el);
	if($el.is('.dbTag')){
		var $p = $el.parents('.selTags:first').find('.enterItems');
		var set = $p.find('.enterItem.fill.readonly .tag');
		var total = set.length;
		if(total>= 3){
			viewJs.showPopMsg('最多只能选择三个标签');
			return;
		}
		var addedTag = $.trim($el.html());
		if(set.filter(function(i, e){return  $.trim($(e).val()) == addedTag;}).length > 0){
			viewJs.showPopMsg('标签已经存在');
			return;
		}
		$p.find('.enterItem:not(.readonly)').addClass('fill readonly').find('.tag').val(addedTag).attr('readonly', '');
		total = $p.find('.enterItem.fill.readonly').length;
		if(total>= 3){
			return;
		}
		$(['<div class="enterItem">',
		  '<input type="text" maxlength="7" placeholder="手动输入标签" class="tag" oninput="viewJs.toggleVTriCheckIcon(this);">',
		  '<div class="tagIcon"></div>',
		'</div>'
		].join('')).appendTo($p).enhanceWithin();
		
	}else if($el.is('.enterItem.fill.readonly .tagIcon')){
		var $p1 = $el.parents('.enterItem:first');
        var $p = $el.parents('.selTags:first').find('.enterItems');
        $p1.remove();
        $(['<div class="enterItem">',
            '<input type="text" maxlength="7" placeholder="手动输入标签" class="tag" oninput="viewJs.toggleVTriCheckIcon(this);">',
            '<div class="tagIcon"></div>',
            '</div>'
        ].join('')).appendTo($p).enhanceWithin();
        $p.find('.enterItem:not(.fill):gt(0)').remove();
//		if(!$p1.is(':last-child')){
//
//		} else {
//			$p1.removeClass('readonly').removeClass('fill').find('.tag').val('').attr('readonly', null);
//		}
	} else 	if($el.is('.fill .tagIcon')){
		var $p = $el.parents('.enterItems:first');
		var total = $p.find('.enterItem.fill').length;
		if(total<= 3){

			$p1 = $el.parents('.enterItem:first');
			$input = $p1.find('.tag');
			var addedTag = $.trim($input.val());
			if($p.find('.enterItem.fill.readonly .tag').filter(function(i, e){return  $.trim($(e).val()) == addedTag;}).length > 0){
				viewJs.showPopMsg('标签已经存在');
				return;
			}
			$input.attr('readonly', '');
			$p1.addClass('readonly');
			if(total < 3){
				$(['<div class="enterItem">',
						  '<input type="text" maxlength="7" placeholder="手动输入标签" class="tag" oninput="viewJs.toggleVTriCheckIcon(this);">',
						  '<div class="tagIcon"></div>',
						'</div>'
					].join('')).appendTo($p).enhanceWithin();
			}
		} else {
			viewJs.showPopMsg('最多只能选择三个标签');
		}
	}
    var params = mainJs.parseUrlSearch();
    if(params.catName == 'bigsai'){
        var lang = sessionStorage.getItem('lang');
        var pubData =null;
        if(lang == 'en'){
            pubData = pubEnJs
        }else{
            pubData = pubCnJs
        }
        $('#selServiceTags .tag').attr('placeholder',pubData.tag)
    }
};
viewJs.selSvrTags = function(){
	var selTags =[];
	var $p = $('#selServiceTags');
	$p.find('.enterItem.fill .tag').each(function(index, item){
		selTags[index] = $.trim(item.value);
	});
	// $p = $('#addService');
    if(selTags.length){
        $.mobile.activePage.find('.tags.vCt').html(selTags.join('，')).attr('edit',1);
    }else{
        $.mobile.activePage.find('.tags.vCt').html('更利于查找和管理哦~例:创新、实践');
    }

	viewJs.toggleParentShow(true);
	$p.hide();
    viewJs.toggleCameraShow(true);
};

viewJs.priceInput = function(el){
	var maxPrice = 100000;
	var $el = $(el);
	$el.siblings('.elTip').remove();
	var val = $el.val().replace(/\D/g, '');
	if(val !=''){
		val = Number(val.replace(/^0{2,}/, '0'));
		if(maxPrice < val) {
			val = maxPrice;
			var $tip = viewJs.showPopTip({el:el, msg:'最大金额10万'});
			setTimeout(function(){$tip.remove();}, 3000);
		}
	}
	$el.val(val);
};
viewJs.wxBack = function(){
	viewJs.dialogPop('感谢您的参与,确认退出发布?', function(ret){
		if(ret){
			if(window.WeixinJSBridge){
				window.WeixinJSBridge.invoke('closeWindow',{},function(res){});
			} else {
				viewJs.showPopMsg('非微信环境无法退出发布');
			}
		}

	}, '发布成功！');
};
//fsk
viewJs.checkInputEmpty = function (){
    var $ap = $.mobile.activePage;
    var $p = $ap.find('.vForm-1');
    var params = mainJs.parseUrlSearch();
    $p.find('.serviceName').blur(function(){

        if($.trim($(this).val()).length <2){
            viewJs.showPopMsg('标题不能少于两个字');
        }
        if($.trim($(this).val()).length > 50){
            viewJs.showPopMsg('标题不能大于50个字');
        }
        if($.trim($(this).val()).length == 0){
            viewJs.showPopMsg('请输入标题');
        }
    })
    $p.find('.price input').blur(function(){
        if($.trim($(this).val()).length == 0){
            viewJs.showPopMsg('价格不能为空');
        }
    })

    $p.find('#publish_unit').blur(function(){
        if($.trim($(this).val()).length == 0){
            viewJs.showPopMsg('单位不能为空');
        }
    })
    $p.find('#publish_contactContent').blur(function(){
        if($.trim($(this).val()).length == 0){
            viewJs.showPopMsg('请留下联系方式');
        }
    })
    $p.find("#publish_maxBuyerCount").blur(function(){
        if($(this).val()>199){
            viewJs.showPopMsg('可购人次不能大于199');
        }
    })
    $p.find("#publish_maxBuyerCount").blur(function(){
        if($.trim($(this).val()).length == 0){
            viewJs.showPopMsg('可购人次不能为空');
        }
    })
    $p.find("#publish_worth").blur(function(){
        if($.trim($(this).val()).length == 0){
            viewJs.showPopMsg('项目价值不能为空');
        }
    })
    $p.find("#publish_totalNum").blur(function(){
        if($.trim($(this).val()).length == 0){
            viewJs.showPopMsg('发售股数不能为空');
        }
    })
    $p.find("#publish_maxSingleSaleCount").blur(function(){
        if($.trim($(this).val()).length == 0){
            viewJs.showPopMsg('单次最多购买不能为空');
        }
    })
    $p.find("#publish_minSingleSaleCount").blur(function(){
        if($.trim($(this).val()).length == 0){
            viewJs.showPopMsg('单次最多购买不能为空');
        }
    })



    var pubTime = new Date();
    $p.find('#publish_startTime').blur(function(){
        var startTime = $.trim($('#publish_startTime').val());
        var startTimeTest = new Date(startTime);
        if(pubTime.getTime()>startTimeTest.getTime() && !mainJs.parseUrlSearch().serviceID){
            viewJs.showPopMsg('开始时间要大于发布时间');
            $(this).val(' ')
        }
    })
    $p.find('#publish_endTime').blur(function(){
        var endTime = $.trim($('#publish_endTime').val());
        var endTimeTest = new Date(endTime);
        if(pubTime.getTime()>endTimeTest.getTime()){
            viewJs.showPopMsg('截止时间要大于发布时间' &&  !mainJs.parseUrlSearch().serviceID);
            $(this).val(' ')
        }

    })
}
viewJs._publish = function(options){
	$(':focus').blur();
	var extraParams = options.extraParams || {};
    var $ap = $.mobile.activePage;
    if(!options.envWx && !viewJs.chkLogin()){
        return;
    }
    var busy = $ap.data('busy');
    if(busy){
        return;
    }
    $ap.data('busy', true);
	var url = options.url;

	var $p = $ap.find('.vForm-1');
	var serviceName = $.trim($p.find('.serviceName').val());
    //console.log(options)
    var tags = $.trim($p.find('.tags').html());
    if(options.isBigSai){
        tags+='，2016大赛'
    }
	var categoryID = $.trim($p.find('.cat .vCt').attr('catid'));
	var serviceDesc = $.trim($p.find('.toaddServiceWantDesc .vCt').html());
	var newPrice = $.trim($p.find('.price input').val());
	var hideInfoStatus = $('input:radio[name=hideInfo]:checked').val();
	var hideInfo = $.trim($('#addHide').val());
	var unit = $.trim($('#publish_unit').val());
	var address = $.trim($('#publish_address').val());
	var maxBuyerCount = $.trim($('#publish_maxBuyerCount').val());
	var maxSingleSaleCount = $.trim($('#publish_maxSingleSaleCount').val());
	var minSingleSaleCount = $.trim($('#publish_minSingleSaleCount').val());
	var totalNum = $.trim($('#publish_totalNum').val());
	var worth = $.trim($('#publish_worth').val());
	var startTime = $.trim($('#publish_startTime').val());
	var endTime = $.trim($('#publish_endTime').val());
    var endTimeTest = new Date(endTime);
    var startTimeTest = new Date(startTime);
    var pubTime = new Date();
	//var mobile = $.trim($('#publish_mobile').val());
	var contactContent = $.trim($('#publish_contactContent').val());
	var contactType = $.trim($('#publish_contactType').val());

	var geolocation = dmJs.params.geolocation;
	// TODO
	var latitude = geolocation.latitude;
	var longitude = geolocation.longitude;
	var city = geolocation.city;
	var area2 = geolocation.area2;
	var area3 = geolocation.area3;
	// validate
    var msg;
	if(options.envWx){
		var verifyCode = $.trim($p.find('.line.verifyCode input').val());
		var tempAccessToken = $.trim(dmJs.sStore.get('tempAccessToken'));
		var accessTokenMobile = dmJs.sStore.get('tempAccessToken_mobile');
		var inputPhone = $.trim($p.find('.line.phone input').val());
		if (!msg) {
			msg = viewJs.validate({name: '验证码', val: verifyCode, must: true});
		}
		if (!msg) {
			if(tempAccessToken == ''){
				msg ="请获取验证码";
			}
		}
		if (!msg) {
			if (inputPhone !== accessTokenMobile) {
				msg = "手机号和获取验证码的手机号不符";
			}
		}
		extraParams.tempAccessToken = tempAccessToken;
		extraParams.verifyCode = verifyCode;
	} else {
		extraParams.accessToken = dmJs.getAccessToken();
	}
	if(!msg && serviceName.length ==0){
        msg = ('请输入标题');
	}
    if(!msg && serviceName.length < 2){
        msg = ('标题不能少于2个字');
    }
    //if(!msg && viewJs.getStrLen(serviceName) > 50){
    //    msg = ('标题不超过50个字符，25个汉字');
    //}
    if(!msg && serviceName.length > 50){
        msg = ('标题不超过50个字');
    }
	if(!msg && categoryID.length == 0||!$('.toSelCategories .vCt').attr('edit')){
        msg = ('请选择分类');
	}
	if(!msg && tags.length == 0||!$('.tags').attr('edit')){
        msg = ('请选择标签');
	}
    if(!msg && newPrice == ''){
        msg = ('价格不能为空');
    }
	if(!msg && newPrice == 0 && $("#publish_maxBuyerCount").is(":visible")){
		msg = ('众筹每股价格不能为0');
	}
	if(!msg && newPrice > 1e+5){
        msg = ('最大金额10万');
	}
	if(!msg && $("#publish_unit").is(":visible") && unit == ''){
		msg = ('请输入计量单位');
	}
	if(!msg && $("#publish_address").is(":visible") && address == ''){
		msg = ('请输入地点');
	}
	if(!msg && $("#publish_maxBuyerCount").is(":visible") && maxBuyerCount == ''){
		msg = ('请输入可购人次');
	}
	if(!msg && $("#publish_maxBuyerCount").is(":visible") && maxBuyerCount == 0){
		msg = ('可购人次不能为0');
	}
	if(!msg && $("#publish_maxBuyerCount").is(":visible") && maxBuyerCount > 199){
		msg = ('可购人次不能大于199');
	}
	if(!msg && $("#publish_worth").is(":visible") && worth == ''){
		msg = ('请输入项目价值');
	}
	if(!msg && $("#publish_worth").is(":visible") && worth == 0){
		msg = ('项目价值不能为0');
	}
	if(!msg && $("#publish_totalNum").is(":visible") && totalNum == ''){
		msg = ('请输入发售股数');
	}
	if(!msg && $("#publish_totalNum").is(":visible") && totalNum == 0){
		msg = ('发售股数不能为0');
	}
	if(!msg && $("#publish_worth").is(":visible") && worth < totalNum*newPrice){
		msg = ('发售股值应小于项目价值');
	}
	if(!msg && $("#publish_startTime").is(":visible") && startTime == ''){
		msg = ('请输入日期时间');
	}
	if(!msg && $("#publish_endTime").is(":visible") && endTime == ''){
		msg = ('请输入日期时间');
	}
    //fsk
    if(!msg && $("#publish_endTime").is(":visible") && pubTime.getTime()>endTimeTest.getTime()){
        msg = ('截止时间要大于发布时间');
    }
    if(!msg && $("#publish_startTime").is(":visible") && pubTime.getTime()>startTimeTest.getTime()){
        msg = ('开始时间要大于发布时间');
    }
	if(!msg && $("#publish_mobile").is(":visible") && $.trim($("#publish_mobile").val()).length == 0){
		msg = ('请输入联系方式');
	}
	/*if(!msg && $("#publish_mobile").is(":visible") && !(/^1\d{10}$/.test(mobile))){
		msg = ('联系电话格式不正确');
	}*/
    var params = mainJs.parseUrlSearch();
	if(!msg && serviceDesc.length ==0||!$('.toaddServiceWantDesc .vCt').attr('edit')){
        msg = ('请输入描述');
        if(params.catId =='8'){
            msg = '请输入项目介绍'
        }

	}
    if(!msg && serviceDesc.length < 10){
        msg = ('描述，至少10个字');
    }
    if(!msg && serviceDesc.length > 10000){
        msg = ('描述，10000字以内');
    }
	if(!msg && hideInfoStatus==1 && hideInfo == ''){
        msg = ('请输入隐含信息');
    }
    if(msg){
        viewJs.showPopMsg(msg);
        $ap.data('busy', false);
        return;
    }
	//debugger;
	if(options.urlMap){
		var lnkMap  = options.urlMap;
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
	//hw
	if(options.urlHideMap){
		var lnkMap  = options.urlHideMap;
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
			hideInfo = hideInfo.replace(new RegExp(lnkName,'g'),function(w){
				return [
					'<a href="',lnkVal,'">', w.split('').join(sep),'</a>'
				].join('');
			});
		}
		hideInfo = hideInfo.replace(new RegExp(sep,'g'),'');
	}
	//hw
	serviceName = viewJs.replaceSymbol(serviceName);
    viewJs.maskBusy('发布中', 'submitService');

	var formData = new FormData();
	var picStrings = [];
	$ap.find('#cameraContainer').find(':not([oldPic]).camera-thumbnails').each(function(index, img){
		picStrings.push(img.src.split(',')[1]);
	});
	if(picStrings.length > 0){
		formData.append("picStrings", picStrings.join(','));
	}
	if(extraParams != null){
		for(var k in extraParams){
			formData.append(k, extraParams[k]);
		}
	}
    if(options.onlyGroup!=null){
        var onlyGroup = options.onlyGroup;
        formData.append("onlyGroup", onlyGroup);
    }

    var params = mainJs.parseUrlSearch();
    if(params.catName === 'bigsai'){
        tags +='，2016大赛';
    }
	formData.append(options.serviceName, viewJs.replaceSymbol(serviceName));
	formData.append("tags",viewJs.replaceSymbol(viewJs._getTags(tags)));
	formData.append("categoryID", categoryID);
	formData.append(options.serviceDesc, serviceDesc);
	formData.append(options.price, newPrice);
	formData.append("latitude", latitude);
	formData.append("longitude", longitude);
	formData.append("city", city);
	formData.append("area2", area2);
	formData.append("area3", area3);
//console.log(unit)

	//if($("#publish_unit").is(":visible")) {
		formData.append("unit", unit);
	//}
	if($("#publish_startTime").is(":visible")) {
		formData.append("startTime", startTime.replace("T"," ")+":00");
	}
	if($("#publish_endTime").is(":visible")) {
		formData.append("endTime", endTime.replace("T"," ")+":00");
	}
	if($("#publish_address").is(":visible")) {
		formData.append("address", address);
	}
	if($("#publish_maxBuyerCount").is(":visible")) {
		formData.append("maxBuyerCount", maxBuyerCount);
	}
	if($("#publish_maxSingleSaleCount").is(":visible")) {
		formData.append("maxSingleSaleCount", maxSingleSaleCount);
	}
	if($("#publish_minSingleSaleCount").is(":visible")) {
		formData.append("minSingleSaleCount", minSingleSaleCount);
	}
	if($("#publish_totalNum").is(":visible")) {
		formData.append("totalNum", totalNum);
	}
	if($("#publish_worth").is(":visible")) {
		formData.append("worth", worth);
	}
	//if($("#publish_mobile").is(":visible")) {
	//	formData.append("mobile", mobile);
	//}
	if($("#publish_contactContent").is(":visible")) {
		formData.append("contactContent", contactContent);
		formData.append("contactType", contactType);
	}
	//hw
	if(hideInfoStatus == 1){
		formData.append("hideInfo", hideInfo);
	}

	//hw
    //console.log(options.callback)
	viewJs.hideBusyMask('submitService');
	dmJs.ajaxForm(formData, url, function(){
		if($.isFunction(options.callback)){
			options.callback();
		} else{
            viewJs.navigator.pre();
		}
        $ap.data('busy', false);
	},{busyDesc:options.busyDesc}).complete(function(){
        $ap.data('busy', false);
    });
};
viewJs.toSelCategories = function(){
	viewJs.top();
	var $dlg =$('#selCategories');
	viewJs.toggleAddServiceEvents();
	viewJs.maskBusy('生成分类中', 'toSelCategories');
	if($dlg.length == 0){
			var $dlg = $([
				'<div id="selCategories" class="ui-page fullScreen vChild">',
				'<div data-role="header"  onclcik="">',
				'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
				'<h1>分类</h1>',
				'</div>',
				'<div class="content">',
				'<ul data-role="listview" class="cat-lst">',
				'</ul>',
				'</div>',
				'</div>'].join('')).hide().enhanceWithin();
				
	}
	$($.mobile.activePage).append($dlg);
	viewJs.hideBusyMask('toSelCategories');
	viewJs.initSelCategories();
};
viewJs.toSelTag = function(){
    viewJs.toggleCameraShow();
	viewJs.top();
	var $dlg =$('#selServiceTags');
	viewJs.toggleAddServiceEvents();
	if($dlg.length == 0){
		var $dlg = $([
			'<div id="selServiceTags" class="ui-page fullScreen vChild">',
			'<div data-role="header" >',
			'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
			'<h1>选择标签</h1>',
			'<a class="ui-btn vFinish">完成</a> ',
			'</div>',
			'<div class="content">',
            '<div class="font-gray tag-tip">','点击','<span class="v-fill-tag-icon">　</span>才能完成标签的输入哦！','</div>',
			'<div class="selTags">',
			'<div id="enterTags" class="vForm-1 enterItems"> ',
			'<div class="enterItem">',
			'<input type="text" maxlength="7" placeholder="手动输入标签" class="tag" oninput="viewJs.toggleVTriCheckIcon(this);">',
			'<div class="tagIcon"></div>',
			'</div>',
			'</div>',
			'<div class="selCatTag">',
			'<h3>选择标签</h3>',
			'<div id="catTags">',
			'</div>',
			'</div>',
			'</div>',
			'</div>',
			'</div>'].join('')).hide().enhanceWithin();
	}
	var $p = $.mobile.activePage;
	$p.append($dlg);
    var params = mainJs.parseUrlSearch();
    if(params.catName == 'bigsai'){
        var lang = sessionStorage.getItem('lang');
        var pubData =null;
        if(lang == 'en'){
            pubData = pubEnJs
        }else{
            pubData = pubCnJs
        }
        $('#selServiceTags h1').html(pubData.chioseTag)
        $('#selServiceTags .vFinish').html(pubData.submit)
        $('#selServiceTags .tag-tip').html(pubData.tagTip)
        $('#selServiceTags .tag').attr('placeholder',pubData.tag)
        $('#selServiceTags .selCatTag h3').html(pubData.setTag)
    }


	$dlg.hide();
	$(document).trigger('selCatTagShow');
	viewJs.initSelServiceTags();
};
viewJs.addServiceWantDesc = function(){
	viewJs.top();
	var $p = $('#addServiceWantDesc');
	var serviceDesc = $.trim($p.find('.editorArea1').val());
	if(serviceDesc.length < 10){
		viewJs.showPopMsg('描述不能少于10个字');
		return;
	}
	// uuuu
	serviceDesc = viewJs.replaceSymbol(serviceDesc);
	var txtDesc = $(['<div>',serviceDesc,'</div>'].join('')).text();
	console.log(txtDesc)
	$.mobile.activePage.find('.toaddServiceWantDesc .vCt').html(viewJs.typesetting(txtDesc)).attr('edit',1);

	if($.mobile.activePage.attr('id') == "addService"){
		addServiceJs.resetLinkMap(serviceDesc);
	}
	viewJs.toggleParentShow(true);
	$p.hide();

    viewJs.toggleCameraShow(true);

};
viewJs.initSelServiceTags = function(){
	viewJs.top();
	var $p = $.mobile.activePage;
	var categoryID = $.trim($p.find('.cat .vCt').attr('catId'));
	var  params = {categoryID:categoryID};
	dmJs.getCategoryTags(params, function(data){
		var list = data.tags;
		if(!list){
			if(($.isArray(data) && data.length == 0) || data == null || data.length == 2){
				list = [];
			} else {
				list = data.substr(1, data.length-2).split(',');
			}	
		}

		var l = list.length, i=0,tag, html =[];
		var $catTags = $('#catTags');
		$catTags.empty();
		for(; i < l; i++){
			tag = list[i];
			html.push(['<div class="vbt dbTag" onclick="viewJs.clickManuallyEnterIcon(this);">',tag,'</div>'].join(''));
		}
		$catTags.html(html.join(''));
		viewJs.toggleParentShow();
		$('#selServiceTags').show();
		viewJs.toggleAddServiceEvents(true);

	});
};
viewJs.toggleParentShow = function(bShow){
	var $p = $.mobile.activePage;
  if(bShow){
	  //$p.find('.ui-content:first').show()
  } else {
	  $p.find('.fullScreen.vChild').css({
		  'min-height':($p.height())+'px'
	  });
	  //$p.find('.ui-content:first').hide()
  }
};
viewJs.toggleAddServiceEvents = function(flg){
	var $p = $.mobile.activePage; 
	$p.find('.selectedCat').unbind('click');
	$p.find('.toSelCategories').unbind('click');
	$p.find('.toSelTag').unbind('click');
	$p.find('.toaddServiceWantDesc').unbind('click');
	$('#addServiceWantDesc .vFinish').unbind('click');
	$p.find('.vChild .vBack').unbind('click');
    $p.find('.abortPublish').unbind('vclick');
	$p.unbind('selCatTagShow');
	if(flg){
        $p.find('.abortPublish').on('vclick', viewJs.abortPublish);
		$p.find('.toSelCategories').click(function(){
			viewJs.toSelCategories(this);
		});
		$p.find('.selectedCat').click(function(){
			viewJs.selCategories(this);
            viewJs.toggleCameraShow(true);
		});
		$('#selServiceTags .vFinish').click(function(){
			viewJs.selSvrTags(this);

		});
		$p.find('.vChild .vBack').click(function(){
			viewJs.toggleParentShow(true);
			$(this).parents('.vChild').hide();
            viewJs.toggleCameraShow(true);

		});
		if(window.addServiceJs){
			//console.log('text-link-bar: '+$p.find('.text-link-bar').length);
			$p.find('.text-link-bar').unbind().click(function(){
				addServiceJs.toAddDescLink();
			});
		}
		$p.find('.toaddServiceWantDesc').click(viewJs.toaddServiceWantDesc);
		$('#addServiceWantDesc .vFinish').click(viewJs.addServiceWantDesc);
		$p.find('.toSelTag').click(function(){
			var $p = $.mobile.activePage;
			var categoryID = $.trim($p.find('.cat .vCt').attr('catId'));
			if(categoryID ==''){
				viewJs.showPopMsg('请先选择分类');
			} else {
				viewJs.toSelTag();
			}
		});
		$(document).unbind('selCatTagShow').on('selCatTagShow', viewJs.onselCatTagShow);
		$p.on('addServiceDescShow', viewJs.onaddServiceDescShow);

	}
};
viewJs.onaddServiceDescShow = function(){
		var $p = $.mobile.activePage;
        var descmethod =  window._dddddop ? 'html' : 'text';
		var desc = $.trim($p.find('.ui-content:first .vForm-1 .toaddServiceWantDesc .vCt[edit]')[descmethod]());
	var $desc = $('#addServiceWantDesc');
	// uuuu
	desc = $(['<div>',desc,'</div>'].join('')).text();
	$desc.find('.editorArea1').val(desc);


};
viewJs.toggleCameraShow = function(bShow){
    var $p = $.mobile.activePage;
    if($p.is('#addService')){
        if(bShow){
            $p.find('.camera').show().find('.h-menu').hide();
        } else {
            $p.find('.camera').hide();
        }
    }
};
viewJs.onselCatTagShow = function(){
        viewJs.toggleCameraShow();
		var $p = $.mobile.activePage;
		var tags = $.trim($p.find('.ui-content:first .vForm-1 .toSelTag .tags[edit]').text());
		var $items = $('#enterTags');
		if(tags == ''){
			$items.html(['<div class="enterItem">',
			'<input type="text" maxlength="7" placeholder="手动输入标签" class="tag" oninput="viewJs.toggleVTriCheckIcon(this);">',
			'<div class="tagIcon"></div>',
			'</div>'].join('')).enhanceWithin();
			return;
		}
		tags = tags.split(/[,，]/);
		var i = 0, l= tags.length;
		var htmls = []
		for(; i < l; i++){
			htmls.push(['<div class="enterItem fill readonly">',
				  '<input type="text" maxlength="7" readonly placeholder="手动输入标签" class="tag" value="',tags[i],'" oninput="viewJs.toggleVTriCheckIcon(this);">',
				  '<div class="tagIcon"></div>',
				'</div>'
			].join(''));
		}
		if(l < 3){
			htmls.push(['<div class="enterItem">',
			'<input type="text" maxlength="7" placeholder="手动输入标签" class="tag" oninput="viewJs.toggleVTriCheckIcon(this);">',
			'<div class="tagIcon"></div>',
			'</div>'].join(''));
		}
		$items.html(htmls.join('')).enhanceWithin();
    var params = mainJs.parseUrlSearch();
    if(params.catName == 'bigsai'){
        var lang = sessionStorage.getItem('lang');
        var pubData =null;
        if(lang == 'en'){
            pubData = pubEnJs
        }else{
            pubData = pubCnJs
        }
        $('#selServiceTags .tag').attr('placeholder',pubData.tag)
    }
};
viewJs.abortPublish = function(){
	viewJs.dialogPop('确定放弃发布吗？已填写的内容将不能保存。', function(isConfirm){
		if(isConfirm){
			viewJs.navigator.pre();
		}
	});
};
viewJs.initSelCategories = function(){
    viewJs.toggleCameraShow();
	viewJs.maskBusy('生成分类中', 'initSelCategories');
	viewJs.top();
	//var bEnterprise = viewJs.isEnterpriseVerifyIdentity();
	dmJs.getCategories(function(lst){
		viewJs.maskBusy('生成分类中', 'initSelCategories');
		
		var $p = $('#selCategories');
		var $l = $p.find('.cat-lst').empty();
		var l = lst.length,i=0,item,html = [];
		for(; i < l; i++){
			item = lst[i];
			if(item.isShow != 1){
				continue;
			}
			/*
			if($.mobile.activePage.attr('id')=='addWant' &&(item.id == 44 || item.id == 45)){
				continue;
			}
			*/
			//hw
			if(item.category!=null && getQueryString("catId")!=item.category.id){
				continue;
			}
			/*
			if($.mobile.activePage.attr('id')=='addWant'){
				if(getQueryString("catId")==null){
					if(item.id == 47 || item.id == 48  || item.id == 46){
						continue;
					}
				}else if(getQueryString("catId")==47){
					if(item.id != 47){
						continue;
					}
				}
			}
			
			if($.mobile.activePage.attr('id')=='addService'){
				if(getQueryString("catId")==null){
					if(item.id == 44 || item.id == 45 || item.id == 48 || item.id == 47  || item.id == 46){	
						continue;
					}
				}else if(getQueryString("catId")==44){
					if(item.id != 44){
						continue;
					}
				}else if(getQueryString("catId")==45){
					if(item.id != 45){
						continue;
					}
				}else if(getQueryString("catId")==48){
					if(item.id != 48){
						continue;
					}
				}					
			}*/
			//hw
			html.push([
				'<li>',
					'<a class="vbt vr selectedCat" catId="',item.id,'" onsclick="viewJs.selCategories(this);">',
						item.categoryName,
					'</a>',
				'</li>'
			].join(''));
		}
		$l.html(html.join(''));
		viewJs.hideBusyMask('initSelCategories');
		viewJs.toggleParentShow();
		$p.show();
		viewJs.toggleAddServiceEvents(true);
	});
};
viewJs.toaddServiceWantDesc = function(){
	var $p = $.mobile.activePage;
    var params = mainJs.parseUrlSearch();
	var bService = $p.attr('id') == "addService";
    viewJs.toggleCameraShow();
	viewJs.top();
	var $dlg =$('#addServiceWantDesc');
	viewJs.toggleAddServiceEvents();
    var descHtml = '';
    if(params.catId == 2 && params.catName == '需求'){
        //descHtml = '需求对象:\n\n\n需求场景:\n\n\n完成时间:\n\n\n需求功能: \n\n';
        descHtml = new String("需求对象:\n\n\n需求场景:\n\n\n完成时间:\n\n\n需求功能: \n\n");

    }else if(params.catId == 2 && params.catName == '众包项目'){
        descHtml = '功能需求： \n\n\n资质要求：\n\n\n完成时间：\n\n验收标准：\n\n\n项目预算： ';
    }else if(params.catId == 8){
        descHtml = '众筹模式： \n\n\n筹资金额：\n\n\n筹资方式：\n\n\n注意事项：\n\n ';
    }else if(params.catId == 1){
            descHtml = '我的特长： \n\n\n我的资质：\n\n\n奖项成就：\n\n\n购买限制：\n\n ';
    }else if(params.catId == 4){
        descHtml = '人员要求： \n\n\n活动内容：\n\n\n注意事项：\n\n\n ';
    }
	if($dlg.length == 0){
		var $dlg = $([
				'<div id="addServiceWantDesc" class="ui-page fullScreen vChild">',
			'<div data-role="header" >',
			'<a	class="ui-btn ui-icon-back vBack ui-btn-icon-notext">返回</a> ',
			'<h1>描述</h1>',
			'<a class="ui-btn vFinish">完成</a> ',
			'</div>',
			'<div class="content"><div class="txt-container ',!bService ? "" :'has-footer-bar','">',
			'<textarea data-role="none" placeholder = " ' +descHtml+ '" class="editorArea1 single ',!bService ? "" :'has-footer-bar','" maxlength="10000"></textarea>',
			!bService ? "" : '<a class="text-link-bar" >插入链接</a></div>',
			'</div>',
			'</div>'].join('')).hide().enhanceWithin();
	}
	var $p = $.mobile.activePage;

	$p.append($dlg);
    if(params.catName == 'bigsai'){
        var lang = sessionStorage.getItem('lang');
        var pubData =null;
        if(lang == 'en'){
            pubData = pubEnJs
        }else{
            pubData = pubCnJs
        }
        var desPlaceHolder = pubData.decmore;
        $('#addServiceWantDesc .editorArea1').attr('placeholder',desPlaceHolder)
        $('#addServiceWantDesc h1').html(pubData.dec)
        $('#addServiceWantDesc .vFinish').html(pubData.submit)
        $('.text-link-bar').html(pubData.insertLink)
    }
	viewJs.toggleParentShow();
	//$dlg.css('min-height', $p.height()-80);
	$p.trigger('addServiceDescShow');

	$dlg.show().find('.editorArea1').focus();


	viewJs.toggleAddServiceEvents(true);
};
viewJs.toggleVTriCheckIcon = function(el){
	var $el = $(el);
    var originalVal = $el.val();
	var val = originalVal.replace(/[^\u4e00-\u9fa5_a-zA-Z0-9']/g,'');
	var $item = $el.parents('.enterItem:first');
	if($.trim(val) == ''){
		$item.removeClass('fill');
	} else {
		$item.addClass('fill');
	}
    if(val != originalVal){
        clearTimeout($el.data('toggleVTriCheckIcon'));
        $el.data('toggleVTriCheckIcon', setTimeout(function(){
            var val = $el.val()+'';
            $el.val(val);
        },300));
    }
};
viewJs.selCategories = function(el){
	var catId = $(el).attr('catId');
	// var $p = $('#addService');
	$.mobile.activePage.find('.cat .vCt').html($(el).html()).attr('catId', catId).attr('edit',1);
	viewJs.toggleParentShow(true);
	$('#selCategories').hide();
	// $('#selCategories').remove()
};
viewJs._appendDfTag = function(tags){
    var ret = [];
    $.each(tags.split('[，,]'),function(i, tag){
        var item = $.trim(tag);
        if(item != '北大创新'){
            ret.push(item);
        }
    });
    //ret.unshift('北大创新');
    return ret.join('，');
};
viewJs._keepDfTag =function(val){
    if(val === true || $.trim(val) == '北大创新'){
        $.mobile.activePage.find('input[name="keep-tags"]').val('北大创新');
        return false;
    }
    return true;
};
viewJs._getTags = function(tags){
    var dbTag = $.trim($.mobile.activePage.find('input[name="keep-tags"]').val());
    if(dbTag == '北大创新'){
        return viewJs._appendDfTag(tags);
    }
    return tags;
};


function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]); return null;
}
