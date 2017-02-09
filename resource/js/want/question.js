var questionJs = {
    _data:null,
    offset:0,
    init: function () {
        $('#responseCtr').hide();
        var params = this.preInit();
        if (!params) {
            return;
        }
        this.resetData(true);
        var $p = $.mobile.activePage;
        $p.find('.instant-service').hide();
        $p.find('.instant-service.ui-btn').addClass('disable').removeClass('enable');
        this.loadData(params);
        this.toggleEvents(true);
        if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
            $("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
                '<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
        }
        //viewJs.setRem($p);
    },resetData:function(bInit){
        var me = questionJs;
        if(bInit) {
            me._data = {};
        } else {
            me._data = null;
        }
    },toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = questionJs;
        $p.undelegate();
        if (isBind) {
            $p.one('pagebeforehide', function () {
                me.toggleEvents();
                //viewJs.toggleParentShow(true);
                me.resetData();
            });
            setTimeout(function () {
                me.toggleEvents();
                $p.delegate('.u', 'vclick', me.toUserPage);
                $p.delegate('.reportBt', 'vclick', me.fReport);
                $p.delegate('.instant-service.ui-btn.enable', 'vclick', me.instantService);
                $p.delegate('.btn-store','vclick', me.doStoreSvr);
                $p.delegate('[action]', 'vclick', me.pageNav);
                $p.delegate('.doAnswer', 'vclick', me.response);
                $p.delegate('.pick', 'vclick', me.pick);
               /* $p.delegate('.camera-thumbnails','vclick',function(){
                    me.creatBigImg(this.src)
                })
                $p.delegate('.imgBigBox','vclick',function(){
                    var _this = this;
                    setTimeout(function(){
                        $(_this).remove();
                    },100)
                })*/
                $p.delegate('.wInfo.sec2 .camera-thumbnails', 'vclick', function(){
                    var arrImgSrc = [];
                    $('.wInfo.sec2 .camera-thumbnails').each(function(i,item){
                        var arrTemp = $(item).attr('src').split('@');
                        arrTemp[1] = '480w';
                        arrImgSrc[i] = arrTemp.join('@');
                    })
                    me.showOringeImg(arrImgSrc);
                });
                $p.delegate('.answer-items .camera-thumbnails', 'vclick', function(){
                    var arrImgSrc = [];
                    $(this).parent().parent().parent().find('.camera-thumbnails').each(function(i,item){
                        var arrTemp = $(item).attr('src').split('@');
                        arrTemp[1] = '480w';
                        arrImgSrc[i] = arrTemp.join('@');
                    })
                    setTimeout(function(){
                        me.showOringeImg(arrImgSrc);
                    },100)

                });
                $p.delegate('.disapear', 'vclick',function(){
                    setTimeout(function(){
                        $('#showOringeImg_box').remove();
                    },200)
                });
            }, 500);
        }
    },showOringeImg:function(oriImgArr){
        var $p = $.mobile.activePage;
        var iw = $p.find('.ui-content').outerWidth()+'px';
        //console.log(oriImgArr)
        var htl = '<div id="showOringeImg_box">' +
            '<div class="show_header">' +
            '<span class="disapear">&lt;</span>' +
            '<b class="progress">1/'+oriImgArr.length+'</b>'+
            '</div>';

        htl+='<div class="show_content"> ';
        for(var i=0; i< oriImgArr.length;i++){
            //console.log(iL)
            if(i == 0){
                var iL = 0;
            }else{
                var iL = iw;

            }
            htl+='<img src =' +oriImgArr[i]+' class = "show_pic11" style =" left : '+ iL+' " />';
        }

        htl+= '</div></div>';
        $('.wInfo.sec1').append($(htl));

        var numPic=0;
        $p.find('.show_pic11').on( 'swipeleft',function(){
            swipe('left');
        });
        $p.find('.show_pic11').on( 'swiperight',function(){
            swipe('right');
        });
        function swipe(direction){
            var me = questionJs;
            direction = direction? direction:'left';
            var iw = $p.find('.ui-content').outerWidth();
            if(direction =='left'){
                numPic ++;
                if(numPic>oriImgArr.length-1) numPic = oriImgArr.length-1;
                $('.show_pic11').eq(numPic-1).css('left',-iw);
                $('.show_pic11').eq(numPic).css('left','0');
            }else{
                numPic --;
                if(numPic<0 ) numPic = 0;
                $('.show_pic11').eq(numPic+1).css('left',iw);
                $('.show_pic11').eq(numPic).css('left','0');
            }
            $('.progress').html((numPic+1)+'/'+oriImgArr.length)
        }
        $p.find('#showOringeImg_box').on('vmousemove',function(e){
            e.preventDefault()
        });
        $('#showOringeImg_box').css('top', $(document).scrollTop()-44);

},creatBigImg:function(imgSrc){
        var arrImg = imgSrc.split('@')
        arrImg[1] = '480w';
        newSrc = arrImg.join('@');
        var str = '<div class="imgBigBox"> ' +
                '<img src ='+imgSrc+'/>'
            '</div>';
        setTimeout(function(){
            $('div.ui-content').append($(str));
        },200)


    }, doStoreSvr:function(){
        var _self = arguments.callee;
        // if(_self.busy){
            // return;
        // }
        _self.busy = true;
        var $el = $(this);
        var bCancel = $el.is('.cancel');
        var accessToken = dmJs.getAccessToken();
        var wantID = mainJs.parseUrlSearch().wantID;
        if(accessToken == null){
            if(wantID != null){
                dmJs.sStore.toLogin({href:'./want.html', options:{data:{wantID:wantID}}});
            } else {
                dmJs.sStore.toLogin();
            }
            _self.busy = false;
    } else {
        var params = {wantID:wantID};
        params.accessToken = accessToken;
        dmJs._ajax({
            id:'store',
            params:params,
            url:'/urming_quan/want/'+(bCancel ? 'removeStore': 'store'),
            callback:function(){
                $el.toggleClass('cancel');
                $('#storeResult').html(bCancel ? '取消收藏成功' : '收藏成功').show().delay(3000).hide(1);
                _self.busy = false;
            },error:function(){
                _self.busy = false;
            }
        });
    }
}, toUserPage: function () {
        var $el = $(this);
        var userID = $.trim($el.attr('data-userID'));
        viewJs.navigator.next(
            {
                next: {url: './u.html', id: 'u', options: {data: {userId: userID}}},
                lastAuto: true
            });
    }, instantService: function () {
        var me = questionJs;
        var $el = $(this);
        var $p = $.mobile.activePage;
        var username = $el.data('username');
        var wantID =  $el.data('wantID');
        if (!dmJs.hasLogin()) {
            dmJs.sStore.toLogin({url: './want.html', id: 'want', options: {data: {wantID: wantID}}});
            return;
        }
        $el.hide();
        var tn = dmJs.getAccessToken();
        dmJs._ajax({
            id:'store',
            params:{accessToken:tn,wantID:wantID},
            url:'/urming_quan/want/respondWant',
            callback:function(){
                viewJs.showPopMsg('感谢您的参与,响应信息已经发送给'+username);
               var responseNumber =  me._data.responseNumber;
               var responseUsers =  me._data.responseUsers;
                var user = dmJs.sStore.getUserInfo().user;
                $.each(responseUsers, function(index, item){
                    if(item.id == user.id){
                        user = null;
                        return false;
                    }
                });
                if(user){
                    responseNumber ++;
                    responseUsers.push({id:user.id,profileImageUrl:user.profileImageUrl});
                    me.setRespondUser(responseNumber,responseUsers);
                }
            },error:function(){
                $el.show();
            }
        });

    }, setupInstantService: function (want) {
        var $p = $.mobile.activePage;
        var btn = $p.find('.instant-service.ui-btn').data('wantID', want.id).data('username', want.user.realname);
        var loginUser = dmJs.sStore.getUserInfo();
        if (loginUser != null && want.user.id == loginUser.user.id) {
            btn.addClass('disable').removeClass('enable');
        } else {
            btn.removeClass('disable').addClass('enable');
        }
    }, fReport: function () {
        var initParam = mainJs.parseUrlSearch();
        viewJs.navigator.next({
            next: {url: './report.html', id: 'report',
                options: {
                    data: initParam
                }},
            lastAuto: true
        });
    },
    preInit: function () {
        var params = mainJs.parseUrlSearch();
        if ($.trim(params.wantID).length <= 0) {
            viewJs.showApiError({error_code: '20503'});
            return;
        }
        var accessToken = dmJs.getAccessToken();
        if(accessToken){
            params.accessToken = accessToken;
        }
        return params;
    },setRespondUser:function(responseNumber,responseUsers){
        if(!(responseNumber > 0)){
            return;
        }
        $('#responseCtr-num').html(responseNumber);
        var resUsers = [];
        responseUsers =  responseUsers.slice(0,30);
        $.each(responseUsers, function(index, user){
            var img = mainJs.getProfilePicUrl({url: user.profileImageUrl, sex: user.sex});
            resUsers.push([
                '<a class="u" data-userID="',user.id,'">',
                '<img src="',img,'">',
                '</a>'
            ].join(''));
        });
        $('#responseCtr-users').html(resUsers.join(''));
        $('#responseCtr').show();
    }, initWantDetails: function (data) {
        var me = questionJs;
        // 需求详情页面
        var  $p = $.mobile.activePage;

        var want = data.want;
        var responseNumber = want.responseNumber;
        var responseUsers = data.responseUsers || [];
        me._data.responseNumber = responseNumber;
        me._data.responseUsers = responseUsers;

        var categoryId = want.category.id;
        var wantName = want.wantName;
        var wantDesc = want.wantDesc;
        var price = want.price;
        var user = want.user;
        var store = data.store;
        document.title = wantName;
		var catId = want.category.category.id;
		var preTitle = "需求";
		if(catId==5){
			preTitle = "问题";
		}
		$p.find('.prePageTitle').html(preTitle);
        var $store = $('.btn-store');
        if(store != 0){
            $store.addClass('cancel');
        } else {
            $store.removeClass('cancel');
        }
        me.setRespondUser(responseNumber, responseUsers);
        dmJs.findCatById(categoryId, function (cat) {

            //$p.find('.ct').empty();
            // 需求
            //console.log(user)
            $p.find('#svrName').html(wantName);
            $p.find('.question_tag').html(cat.categoryName);
            $p.find('.user-info .userName').html(user.realname);
            $p.find('.price').html('<SMALL>￥</SMALL><span>'+price+'</span>');
            $p.find('.question-creTime').html(want.creTime);
            $p.find('.question_time').html(viewJs.parseTime(want.creTime) );
            $p.find('.question_r_num').html(want.responseNumber+'人回答');
            $p.find('.user-info > img').attr('src',mainJs.getProfilePicUrl({url:user.profileImageUrl}));

            var questionPic = '<div>';
            var picUrl = want.picUrls;
            if(picUrl!=undefined && picUrl!=''){
                picUrl = picUrl.split(',');
                if(picUrl.length > 0){
                    (picUrl.length>9) && (picUrl.length = 9);
                    $.each(picUrl, function(index, item){
                        questionPic+='<div class="camera-box"> <img class="camera-thumbnails" src="'+mainJs.getSvrPicUrl({url:item,size:2})+'"/></div>';
                    });
                }
            }
            questionPic += '</div>';
            // 需求描述
            $p.find('.sec2 .ct').html(me.typesetting(wantDesc)+questionPic);
            // 需求方
            var profileImageUrl = mainJs.getProfilePicUrl({url: user.profileImageUrl, sex: user.sex});
            var userType = user.type;
            var isMoneyGuaranteed = user.isMoneyGuaranteed;
            var isIdcardValidated = user.isIdcardValidated;
            var userTags = user.userTags;
            var realname = user.realname;
            var sex = viewJs.setSexMarkCls(user);
            var userType = user.type;
            var userTags = user.userTags;
            var tagHtmls = [];
            var contactPhone = user.contactPhone;
        
            // 联系人脚
            var $f = $p.find('.svrUserFooter');

            me.initConcatFooter($f, realname, contactPhone);
            me.setupInstantService(want);
        });
        var opt={
            dataKey:'services',
            paperTpl:'',
            $content:$('#answer'),
            offset:0
        }
        opt.itemParser = me.formatAnswerItem;
        opt.tpl = $('#answer_item_tpl').html();
        opt.not_found = true;
        viewJs.parseList(data, opt);

        if(data.isSelf!=1){
            $p.find('.pick').hide();
            $p.find('.doAnswer').html("回答");
        }else{
            if(want.status==3){
                $p.find('.pick').hide();
            }
            if(want.responseNumber!=undefined && want.responseNumber!=0){
                $p.find('.doAnswer').hide();
                $p.find('.footer-bar').css('margin-bottom','0');

            }else{
                $p.find('.doAnswer').attr('self','').html("编辑");
            }
        }

        var html = [];
        if(data.services.length > 0){
            var total = want.responseNumber;
            var _PAGE_SIZE = 20;
            var pageInfo = {};
            pageInfo.hasPre = questionJs.offset > 0 ? '' : 'disabled';
            pageInfo.hasNext = (questionJs.offset+_PAGE_SIZE) < total ? '' : 'disabled';
            var pageCurrent = Math.ceil(questionJs.offset/_PAGE_SIZE+0.1);
            pageInfo.pagePre = pageCurrent-1;
            pageInfo.pageNext = pageCurrent+1;
            pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
            html.push(viewJs.applyTpl($('#paper_tpl').html(), pageInfo));
        }
        $p.find('#answer').append(html.join(''));
    }, typesetting: function (str) {
        if (str == null) {
            return '';
        }
        return (str.replace(/\n/g, '<br/>&nbsp;&nbsp;&nbsp;'));
    }, loadData: function (params) {
        // 需求详情
        params.offset=questionJs.offset;
        params.pageSize=20;
        dmJs._ajax({id: 'getUserWants', params: params, url: '/urming_quan/want/getQuestionDetail', callback: this.initWantDetails});
    }, initConcatFooter: function ($f, realname, contactPhone) {
        if(true){//!dmJs.hasLogin()
            $f.hide();
            return;
        } else {
            $f.show();
        }
        var dispPhone = $.trim(contactPhone);
        dispPhone = dispPhone.substring(0, dispPhone.length-4)+'****';
        var info = {realname:realname,contactPhone:dispPhone};
        if(dmJs.isAndroid){
            info.phoneScheme = "wtai://wp/mc;"+contactPhone;
        } else{
            info.phoneScheme = "callto:"+contactPhone;
        }
        var tpl = $('#contract_footer_tpl').html();
        $f.html(viewJs.applyTpl(tpl, info));
        setTimeout(function(){
            $f.find('.usePhone').css('display', 'inline-block');
        },500);
        return;
    },formatAnswerItem:function(item, opt){
        //alert(21)
        var info = {};
        info.id = item.id;
        info.answerDesc = questionJs.typesetting(item.serviceDesc);
        info.realname = item.realName;
        info.creTime =viewJs.parseTime(item.creTime) ;
        info.serviceID = item.id;
        info.serviceVersionID = item.serviceVersionId;
        info.mark = '';
        info.answerPic = '';
        info.profileImageUrl = mainJs.getProfilePicUrl({url:item.profileImageUrl,sex:item.sex})
        if(item.isBest==1){
            info.mark = '最佳答案';
            info.isShow = 'block';
        }else{
            info.isShow = 'none';
        }
        var picUrl = item.picUrl;
        if(picUrl!=undefined && picUrl!=''){
            picUrl = picUrl.split(',');
            if(picUrl.length > 0){
                $.each(picUrl, function(index, item){

                    info.answerPic+='<div class="camera-box"> <img class="camera-thumbnails" src="'+mainJs.getSvrPicUrl({url:item,size:2})+'"/></div>';
                });
            }
        }
        return info;
    },pageNav:function(e){
        if($(this).is('.disabled')){
            return;
        }
        var sAction = $.trim($(this).attr('action'));
        if(sAction == "pageNav"){
            questionJs.offset = ($(this).attr('data-page-num')-1)*20;
            questionJs.loadData(questionJs.preInit());
        }
    },response:function(){
        var  $p = $.mobile.activePage;
        var params = mainJs.parseUrlSearch();
        var user;
        if(!(user = viewJs.chkLogin())){
            return;
        }
        //console.log($(this).html())
        if($(this).html().trim()=='回答'){
            params.catId = 6;
            viewJs.navigator.next({next:{url:'./addAnswer.html',id:'addAnswer',options:{data:params}},lastAuto:true});
        }else if($(this).html().trim()=='编辑'){
            params.catId = 5;
            viewJs.navigator.next({next:{url:'./addQuestion.html',id:'addQuestion',options:{data:params}},lastAuto:true});
        }
    },pick:function(){
        var  $p = $.mobile.activePage;
        var currentUser = dmJs.sStore.getUserInfo();
        var params = {buyNumber:1,serviceVersionID:$(this).data("serviceversionid"),serviceID:$(this).data("serviceid")};
        params.accessToken = currentUser.accessToken;
        var currentParams = mainJs.parseUrlSearch();
        var $c = $(this);
        dmJs._ajax({
            id:'order',
            url:'/urming_quan/service/order',
            params:params,
            accessInvalid:function(){
                dmJs.sStore.toLogin({url:'./question.html',id:'question',options:{data:currentParams}});
            },callback:function(data){
                params.serviceCartID = data.serviceCartID;
                params.accessToken = '';
                params.catId = '6';
                params.serviceName = $p.find('#svrName').html();
                params.price = $p.find('.price > span').html();
                if(params.price==0 || params.price=="0"){
                    dmJs._ajax({
                        id:'buySuc',
                        url:'/urming_quan/service/buySuc',
                        params:{accessToken:currentUser.accessToken, serviceCartID:params.serviceCartID},
                        accessInvalid:function(){
                            dmJs.sStore.toLogin({url:'./question.html',id:'question',options:{data:currentParams}});
                        },callback:function(){
                            viewJs.dialogPop('打赏成功', null, null, {onlyBtnOk:true});
                            $p.find('.pick').hide();
                            $c.prev().html("最佳答案");
                        }
                    });
                }else{
                    //hw
                    if(typeof WeixinJSBridge != "undefined"){//weixin
                        window.location.href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3b462eee381207f3&redirect_uri=http%3A%2F%2Fm.edu.euming.com%2FconfirmOrder.html%3F'+escape($.param(params))+'&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
                        return;
                    }
                    //hw
                    viewJs.navigator.next({
                        next:{
                            url:'./confirmOrder.html',
                            id:'confirmOrder',
                            options:{data:params}
                        },lastAuto:true
                    });
                }
            }
        });
    }
};