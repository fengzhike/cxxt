registerJs = {
	init:function(){
		viewJs.clearRegister();
		this.toggleEvents(true);
        this.initPage();
        if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
            $("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
                '<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
        }
	},initPage:function(){
        var $p = $.mobile.activePage;
        $('#inviter-msg').remove();
        var params = mainJs.parseUrlSearch();
        var inviterId =  $.trim(params.inviterId);
        if(inviterId != ''){
            dmJs._ajax({
                id:'getInviterUserPage',
                url:'/urming_quan/user/getUserPage',
                params:{userId:inviterId},
                callback:function(data){
                    var realname = data.user.realname;
                    var tpl = $('#inviter-msg-tpl').html();
                    var info = {realname:realname, userId:inviterId};
                    $.mobile.activePage.find('.ui-content').prepend(viewJs.applyTpl(tpl, info));
                },preError:function(err){
                    if(err.error_code == '20101'){
                        return {error:'邀请人ID不正确',callback:function(){
                            viewJs.navigator.next({next:{id:'register',url:'./register.html'}});
                        }};
                    }
                    return err;
                }
            })
        }
        dmJs._ajax({
            id:'getTempCode',
            url:'/urming_quan/system/getTempCode',
            callback:function(data){
                $p.find(".securityCode > img").data("tempCode",data.data.code);
                registerJs.createSecurityCode();
            }
        });

        switch (params.type){
            case "1":
                $p.find(".type").html("个人");
                break;
            case "2":
                $p.find(".type").html("公众号");
                $p.find(".realname > .vTh").html("公众号");
                $p.find(".realname input").attr("placeholder","机构、企业名称");
                $p.find(".phone input").attr("placeholder","联系人手机号");
                $p.find(".enterprise").show();
                if(!params.channel&&!params.pubSection){
                    $p.find(".userType").show();
                }
                $p.find(".font-gray").show();
                var lang = sessionStorage.getItem('lang');
                var pubData =null,registData = null;
                var hrefpro = null;
                if(lang == 'en'){
                    pubData = pubEnJs;
                    registData =registEnjs;
                    hrefpro = './protocolEn.html';
                    $('.vItemTable').css('font-size','14px')
                    $p.find('.vTr  .vTh').css('width','8em')
                    $p.find('.vTr').css({'padding-left':'7em','padding-top':'6px'})
                    $p.find('.vcheck').css('right','auto')
                    $p.find('.termsCtr').css('text-align','left')
                }else{
                    pubData = pubCnJs;
                    registData =registCnjs;
                    hrefpro = './protocol.html';
                    $('.vItemTable').css('font-size','16px')
                }
                $('.toCitylist').hide()
                $p.find('.notLoginShow').append('<a class="lang_turn">To English</a>')
                $p.find('.userType span:eq(0)').html(registData.group).css('font-size','14px');
                $p.find('.userType span:eq(1)').html(registData.project).css('font-size','14px');
                $p.find('.font-gray').html(registData.tip);
                $p.find('.ui-title').html(registData.signUp);
                $p.find('.account .vTh').html(registData.userName);
                $p.find('#register_account').attr('placeholder',registData.userNameP);
                $p.find('.realname .vTh').html(registData.realname);
                $p.find('#register_name').attr('placeholder',registData.realnameP);
                $p.find('.contactRealname .vTh').html(registData.contactRealname);
                $p.find('#register_contactRealname').attr('placeholder',registData.contactRealnameP);
                $p.find('.securityCode .vTh').html(registData.securityCode);
                $p.find('.securityCode input').attr('placeholder',registData.securityCodeP);
                $p.find('.phone .vTh').html(registData.phoneName);
                $p.find('.phone .sendCode').html(registData.phoneCodeR);
                $p.find('.phone input').attr('placeholder',registData.phoneNameP);
                $p.find('.verifyCode .vTh').html(registData.phoneCode);
                $p.find('.verifyCode input').attr('placeholder',registData.phoneCodeP);
                $p.find('.password .vTh').html(registData.passWord);
                $p.find('.password .pwdCtr').html(registData.hide);
                $p.find('.password input').attr('placeholder',registData.passWordP);
                $p.find('#register_term').prev().html(registData.agree);
                $p.find('#register_term').html(registData.term).attr('data-href',hrefpro);
                $p.find('.submit').html(registData.submit);
                $p.find('.notLoginShow .ui-btn:eq(0)').html(registData.toLogin);
                $p.find('.notLoginShow .ui-btn:eq(1)').html(registData.toRegister);
                $('.lang_turn').html(pubData.turnLang)






                break;
            case "3":
                $p.find(".type").html("师资");
                break;
        }
    },toggleEvents:function(isBind){
		var $p = $.mobile.activePage;
		var me = registerJs;
		$p.undelegate();
		if(isBind){
			$p.one('pagebeforehide', function(){	
				me.toggleEvents();
			});
			setTimeout(function(){
				me.toggleEvents();
				$p.delegate('.vbt.submit', 'vclick', me.submit);
				$p.delegate('.vbt.sendCode.enable:not(.busy)', 'vclick', me.getVerifyCode);
				$p.delegate('.securityCode > img', 'vclick', me.createSecurityCode);
                $p.delegate('.termsCtr', 'vclick', me.toggleCheck);
                $p.delegate('.pwdCtr', 'vclick', me.togglePwdDisp);
                $p.delegate('.rItem:not(.sel)','vclick',me.onchangeType);
                $p.delegate('[data-format]', 'input', viewJs.validInput);
                $p.delegate('#register_name', 'input', me.onNameChange);
                $p.delegate('.toUser', 'vclick', me.toUser);
                $p.delegate('#register_term', 'vclick', function(){
                    window.open($(this).attr('data-href'));
                });
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
			}, 500);
		}
	},toUser:function(){
        var inviteId = $.trim($(this).attr('data-user-id'));
        viewJs.navigator.next({lastAuto:true,next:{
            url:'./u.html',
            id:'u',
            options:{data:{
                userId:inviteId
            }}
        }});
    },toggleCheck:function(){
        $(this).find('.vcheck').toggleClass('sel');
    },onNameChange:function(){
        var $el = $(this);
        clearTimeout($el.data('maxLengthHandler'));
        var originalVal =  $el.val();
        var val = originalVal.replace(/[^\u4e00-\u9fa5_a-zA-Z0-9'\s]/g,'');
        if(val != originalVal){
            $el.val(val);
        } else {
            $el.data('maxLengthHandler', setTimeout(function(){
                var val = $el.val()+'';
                val = viewJs.subStr($.trim(val).replace(/[^\u4e00-\u9fa5_a-zA-Z0-9'\s]/g,''), 40);
                $el.val(val);
            },500));
        }
    },onchangeType:function(){
        var $el = $(this);
        $el.addClass('sel').siblings().removeClass('sel');
        var userType = $el.attr('data-user-type');
        var $p = $.mobile.activePage;

        if(userType == 1){
            $p.find('.vTr.realname input').attr({placeholder:"请输入个人姓名",maxlength:"20"});
        } else {
            $p.find('.vTr.realname input').attr({placeholder:"中英文皆可，无法修改",maxlength:"20"});
        }
    },getVerifyCode:function(){
		var $p = $.mobile.activePage;
		var mobile = $p.find('.vTr.phone input').val();
		mobile = $.trim(mobile);
		if(mobile == ''){
			return;
		}
        if(mainJs.parseUrlSearch().type==2){
            viewJs.getVerifyCode();
        }else{
            dmJs._ajax({id:'validateMobile',method:'POST',params:{mobile:mobile},url:'/urming_quan/user/validateMobile',
                callback:function(data){
                    if(data.exsit){
                        viewJs.dialogPop('手机号已注册', function(){

                        }, '错误', {onlyBtnOk:true});
                        return;
                    }
                    viewJs.getVerifyCode();
                }});
        }
	},submit:function(){
		var me = registerJs;
		var f = me.validateRegisterForm();
		if(f != null){
            me._submit(f);
		}
	},_submit:function(f){
		dmJs._ajax({id:'register',method:'POST',params:f,url:'/urming_quan/user/'+(mainJs.parseUrlSearch().type==2?"registerForInstitution":"register"),callback:function(data){
            var tags = data.user.tags || [];
            /*if(tags.indexOf('北大创新') == -1){
                 tags.unshift('北大创新');
            }*/

            tags = tags.join(',');
            dmJs._ajax({id:'_setUserTag',method:'POST',
                params:{accessToken:data.accessToken,tags:tags},
                url:'/urming_quan/user/updateInfo',callback:function(ret){
                    data.user = data.user;
                    dmJs.sStore.saveLoginInfo(data);
                    viewJs.afterToggleLogin();
                    if(dmJs.sStore.get('regNext')){
                        var params = mainJs.parseUrlSearch();
                        params.sourceTag = dmJs.sStore.get('sourceTag');
                        var regNextParams = dmJs.sStore.get('regNextParams');
                        if(regNextParams){
                            params = $.extend({},params,regNextParams);
                        }
                        var next = {url:'./'+dmJs.sStore.get('regNext')+'.html', id:dmJs.sStore.get('regNext'), options:{data:params}};
                        dmJs.sStore.save("regNext",'');
                        dmJs.sStore.save("regNextParams",'');
                        viewJs.navigator.next({
                            next: next
                        });
                    }/*else if(dmJs.sStore.get('sourceTag') || dmJs.sStore.get('acTag') || dmJs.sStore.get('school')){
                        var params = mainJs.parseUrlSearch();
                        params.school = dmJs.sStore.get('school');
                        params.sourceTag = dmJs.sStore.get('sourceTag');
                        var next = {url:'./christmasQuestion.html', id:'christmasQuestion', options:{data:params}};
                        dmJs.sStore.save("sourceTag",'');
                        dmJs.sStore.save("acTag",'');
                        dmJs.sStore.save("school",'');
                        viewJs.navigator.next({
                            next: next
                        });
                    }*/else{
                        viewJs.navigator.next({next:{url:'./mine.html', id:'mine'}});
                    }
                }
            });
		}});
	},togglePwdDisp:function(){
        var $el = $(this);
        var $input = $.mobile.activePage.find('.vTr.password input');
        var isShow= $input.is('[type=text]');
        if(!isShow){
            $el.data('hide', false);
            $input.attr('type', 'text');
            $el.text('隐藏');
        } else {
            $el.data('hide', true);
            $input.attr('type', 'password');
            $el.text('显示');
        }
    },validateRegisterForm:function(){
		var $f = $('#register .vForm');
        var $p = $.mobile.activePage;
		var $n = $f.find('.vTr.realname');
//		var type = $p.find('#user_type_select .rItem.sel').attr('data-user-type');
//        type = null;
		var maxLength = 20;
		var isAgreeTerms = $p.find('.termsCtr .vcheck.sel').length > 0;
		var msg;
        if(isAgreeTerms){
            var params = mainJs.parseUrlSearch();
			var password = $.trim($f.find('.vTr.password input').val());
			var realname = $.trim($n.find('input').val());
			var verifyCode = $.trim($f.find('.vTr.verifyCode input').val());
			var tempAccessToken = $.trim(dmJs.sStore.get('tempAccessToken'));
            var accessTokenMobile = dmJs.sStore.get('tempAccessToken_mobile');
            var inputPhone = $.trim($f.find('.vTr.phone input').val());
			var inviterId =  $.trim(params.inviterId);
            var account = $.trim($f.find('.vTr.account input').val());
            var contactRealname = $.trim($f.find('.vTr.contactRealname input').val());
            var isGroup = $("input:radio[name='isGroup']:checked").val();
			if(params.type==2){
                if(!msg && !(/^[a-zA-Z0-9_-]{4,20}$/.test($p.find(".account input").val()))) {
                    msg = "登录用户名必须为4-20位字母、数字或下划线";
                }
                if(!msg){
                    msg = viewJs.validate({name:"公众号", val:realname, must:true, minLength:1});
                }
                if(!msg) {
                    msg = viewJs.validate({name:"联系人姓名", val: contactRealname, must: true, minLength: 1});
                }
            }
            if(!msg){
                msg = viewJs.validate({name:"用户名", val:realname, must:true, minLength:1});
            }
			if(!msg){
				msg = viewJs.validate({name:'验证码', val:verifyCode, must:true});
			}
			if(!msg){
				msg = viewJs.validate({name:'密码', val:password, must:true, minLength:6, maxLength:20});
			}
			if(!msg){
                if(tempAccessToken ==''){
                    msg ="请获取验证码";
                }
			}
            if(!msg){
                if(inputPhone !== accessTokenMobile){
                    msg ="手机号和获取验证码的手机号不符";
                }
            }
		} else {
			msg ="您必须同意《创新学堂使用协议》";
		}

		if(msg){
			viewJs.showPopMsg(msg);
			return;
		}
        var f = {password:password,realname:realname,verifyCode:verifyCode,tempAccessToken:tempAccessToken,type:params.type,isGroup:isGroup};
        //console.log(f)
		if(inviterId != ''){
			f.inviterId = inviterId;
		}
        if(params.type==2){
            f.account = account;
            f.contactRealname = contactRealname;
        }
        f.sourceTag = dmJs.sStore.get('sourceTag')?dmJs.sStore.get('sourceTag'):"";
        f.acTag = dmJs.sStore.get('acTag')?dmJs.sStore.get('acTag'):"";
		return f;
	},createSecurityCode:function(){
        var $p = $.mobile.activePage;
        var tempCode = $p.find(".securityCode > img").data("tempCode");
        $p.find(".securityCode > img").attr("src",mainJs.getApiUrl("/urming_quan/system/getImgVerifyCode")+"?code="+tempCode+"&width=78&height=30&random="+Math.random());
    }
};