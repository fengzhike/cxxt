/**
 * Created by fsk on 2016/3/17.
 */
var myLessonsJs = {
    _data:null,
    offset:0,
    onOff:true,
    init: function () {
        $('#responseCtr').hide();
        var params = this.preInit();
        if (!params) {
            return;
        }
        this.resetData(true);
        var $p = $.mobile.activePage;
        this.setRem();

        $p.find('.instant-service').hide();
        $p.find('.instant-service.ui-btn').addClass('disable').removeClass('enable');
        this.loadData(params);
        this.toggleEvents(true);
        if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
            $("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
            '<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
        }
    },setRem:function(){
        var $p = $.mobile.activePage;
        oHtml = $p.parent().parent()[0];
        var iWidth=document.documentElement.clientWidth;
        iWidth=iWidth>600?480:iWidth;
        oHtml.style.fontSize = iWidth/16+"px";
    },resetData:function(bInit){
        var me = myLessonsJs;
        if(bInit) {
            me._data = {};
        } else {
            me._data = null;
        }
    },toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = myLessonsJs;
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
                $p.delegate('.ui-mini', 'vclick', me.response);
                $p.delegate('.pick', 'vclick', me.pick);
                $p.delegate('.review', 'vclick', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                   // serviceOwnID=25480&type=1&serviceName=经典传习&serviceID=18228&catId=4
                    var param = {
                        serviceOwnID:$(this).attr('serviceOwnID'),
                        type:$(this).attr('type'),
                        serviceName:$(this).attr('serviceName'),
                        serviceID:$(this).attr('serviceID'),
                        catId:$(this).attr('catId')
                    }
                    var next={};
                    next = {
                        url:'./addReview.html', id:'addReview',
                        options:{
                            data:param
                        }
                    };
                    viewJs.navigator.next({
                        next:next,
                        last:{id:'myLessons',url:'./myLessons.html',options:{data:{catId:1}}}
                    });


                });
                $p.delegate('.courseBtn,.add-course', 'vclick', function(){
                    var params = {},
                        next={};
                    next = {
                        id: 'courseTypes',
                        url: './courseTypes.html'
                    }
                    viewJs.navigator.next({next:next,lastAuto:true});
                });
                $p.delegate('.tabHeader .header','vclick',function(){
                    var tabn = $(this).attr('tabi')

                    if(tabn ==1){
                        window.location.search = '?catId=1';
                    }else{
                        window.location.search = '?catId=2';
                    }
                });
                $p.delegate('.tabContent li','vclick',function(){
                    var accessToken = dmJs.getAccessToken();
                    var params = {};
                    //params.accessToken = accessToken;
                    params.serviceID = $(this).attr('data-service-id');
                    viewJs.navigator.next({
                        next: {url: './course.html', id: 'course', options:{data:params}},
                        lastAuto: true
                    });
                })

            }, 500);
        }
    },doStoreSvr:function(){
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
        var me = myLessonsJs;
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
        var params ={}//
        params = mainJs.parseUrlSearch();
        !params.catId && (params.catId =1);
        /*if ($.trim(params.wantID).length <= 0) {
            viewJs.showApiError({error_code: '20503'});
            return;
        }*/
        var accessToken = dmJs.getAccessToken();
        if(accessToken){
            params.accessToken = accessToken;
        };
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
    },tab:function(cat1,cat2){
        //window.location.search
        //
        $('.tabHeader .'+cat1).addClass('current');
        $('.tabHeader .'+cat2).removeClass('current');
        $('.tabContent .'+cat1).show();
        $('.tabContent .'+cat2).hide();
    }, initWantDetails: function (data,bOk) {
        var htls = $('#coursr_detial').html();
        var me = myLessonsJs;
        // 需求详情页面
        var  $p = $.mobile.activePage;
        if(bOk){
            var arrData = data.datas;
            var total = data.total;
            var l = arrData.length;
            var arrState ={
                '-1':'未知',
                '0':'未开课',
                '1':'学习中',
                '2':'已完成'
            }
            var htl = '';
            if(l>0){
                htl =[ '<ul>'];
                var item,info={};
                for(var i=0;i<l;i++){
                    item = arrData[i];
                    console.log(item)
                    info.sex = viewJs.setSexMarkCls(item);
                    info.img = mainJs.getCoursPicUrl({url:item.picUrl,size:2});
                    info.lessonName = item.serviceName;
                    info.courseStatus = item.courseStatus;
                    info.courseStatusText = arrState[item.courseStatus];
                    if(item.nextChapterTime){
                        info.courseStatusText = '下章时间： '+ item.nextChapterTime;
                       // console.log(info.courseStatusText)
                    }

                    info.serviceId = item.serviceID;

                    info.completeRate = (item.completeRate*100).toFixed(1);

                    //console.log(info.completeRate)
                    info.leftChapter = item.leftChapter;
                    info.status = item.status;
                    //info.img =  mainJs.getProfilePicUrl({url:item[i].serviceVersion.picUrl});
                    htl+='<li data-service-id = '+ info.serviceId +'>\
                    <div class="course_img">\
                        <img src="'+ info.img +'" alt="课程"/>\
                    </div>\
                    <div class="course_dail">\
                        <h2> '+ info.lessonName +'</h2>\
                        <div class="pro-wrap"><i style ="width:'+info.completeRate+'px" class="pro-con"></i>\
                        <time>'+info.completeRate+'%</time></div>\
                        <span>'+info.courseStatusText+'</span>\
                    </div>\
                    <div class="course_buy_type ">';
                    if(info.leftChapter){
                        htl+='<strong class="left-chapter">剩余'+ info.leftChapter +'章</strong>';
                    }else{
                        htl+='<strong class="left-chapter">  </strong>';
                    }
                    //console.log(info.completeRate)
                   /* var parmasReview = {
                        serviceOwnID:item.id,
                        type:item.courseType,
                        serviceName:info.lessonName,
                        serviceID:info.serviceId,
                        catId:3
                    }*/
                    if(info.courseStatus ==2  ) {
                        if(info.status == 7){
                            htl += '<strong class="btn4 ui-corner-all review" serviceID='+info.serviceId +' catId="3" serviceName='+info.lessonName +'  serviceOwnID='+item.id+' type = "1">评价</strong>';
                        }else{
                            htl += '<strong class="ready">已评价</strong>';
                        }
                    }
                    htl+= '</div></li>';
                };
                htl+='</ul>';
                var html = [];
                var paperTpl = $p.find('#paper_tpl').html();
                if(l > 10){
                    var _PAGE_SIZE = mainJs.PAGE_SIZE;
                    var pageInfo = {};
                    pageInfo.hasPre = me.offset > 0 ? '' : 'disabled';
                    pageInfo.hasNext = (me.offset+_PAGE_SIZE) < total ? '' : 'disabled';
                    var pageCurrent = Math.ceil(me.offset/_PAGE_SIZE+0.1);
                    pageInfo.pagePre = pageCurrent-1;
                    pageInfo.pageNext = pageCurrent+1;
                    pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
                    html.push(viewJs.applyTpl(paperTpl, pageInfo));
                }

                $p.find('.tabContent .tab1').html(htl);
                $p.find(".tabContent .tab1").append(html.join(''));
            }else {
                htl = '<div class="not_found_container font-gray" style="display: block">' +
                '<div class="not-found-icon no-course"></div>' +
                '<div class="not_found_tip toCourseSelect">您还未添加任何课程 快去选课学习吧</div>' +
                '<div class = "courseBtn">去选课</div>'+
                '</div>';
                $p.find(".tabContent .tab1").html(htl);
            }

        }else{
            var arrData = data.datas;
            var total = data.total;
            var l = arrData.length;
            var htl = '';
            var classArr = [
                {pass_status:'待审核',typeClass:'wait'},
                {pass_status:'审核通过',pass_deal:'购买',typeClass:'pass'},
                {pass_status:'已拒绝',pass_deal:'重新报名',typeClass:'reject'},
                {pass_status:'',pass_deal:'已购买',typeClass:'pass'}

            ];
            if(l>0){
                htl =[ '<ul>'];
                var item,info={};
                for(var i=0;i<l;i++){
                    item = arrData[i];
                    info.sex = viewJs.setSexMarkCls(item);
                    info.img =mainJs.getCoursPicUrl({url:item.img,size:2});
                    info.lessonName = item.name;
                    info.price =  item.realname;
                    info.status = item.status-1;
                    info.serviceId = item.id;
                    //info.img =  mainJs.getProfilePicUrl({url:item[i].serviceVersion.picUrl});
                    htl+='<li data-service-id = '+ info.serviceId +'>\
                    <div class="course_img">\
                        <img src="'+ info.img +'" alt="课程"/>\
                    </div>\
                    <div class="course_dail">\
                        <h2> '+ info.lessonName +'</h2>\
                        <span>'+ info.price +'</span>\
                    </div>\
                    <div class="course_buy_type '+ classArr[info.status].typeClass +'">';
                        if(info.status !=4  ) {
                            htl += '<strong class="pass_status">' + classArr[info.status].pass_status + '</strong>';
                        }
                            htl+='<strong class="pass_deal">'+ classArr[info.status].pass_deal +'</strong>\
                    </div>\
                    </li>';
                };
                htl+='</ul>';
                var html = [];
                var paperTpl = $p.find('#paper_tpl').html();
                if(l > 0){
                    var _PAGE_SIZE = mainJs.PAGE_SIZE;
                    var pageInfo = {};
                    pageInfo.hasPre = me.offset > 0 ? '' : 'disabled';
                    pageInfo.hasNext = (me.offset+_PAGE_SIZE) < total ? '' : 'disabled';
                    var pageCurrent = Math.ceil(me.offset/_PAGE_SIZE+0.1);
                    pageInfo.pagePre = pageCurrent-1;
                    pageInfo.pageNext = pageCurrent+1;
                    pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
                    html.push(viewJs.applyTpl(paperTpl, pageInfo));
                }
                $p.find('.tabContent .tab2').html(htl);
                $p.find(".tabContent .tab2").append(html.join(''));
            }else {
                htl = '<div class="not_found_container font-gray" style="display: block">' +
                '<div class="not-found-icon no-course"></div>' +
                '<div class="not_found_tip toCourseSelect">您还未添加任何课程 快去选课学习吧</div>' +
                '<div class = "courseBtn">去选课</div>'+
                '</div>';
                $p.find(".tabContent .tab2").html(htl);
            }
        }


        //var html = [];
        /*if(data.serviceOwns.length > 0){
            var total = want.responseNumber;
            var _PAGE_SIZE = 20;
            var pageInfo = {};
            pageInfo.hasPre = myLessonsJs.offset > 0 ? '' : 'disabled';
            pageInfo.hasNext = (myLessonsJs.offset+_PAGE_SIZE) < total ? '' : 'disabled';
            var pageCurrent = Math.ceil(myLessonsJs.offset/_PAGE_SIZE+0.1);
            pageInfo.pagePre = pageCurrent-1;
            pageInfo.pageNext = pageCurrent+1;
            pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
            html.push(viewJs.applyTpl($('#paper_tpl').html(), pageInfo));
        }
        $p.find('#answer').append(html.join(''));*/
    }, typesetting: function (str) {
        if (str == null) {
            return '';
        }
        return '&nbsp;&nbsp;&nbsp;' + (str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
    }, loadData: function (params) {
        var me = myLessonsJs;
        // 需求详情
        //alert(2)
        params.offset=myLessonsJs.offset;
        params.pageSize=20;
        params.parentCategoryId = 3;
        if(params.catId ==1  ){
            me.tab('tab1','tab2')
            dmJs._ajax({id: 'getMyCourseList', params: params, url: '/urming_quan/service/getMyCourseList', callback:function(data){
                me.initWantDetails(data,true)
            }});
        }else if(params.catId ==2){
            me.tab('tab2','tab1')
            dmJs._ajax({id: 'getMyEnteredCourse', params: params, url: '/urming_quan/service/getMyEnteredCourse', callback: function(data){
                me.initWantDetails(data,false)
            }});
        }

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
        var info = {};
        info.id = item.id;
        info.answerDesc = myLessonsJs.typesetting(item.serviceDesc);
        info.realname = item.realName;
        info.creTime = item.creTime;
        info.serviceID = item.id;
        info.serviceVersionID = item.serviceVersionId;
        info.mark = '';
        info.answerPic = '';
        if(item.isBest==1){
            info.mark = '最佳答案';
        }
        var picUrl = item.picUrl;
        if(picUrl!=undefined && picUrl!=''){
            picUrl = picUrl.split(',');
            if(picUrl.length > 0){
                $.each(picUrl, function(index, item){
                    info.answerPic+='<img class="camera-thumbnails" src="'+mainJs.getSvrPicUrl({url:item,size:2})+'"/>';
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
            myLessonsJs.offset = ($(this).attr('data-page-num')-1)*20;
            myLessonsJs.loadData(myLessonsJs.preInit());
        }
    },response:function(){
        var  $p = $.mobile.activePage;
        var params = mainJs.parseUrlSearch();
        var user;
        if(!(user = viewJs.chkLogin())){
            return;
        }
        if($p.find('#svr_name_ctr > a').html()=='回答'){
            params.catId = 6;
            viewJs.navigator.next({next:{url:'./addAnswer.html',id:'addAnswer',options:{data:params}},lastAuto:true});
        }else if($p.find('#svr_name_ctr > a').html()=='编辑'){
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
                params.price = $p.find('.question-price > span').html();
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