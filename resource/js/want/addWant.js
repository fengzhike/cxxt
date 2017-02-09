addWantJs = {
	init:function(){
		//hw
		this.initLabels();
		//hw
		var me = addWantJs;
		var $p = $.mobile.activePage;
		me.envWx = $p.is('[wx]');
		me.defaultUrl = '//urming_quan/want/addWant';
		if(me.envWx){
			me.defaultUrl = '/urming_quan/want/addWantByVerifyCode';
		}
		var user = dmJs.sStore.getUserInfo();
		if(!me.envWx && user == null){
			dmJs.sStore.toLogin();
			return;
		}
		me.initPage();
		me.toggleEvents(true);
	},toggleEvents:function(isBind){
		viewJs.toggleAddServiceEvents();
		var $p = $.mobile.activePage;
		var me = addWantJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				viewJs.toggleAddServiceEvents(true);
				$p.delegate('.submit', 'vclick', me.submit);
                $p.delegate('input.serviceName','input',viewJs.validInput);
				$p.delegate('.vbt.sendCode.enable:not(.busy)', 'vclick', me.getVerifyCode);
				$p.delegate('[data-format]', 'input', viewJs.validInput);
			},500);
		}
	},initPage:function(){
		var params = mainJs.parseUrlSearch();
		if(params.wantID != null){
            params.accessToken =  dmJs.getAccessToken();
			dmJs._ajax({id:'getUserWants',params:params,url:'/urming_quan/want/getWantByID',callback:this.initWantDetails});
		} else {
            viewJs._keepDfTag(true);
        }
	},initLabels:function(){//hw
		var me = addWantJs;
		var $p = $.mobile.activePage;
		var params = mainJs.parseUrlSearch();
        viewJs.checkInputEmpty()
		me.envWx = $p.is('[wx]');
		me.defaultUrl = '/urming_quan/want/addWant';
		if(me.envWx){
			$p.find('.wx').show();
			me.defaultUrl = '/urming_quan/service/addServiceByVerifyCode';
		}
		if(params.serviceID != null){
			viewJs.setTitle('编辑需求');
		} else if(params.wantID != null){
		} else {
			var $p = $.mobile.activePage;
			//$p.find('.toaddServiceWantDesc>.vCt').html(" \n   我能\n\n   我的资质\n   1. \n   2.\n\n   注意事项\n   1.\n   2.\n\n  常见问题\n  1.\n  2.");
			var label = "需求";
			if(params.catId){
				var catNames = {2:'需求',5:'问题'};
				label = catNames[params.catId];
				if(params.catName == '众包项目'){
					$p.find('.toSelCategories .vCt').attr('catId','97').html('众包项目').parent().parent().hide();
					$p.find('.toaddServiceWantDesc .vCt').html('说点啥吧，让大家了解你的项目，增强效果！10字以上哦');
                    label = '众包';

				}
				//$p.find('.toSelCategories .vCt').attr('catId',params.catId).html(label);
			}
			if(params.catId != 2){
				$("#publish_unit").parent().parent().parent().hide();
			}
			viewJs.setTitle('发布'+label);
			//$('#publish_title').attr('placeholder','发布'+label);
			var descHtml = '';
			if(params.catId == 2 && params.catName == '需求'){
				descHtml = '需求对象:\n1.\n2.\n\n需求场景:\n1.\n2.\n\n完成时间:\n1.\n2.\n\n需求功能: \n1.\n2.\n\n';

			}else if(params.catId == 2 && params.catName == '众包项目'){
				descHtml = '实现的效果？\n功能需求： \n资质要求：\n完成时间：\n验收标准：\n项目预算： ';
			}
            //$('#addServiceWantDesc .editorArea1').attr('placeholder',descHtml)
			//$p.find('.toaddServiceWantDesc>.vCt').html(descHtml);
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
	},initWantDetails:function(data){

		var me = addWantJs;
		var want = data.want;
        //console.log(data)
		var categoryId = want.category.id;
		var wantName = want.wantName;
		var wantDesc = want.wantDesc;
		var price = want.price;
		var unit = want.unit;
		var user = want.user;
		var userTags = [];
		$.each(user.userTags, function(i, tag){
            if(viewJs._keepDfTag(tag.tagName)){
                userTags.push(tag.tagName);
            }
		});
        var onlyGroup = want.onlyGroup;

		var $p = $.mobile.activePage;
        var on = onlyGroup? true:false;
		var $f = $p.find('.vForm-1:first');
		var $serviceName = $f.find('.serviceName');
		var $tags = $f.find('.toSelTag .vCt');
		var $cat = $f.find('.toSelCategories .vCt');
		var $price = $f.find('.price input');
		var $wantDesc = $f.find('.toaddServiceWantDesc .vCt');
        $f.find('#show_check').attr('checked',on);
		dmJs.findCatById(categoryId, function(cat){
            var tagStr = userTags.join('，');
			$cat.attr('catid', categoryId).text(cat.categoryName).attr('edit',1);
			$serviceName.val(wantName);
			$tags.html(tagStr).attr('edit',1);
			$price.val(price);
			$wantDesc.html(wantDesc).attr('edit',1);
			if(typeof(unit)!="undefined"){
				$("#publish_unit").val(unit);
			}
		});
	},submit:function(){
		var me = addWantJs;
		var initParam = mainJs.parseUrlSearch();
		var options  = {serviceName:'wantName',serviceDesc:'wantDesc',busyDesc:"需求发布中", price:'price',
			url:mainJs.getApiUrl(me.defaultUrl)
		};
		if(initParam.wantID != null){
			options.url = mainJs.getApiUrl('/urming_quan/want/updateWant');
			options.extraParams = {
				wantID:initParam.wantID,
				catId:mainJs.parseUrlSearch().catId
			};
		} else {
			options.envWx = me.envWx;
			if(!options.envWx){
				options.callback = me.matchServices;
			} else {
				options.callback = viewJs.wxBack;
			}
		}
        options.onlyGroup=$('#show_check').is(":checked")?1:0;
		viewJs._publish(options);
	},c:function(){
		if(mainJs.parseUrlSearch().catId != 2){
			viewJs.navigator.next({next:{
				url:'myWants.html',id:'myWants',options:{data:{catId:mainJs.parseUrlSearch().catId}}
			}});
			return;
		}
        var sec = mainJs.MATCH_WAIT;
		$('#matchServicesDlg').remove();
		var $m = $(['<div id="matchServicesDlg"  class="dlgunionPayPop-overlay">',
			'<div class="dlgPop-box ui-footer-fixed">',
			  '<div class="dlg-header">',
				'匹配服务',
			  '</div>',
			  '<div class="dlg-content">',
				'<a  data-role="button"  class="viewResults">查看我的需求</a>',
				'<a data-role="button" data-theme="f" class="matchResults">匹配服务（<span>',sec,'</span> s）</a>',
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
					url:'myWants.html',id:'myWants',options:{data:{catId:mainJs.parseUrlSearch().catId}}
				}});
			} else {
				var categoryName = $.trim($p.find('.toSelCategories>.vCt').text());
				var tagName = viewJs._appendDfTag($p.find('.toSelTag>.vCt').text()).replace(/，/g, ',');
				var keyword = $.trim($p.find('.inputCtr>div>.serviceName').val());
				var params = {categoryName:categoryName,tagName:tagName,keyword:keyword,catId:mainJs.parseUrlSearch().catId};
				viewJs.navigator.next({next:{
					id:'matchServices',
					url:'./matchServices.html',
					options:{
						data:params
					}
				}});
			}
		});
		viewJs.top();
		$m.show();
	}
};