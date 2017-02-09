var updateInfoJs = {
	draw:function(){
		var $p = $.mobile.activePage;
		var user = dmJs.sStore.getUserInfo();
		if(user == null){
			dmJs.sStore.toLogin();
			return;
		}
		var userInfo = user.user;
		var userType = userInfo.type;
        var $avatar = $p.find('img.myPic').attr('src',mainJs.getProfilePicUrl({url:userInfo.profileImageUrl,sex:userInfo.sex}));
        uploadAvatarJs.setup($('#myAvatar-file'),$avatar ,this.toggleEvents)
		if(userType != '2'){
            this._getSchools();
			$p.attr('infotype', 'person');
			this.loadDatePicker();
			$p.find('.sex select').val(userInfo.sex);
			$p.find('#updateInfoBirth').val(userInfo.birthday);
            $p.find('.school>.vTd').html(userInfo.school);
		} else {
			$p.attr('infotype', 'enterprise');
		}
		
		$p.find('.realname>.vTd').html(userInfo.realname);
		$p.find('.description>.vTd').html(userInfo.description);
		$p.find('.city-area2>.vTd').html([userInfo.city,userInfo.area2].join('&nbsp;'));
		$p.find('.email>.vTd').html(userInfo.email);
		$p.find('.wechat>.vTd').html(userInfo.wechat);
	},
	init:function(){
		this.draw();
		this.toggleEvents(true);
	},loadDatePicker:function(){
			var me = updateInfoJs;
			$.getCss({id:'mobiscrollerCss', url:'resource/js/plugin/datepicker/simpledatepicker2.css?__vvv='+mainJs.publishVer,
			ajaxOpt:{
				success:function(){
					me.picker = $('#updateInfoBirth').datepicker({base:''});
					$.mobile.activePage.append(me.picker);
				}
			}
		});
	},destroy:function(){
		var me = updateInfoJs;
		if(me.picker){
			me.picker.remove();
		}
        $('#toSelectCityDlg,#toSelAreaDlg,#toEditTextFieldDlg').remove();
		me.toggleEvents();
	},
	back:function(){
        $.mobile.activePage.hide();
			viewJs.navigator.next({next:{
			url:'./account.html',
            id:'account'
		},lastAuto:false});
	},
	success:function(){
		var me = updateInfoJs;
		var $p = $.mobile.activePage;
		var f =  me.getFieldVals();
		var user = dmJs.sStore.getUserInfo();
		$.extend(user.user, f);
//		user.user.tags = f.tags.split(',');
		user.saveSelf();
		me.back();
	},
	toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = updateInfoJs;
		$p.undelegate();
		$('#toSelectCityDlg').undelegate();
		$('#toSelAreaDlg').undelegate();
		if(isBind){
			$p.one('pagebeforehide',me.destroy);
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.vrHeader .backBtn', 'vclick', me.back);
				$p.delegate('.city-area2', 'vclick', me.toSelectCity);
				$p.delegate('.fullScreen.vChild .vBack', 'vclick', me.closeChild);
				$('#toSelectCityDlg').delegate('.hotList>li>a,.allList>li>a', 
				'tap', me.toSelArea).delegate('.letter-list a', 'vclick', 
					me.scrollTo).delegate('.vBack', 'vclick', me.closeChild);
				$('#toSelAreaDlg').delegate('.vBack', 'vclick', me.closeChild);
				$p.delegate('.vbt.submit', 'vclick', me.submit);
                $p.delegate('input[name=school]', 'input', me.matchSchool);
                $p.delegate('input[name=school]', 'change', me.matchSchool);
                $p.delegate('input[validItem=wechat]', 'input', me.validWechat);
                $p.delegate('.school-item', 'vclick', me.selSchool);
                $p.delegate('.myInfo', 'vclick',function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    $('#myAvatar-file').click();
                });
				$p.delegate('.email,.wechat,.realname,.description,.school', 'vclick', me.toEditTextField);
                $p.delegate('.valid-bytes-length', 'input', viewJs.validInput);
			}, 500);
		}
	},scrollTo:function(){
		var me = updateInfoJs;
		var $el =  $(this);
		var $target = $('#'+$.trim($el.text()))
		var offset = $target.offset();
		console.log(offset);
		$(window).scrollTop(offset.top);
		me.toggleEvents(true);
	},closeChild:function(){
		var $p = $.mobile.activePage;
		viewJs.top();
		if($(this).is('#toSelAreaDlg .vBack')){
			$('#toSelectCityDlg').show();
		} else {
			$p.show();
		}
		var me = updateInfoJs;
		me.toggleEvents(true);
		$(this).parents('.fullScreen.vChild:first').hide();
	},saveChange:function(btn, $item){

        var $vp = $(btn).parents('.fullScreen.vChild:first');
        var $enter = $vp.find('.enter');
        var val = $.trim($enter.val());
        var validItem = $.trim($enter.attr('validItem'));
        var msg;
        switch (validItem){
            case '':
                break;
            case 'realname':
                if(val == ''){
                    msg = "姓名不可以为空";
                }
                break;
            case 'description':
                if(val == ''){
                    msg = "个人简介不能为空";
                }
                break;
            case 'school':
                if(val == ''){
                    msg = "所在学校不能为空";
                }
                break;
            case 'wechat':
                if(val == ''){
                    msg = "微信号不能为空";
                }
                if(val.length < 6 || val.length > 20){
                    msg = "微信号6-20位";
                }
                if(!/^[a-zA-Z][\w\-]{5,19}$/.test(val)){
                    msg = "微信号格式不正确";
                }
                break;
            case 'email':
                if(val == ''){
                    msg = "邮箱不能为空";
                } else if(!viewJs.validate.email(val)){
                    msg = "邮箱格式不正确";
                }
                break;

        }
        if(msg){
            viewJs.showPopMsg(msg);
            return;
        }
		var $p = $.mobile.activePage;
		$item.html(val);
		$vp.fadeOut();
	},validWechat:function(){
        var $el = $(this);
        var val  = $.trim($el.val()).replace(/[^\d\_\-a-zA-Z]/g, '').replace(/^[^a-zA-Z]+/, '');
        $el.val(val);
    },
	toEditTextField:function(){
        viewJs.top();
		var me = updateInfoJs;
		var $Item = $(this);
		if($Item.is('.realname')){
			var user = dmJs.sStore.getUserInfo().user;
			var inValid;
			if(user.isMoneyGuaranteed == '1'){
				viewJs.showPopMsg('您已通过银行卡认证,无法修改姓名');
				return;
			} else if((inValid = viewJs.isLockVerifyIdentity(user.isIdcardValidated))){
				viewJs.showPopMsg(inValid + ',无法修改姓名');
				return;
			}
		}

		var $p = $.mobile.activePage;
		me.toggleEvents();
		var $dlg =$('#toEditTextFieldDlg');
		if($dlg.length == 0){	
			var  i = 0;
			var $dlg = $([
				'<div id="toEditTextFieldDlg" class="ui-page itemEditor fullScreen vChild">',
				'<div data-role="header">',
				'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
				'<h1></h1>',
				'<a	class="ui-btn vFinish">完成</a> ',
				'</div>',
				'<div class="content">',
				'</div>',
				'</div>'].join('')).hide().enhanceWithin();
		}
		$p.append($dlg);

		var placeholder, $editor = $dlg.find('.content').html(updateInfoJs._getEditor($Item)).enhanceWithin().find('.enter');
		$dlg.find('.ui-header h1').html('编辑'+$Item.find('.vTh').html());
		$dlg.find('.vFinish').unbind('click').on('click',function(){
			updateInfoJs.saveChange(this, $Item.find('.vTd'));
		});
		var val = $.trim($Item.find('.vTd').html());
		$editor.val(val);
		$dlg.css({'min-height': $p.height()-80,height:'100%'});
		$dlg.show().find('.editorArea1').focus();
		me.toggleEvents(true);
	},_getEditor:function($item){
		var html = [];
		if($item.is('.realname')){

			html.push(['<input type="text" validItem="description" class="valid-bytes-length editorArea1 enter" placeholder="请输入名称" maxlength="40">'].join(''));
		} else if($item.is('.description')){
            var userInfo = dmJs.sStore.getUserInfo().user,maxlength,rows=12;
            maxlength = 140;
            if(userInfo.type == 2){
                maxlength = 140;
                rows = 30;
            }
			html.push(['<div class="textarea-parent"><textarea  rows = "',rows,'" validItem="description" class="valid-bytes-length editorArea1 enter "',
				' placeholder="单位:\n学科:\n职称:\n个人简介:">单位:\n学科:\n职称:\n个人简介:</textarea></div><!--<p class="comment1 info-person">请不要超过70个字</p>-->'].join(''));
		}else if($item.is('.email')){
			html.push(['<input type="text" validItem="email"class="editorArea1 enter"',
				' placeholder="请输入邮箱" maxlength="30"></input><p class="comment1">例如：service@euming.com</p>'].join(''));
		}else if($item.is('.wechat')){
            html.push(['<input type="text" validItem="wechat" class="editorArea1 enter"',
                ' placeholder="请输入微信号" maxlength="20"></input><p class="comment1">例如：euming</p>'].join(''));
        }else if($item.is('.school')){
            html.push([
               '<div class="field-contain">',
                   '<label for="text-13">大学</label>',
                    '<input type="text" validItem="school" placeholder="请输入所在学校" maxlength="20" data-clear-btn="true" name="school" class="enter">',
                    '</div>',
                '<div id="match_school_list" style="display: none"></div>'
            ].join(''));
        }
		return html.join('');
	},
	submit:function(){
		var me = updateInfoJs;	
		var f = me.validate();
		if(f != null){
			dmJs._ajax({
				method:'POST',
				id:'updateInfo',
				params:f,
				url:'/urming_quan/user/updateInfo',
				callback:me.success
			});
		}
	},getFieldVals:function(){
		var $p = $.mobile.activePage;
		var f = {};
		$p.find('.vItemTable .vTr[item]:visible').each(function(i, el){
			var $el = $(el);
			var name = $el.attr('item');
			var val = $.trim($el.find('.vTd').text());
			if(name == 'city-area2'){
				var vals = val.split(/\s/);
				f['city'] = $.trim(vals[0]);
				f['area2'] = $.trim(vals[1]);
			} else {
				f[name] = val;
			}
		});
		if($p.is('[infotype="person"]')){
			f.birthday = $('#updateInfoBirth').val();
			f.sex = $('#select-custom-1').val();
		}
		return f;
	},validate:function(){
		var f =  this.getFieldVals();
		f.accessToken = dmJs.sStore.getUserInfo().accessToken;
		return f;
	},toSelectCity:function(){
		var me = updateInfoJs;	
		me.toggleEvents(true);
		var $dlg =$('#toSelectCityDlg');
		if($dlg.length == 0){
			me.initCityListPage();
		} else {
			// $($.mobile.activePage).append($dlg);
			$dlg.show();
		}
		viewJs.top();
	},toSelArea:function(){
		viewJs.top();
		var me = updateInfoJs;
		var areaName = this.title;
		var areaId = $(this).attr('data-cityid');
		$.mobile.activePage.hide();
		me.toggleEvents(true);
		$(this).parents('.fullScreen.vChild').hide();
		$('#toSelAreaDlg').remove();
		dmJs.getAreasByParentId(areaId, function(data){
			$('#toSelectCityDlg').hide();
			var html = [];
			var list = data.areas;
			var i = 0, l= list.length,item;
			for(; i < l; i++){
				item  = list[i];
				html.push([
					'<li><a>',
						item.areaName,
					'</a></li>'].join('')
				);
			}
			var $dlg = $([
				'<div id="toSelAreaDlg" data-city="',areaName,'"class="ui-page fullScreen vChild">',
				'<div data-role="header"  >',
				'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
				'<h1>选择区域</h1>',
				'</div>',
				'<div class="content">',
				'<ul data-role="listview" class="areaItem">',
					html.join(''),
				'</ul>',
				'</div>',
				'</div>'].join('')).enhanceWithin();
				$(document.body).append($dlg);
				viewJs.top();
				setTimeout(function(){
					$dlg.delegate('.areaItem>li>a', 'vclick', function(){
						me.toggleEvents(true);
						var $p = $.mobile.activePage.show();
						$('#toSelectCityDlg').hide();
						var city = $(this).parents('.fullScreen.vChild').remove().attr('data-city');
						
						$p.find('.city-area2 .vTd').html([city, $(this).html()].join('&nbsp;'));
					});
				}, 500);
		
		},function(){
			me.toggleEvents(true);
		});
	},initCityListPage:function(){
		var me = updateInfoJs;	
		var $dlg = $('#toSelectCityDlg');
		if($dlg.length > 0){
			return;
		}
		$.get('resource/fragment/citylist.txt', function(data){
			var txt = data.replace('{0}', dmJs.params.geolocation.city);
			var $p = $.mobile.activePage;
			var $city = $(txt);
			$city.find('.position-city:first').remove();
			var $list = $([
				'<div id="toSelectCityDlg" class="changeCity ui-page fullScreen vChild">',
				'<div data-role="header"  >',
				'<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
				'<h1>选择所在地</h1>',
				'</div>',
				'<div class="content">',
					
				'</div>',
				'</div>'
				].join(''));

			$(document.body).append($list.enhanceWithin());
			$list.find('.content').append($city);
		});
	},_getSchools:function(){
        var me = updateInfoJs;
        var key = 'user_schools';
        var ver = 2;
        if(me.aSchool){
            return me.aSchool;
        }
        var aSchool = $.parseJSON(localStorage.getItem(key));
        if(aSchool && aSchool.ver < ver){
            me.aSchool = null;
            localStorage.removeItem(key);
            aSchool = null;
        }
        if(aSchool == null){
            $.get('resource/data/schools.txt', null, function(data){
                localStorage.setItem(key, data);
                me.aSchool = $.parseJSON(data).data;
            });
        } else {
            me.aSchool = aSchool = $.parseJSON(localStorage.getItem(key)).data;
            return aSchool;
        }

    },matchSchool:function(e){
        var $el = $(this);
        var me = updateInfoJs;
        if(e.type == 'change'){
            if($.trim($el.val()) == ''){
                me._matchSchool($el);
                clearTimeout($el.data('match_handler'));
            }
            return;
        }
        if(!me.aSchool){
            return;
        }

        var handler;
        handler = setTimeout(function(){
            me._matchSchool($el);
        }, 200);

    },_matchSchool:function($el){
        var me = updateInfoJs;
        var val = $.trim($el.val()).replace(/[\u0020-\u007f\uff61-\uff9f]/g, '');
        var lastVal = $el.data('lastVal');
        var aMatch = [];
        if(val != ''){
            var reg = new RegExp(',[^,]*'+val+'[^,]*,', 'g');
            aMatch =(me.aSchool.match(reg) || []).slice(0, 10);
        }
        var tpl = me.match_school_tpl || $('#match_school_tpl').html();
        me.match_school_tpl = tpl;
        var l = aMatch.length;
        var html = [];
        var $list = $('#match_school_list');
        if(l == 0){
            $list.empty().hide();
        } else {
            for(var i = 0; i < l; i++){
                html.push(viewJs.applyTpl(tpl, {name:aMatch[i].replace(/,/g, '')}))
            }
            $list.html(html.join('')).show();
        }

        $el.data('lastVal', val);
    },selSchool:function(){
        var $p = $.mobile.activePage;
        $p.find('input[name=school]').val($.trim($(this).text()));
        var $list = $('#match_school_list');
        $list.empty().hide();
    }
};