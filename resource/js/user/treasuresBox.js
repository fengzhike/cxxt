treasuresBoxJs={
    init:function(){
        var $p = $.mobile.activePage;
        this.toggleEvents(true);
        this.initPage();
        viewJs.setRem($p);
    },initPage:function(){
        var $p = $.mobile.activePage;
        var me = treasuresBoxJs;
        $(".ui-footer").remove();
        var params = mainJs.parseUrlSearch();
        var courseName = '';
        var userName = '';
        $.get(mainJs.getApiUrl('/urming_quan/user/getLearningCard'), {learningCardID:params.learningCardID,secretKey:params.secretKey}, function(data){
            var r = $.parseJSON(data);
            if(r.error){
                var msgs = dmJs.i18n.getMsgs('msg_api');
                viewJs.dialogPop(msgs[r.error_code] || r.error,function(ret){
                    if(ret){
                        me.toIndex();
                    }
                },'提示',{
                    onlyBtnOk:true
                });
                return;
            }else{

                var learningCard = r.learningCard;
                userName =learningCard.user.realname;
                var supportingCourseList = r.supportingCourseList;
                courseName = learningCard.service.serviceVersion.serviceName;

                var supportingCourse = [];
                $.each(supportingCourseList,function(index, item){
                    supportingCourse.push('<li>');
                    supportingCourse.push('<strong class="detial_name">'+item.name+'</strong>');
                    supportingCourse.push('</li>');
                });
                if(learningCard.practiceMoney>0){
                    supportingCourse.push('<li>');
                    supportingCourse.push('<strong class="detial_name">创新创业实践金</strong>');
                    supportingCourse.push('<span class="detial_num">'+learningCard.practiceMoney+'元</span>');
                    supportingCourse.push('</li>');
                }
                //console.log(supportingCourse.length )
                if(supportingCourse.length>0){
                    $p.find(".card_detial").html(supportingCourse.join(""));
                }else {
                    var strNone = '<li>' +
                        '<strong class="detial_name">' +courseName+
                        '</strong>' +
                        '</li>';
                    $p.find(".card_detial").html(strNone)

                }
                $p.find(".header").html(learningCard.service.serviceVersion.serviceName);
                $p.find(".sure").data("serviceID",learningCard.service.id);
                $p.find(".toLearning").data("serviceID",learningCard.service.id);
            }
        }).error(function(){
            //viewJs.showPopMsg('网络错误');
        });
        dmJs._ajax({
            id:'getTempCode',
            url:'/urming_quan/system/getTempCode',
            callback:function(data){
                $p.find(".pic_code").data("tempCode",data.data.code);
                treasuresBoxJs.createSecurityCode();
            }
        });

       if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger"){
            $.get(mainJs.getApiUrl('/urming_quan/user/getWxJsApi'), {url:location.href.split('#')[0],random:Math.random()}, function(data){
                var r = $.parseJSON(data);
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: 'wx3b462eee381207f3', // 必填，公众号的唯一标识
                    timestamp: r.timestamp , // 必填，生成签名的时间戳
                    nonceStr: r.noncestr, // 必填，生成签名的随机串
                    signature: r.signature,// 必填，签名，见附录1
                    jsApiList: ['onMenuShareAppMessage','onMenuShareTimeline'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
                wx.ready(function(){
                    wx.onMenuShareAppMessage({
                        title:'这是您的学习证，请您即刻领取，注意保密哦~~', // 分享标题
                        desc: '课程名称：《'+ courseName +'》\n 开课机构：'+ userName, // 分享描述
                        link: 'http://m.edu.euming.com/treasuresBox.html?learningCardID='+params.learningCardID+'&secretKey='+params.secretKey, // 分享链接
                        imgUrl: 'http://m.edu.euming.com/resource/images/learningCard/share.png', // 分享图标
                        type: 'link', // 分享类型,music、video或link，不填默认为link
                        dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                        success: function () {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function () {
                            // 用户取消分享后执行的回调函数
                        }
                    });
                    wx.onMenuShareTimeline({
                        title: '这是您的《'+ courseName +'》课程学习证，请您领取', // 分享标题
                        link: 'http://m.edu.euming.com/treasuresBox.html?learningCardID='+params.learningCardID+'&secretKey='+params.secretKey, // 分享链接
                        imgUrl: 'http://m.edu.euming.com/resource/images/learningCard/share.png', // 分享图标
                        success: function () {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function () {
                            // 用户取消分享后执行的回调函数
                        }
                    });
                    wx.error(function(res){
                        //alert(res);
                        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                    });
                });
            }).error(function(){
                viewJs.showPopMsg('网络错误');
            });
        }
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = treasuresBoxJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.mess_sumit', 'vclick', me.submit);
                //$p.delegate('', 'vclick', me.learningCardExplain);
                $p.delegate('.phone_code:not(.busy)', 'vclick', me.getVerifyCode);
                $p.delegate('.pic_code', 'vclick', me.createSecurityCode);
                $p.delegate('[data-format]', 'input', viewJs.validInput);
                $p.delegate('.sure', 'vclick', me.toCourse);
                $p.delegate('.toLearning', 'vclick',function(){
                    var user = dmJs.sStore.getUserInfo();
                    if (user == null){
                        window.parent.dmJs.sStore.toLogin({url:'./course.html', options: {data: {serviceID:$p.find(".toLearning").data("serviceID")}}});
                    }else{
                        me.learnCourse();
                    }
                });
            }, 500);
        }
    },getVerifyCode:function(){
        var $p = $.mobile.activePage;
        var mobile = $p.find('.mobile').val();
        var verifyCode = $p.find('.code_p').val();
        var tempCode = $p.find(".pic_code").data("tempCode");
        mobile = $.trim(mobile);
        if(mobile == ''){
            return;
        }
        dmJs.getVerifyCode({mobile:mobile,verifyCode:verifyCode,tempCode:tempCode}, function(data){
            dmJs.sStore.save('tempAccessToken', data.tempAccessToken);
            dmJs.sStore.save('tempAccessToken_mobile', mobile);
            $p.find('.phone_code').css('backgroundColor:#a1a1a1','color:#636363')
            viewJs.setClock($p.find('.phone_code'), {html:'({0})重新获取', time:60});
            viewJs.showPopMsg('验证码已发送');
        });
        dmJs._ajax({id:'validateMobile',method:'POST',params:{mobile:mobile},url:'/urming_quan/user/validateMobile',
            callback:function(data){
                if(!data.exsit){
                    $p.find('.password').show();
                    $('.mess_sumit').css('background-image','resource./images/getLessonCard/getNow.png ');
                }
            }
        });
    },submit:function(){
        var $p = $.mobile.activePage;
        var me = treasuresBoxJs;
        var params = mainJs.parseUrlSearch();
        var verifyCode = $p.find(".code_m").val();
        var tempAccessToken = $.trim(dmJs.sStore.get('tempAccessToken'));
        var accessTokenMobile = dmJs.sStore.get('tempAccessToken_mobile');
        var msg;
        if(tempAccessToken ==''){
            msg ="请获取验证码";
        }
        if(!msg){
            if(verifyCode ==''){
                msg ="请输入验证码";
            }
        }
        if(!msg && $p.find('.password input').is(':visible')){
            var password = $p.find('.password input').val();
            msg = viewJs.validate({name:'密码', val:password, must:true, minLength:6, maxLength:20});
            params.password = password;
        }
        if(msg){
            viewJs.showPopMsg(msg);
            return;
        }
        $('.spinner').show();
        $('#maskLoadingMore').show();
        params.tempAccessToken = tempAccessToken;
        params.verifyCode = verifyCode;
        $.get(mainJs.getApiUrl('/urming_quan/user/receiveTreasuresBoxByMobile'), params, function(data){
            var r = $.parseJSON(data);
            var status = r.status;
            $('.spinner').hide();
            $('#maskLoadingMore').hide();
            if (status == 'suc'){
                dmJs.sStore.saveLoginInfo(r);
                viewJs.afterToggleLogin();
                $('.success_blank').show();
                return;
            }else{
                var msgs = dmJs.i18n.getMsgs('msg_api');
                if(r.error_code == 20705){
                    /*
                    viewJs.dialogPop('您已领取过该听课证，请登录创新学堂查看',function(ret){
                        if(ret){
                            me.toCourse();
                        }
                    },'提示',{
                        onlyBtnOk:true
                    })
                    */
                    $('.reland_blank').show();
                }else{
                    viewJs.dialogPop(msgs[r.error_code] || r.error,function(ret){
                        if(ret){
                            if(r.error_code != 20125 && r.error_code != 20126){
                                me.toCourse();
                            }
                        }
                    },'提示',{
                        onlyBtnOk:true
                    })
                }
            }
        }).error(function(){
            viewJs.showPopMsg('网络错误');
        });
    },createSecurityCode:function(){
        var $p = $.mobile.activePage;
        var tempCode = $p.find(".pic_code").data("tempCode");
        $p.find(".pic_code").css("background-image","url("+mainJs.getApiUrl("/urming_quan/system/getImgVerifyCode")+"?code="+tempCode+"&width=78&height=30&random="+Math.random()+")");
    },learningCardExplain:function() {
        viewJs.navigator.next({
            next: {
                url: "./learningCardExplain.html",
                id: "learningCardExplain",
                options: {data: mainJs.parseUrlSearch()}
            }, last: {
                url: './treasuresBox.html', id: 'treasuresBox',
                options: {data: mainJs.parseUrlSearch()}
            }
        });
    },toIndex:function() {
        viewJs.navigator.next({next:{url:'./', id:'startpage'}});
    },toCourse:function() {
        var $p = $.mobile.activePage;
        viewJs.navigator.next({next:{url:'./course.html', id:'course',options: {data: {serviceID:$p.find(".sure").data("serviceID")}}}});
    },learnCourse:function() {
        var $p = $.mobile.activePage;
        viewJs.navigator.next({next:{url:'./course.html', id:'course',options: {data: {serviceID:$p.find(".toLearning").data("serviceID")}}}});
    }
};
