var signupJs = {
    _data:null,
    offset:0,
    _datas:null,
    init: function () {
        var params = this.preInit();
        if (!params) {
            return;
        }
        this.resetData(true);
        var $p = $.mobile.activePage;
        this.loadData(params);
        this.toggleEvents(true);
        if(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger" && mainJs.parseUrlSearch().badboy=="wx"){
            $("div[data-role='content']").after('<div style="position:absolute;top:0%;left:0%;width:100%;height: 100%;background-color: black;z-index:1001;opacity:.70;filter:alpha(opacity=70);"></div>'+
            '<div style="width:100%;position: absolute;top:0%;left:0%;z-index:1002;"><img src="m_wx/images/share1.png" width="100%" height="100%"></div>');
        }
    },resetData:function(bInit){
        var me = signupJs;
        if(bInit) {
            me._data = {};
        } else {
            me._data = null;
        }
    },toggleEvents: function (isBind) {
        var $p = $.mobile.activePage;
        var me = signupJs;
        $p.undelegate();
        if (isBind) {
            $p.one('pagebeforehide', function () {
                me.toggleEvents();
                //viewJs.toggleParentShow(true);
                me.resetData();
            });
            setTimeout(function () {
                me.toggleEvents();
                //$p.delegate('.u', 'vclick', me.toUserPage);
                //$p.delegate('.reportBt', 'vclick', me.fReport);
                //$p.delegate('.instant-service.ui-btn.enable', 'vclick', me.instantService);
                //$p.delegate('.btn-store','vclick', me.doStoreSvr);
               // $p.delegate('[action]', 'vclick', me.pageNav);
                //$p.delegate('.pick', 'vclick', me.pick);
                $p.delegate('#sumit_form','vclick',function(){
                    var dataArr =[];
                    var isNull = false;
                    $p.find('.form_list').each(function(i,item){
                        var itemData ={};

                        itemData.description = $(item).find('.description').html().substring(0,$(item).find('.description').html().length-1);
                        itemData.value = $(item).find('.vals').val();
                        //console.log(itemData.value.trim().length == 0)
                        if($(item).find('.description span').attr('class')=='noNull'&& itemData.value.trim().length == 0){
                            var re= /<\D+span>/;
                            var str = $(item).find('.description').html().replace(re,'');
                            viewJs.showPopMsg(str+'不能为空');
                            isNull = true;
                        }
                        dataArr.push(itemData);
                    });
                    var str = JSON.stringify(dataArr);
                    var params = {};
                    params.accessToken = dmJs.getAccessToken();
                    params.serviceID = mainJs.parseUrlSearch().serviceID;
                    params.content = str;
                    //console.log(isNull);
                    if(isNull){
                        return;
                    }else{
                        dmJs._ajax({
                        id:'enterCourse',
                        params:params,
                        method:'POST',
                        url:'/urming_quan/service/enterCourse',
                        callback:function(){
                            //console.log(params);
                                viewJs.navigator.next({
                                    next: {url: './course.html', id: 'course', options:{data:{serviceID:params.serviceID}}},
                                    lastAuto: false
                                });
                            },error:function(){
                                console.log('请求失败')
                            }
                        });
                    }



                })
                $p.delegate('.form_list input,.form_list textarea','focus',function(){
                    $(this).val('')
                });
                $p.delegate('.form_list input,.form_list textarea','blur',function(){
                   //console.log(1)
                    if( !$(this).val()){
                        $(this).val($(this).attr('_value'));
                    }
                });

                $p.delegate('.form_list[type ="select"]','vclick',function(){
                    //console.log($(this).attr('configurationContent'));
                   // alert(1)
                    var str = $(this).attr('configurationContent');
                    var arrData = str.split(',');
                    var _this = this;
                    //console.log(arrData);
                    setTimeout(function(){
                        me.creatBlank(arrData);
                        $p.find('.b_list').on('vclick',function(){
                            //$('.b_list').find('strong').removeClass('check');
                          //console.log($(this).find('strong').attr('class'))//
                            if($(this).find('strong').attr('class')){
                                $(this).find('strong').removeClass('check');
                            }else{
                                $('.b_list').find('strong').removeClass('check');
                                $(this).find('strong').addClass('check');
                            }
                        });
                        $p.find('.b_header input[value="取消"]').on('vclick',function(){
                            $p.find('.blank').hide() ;
                            setTimeout(function(){
                                $p.find('.blank_mask').remove() ;
                                $p.find('.blank').remove() ;
                            },200)
                        });
                        $p.find('.b_header input[value="确定"]').on('vclick',function(){
                           if( $p.find('.blank .check').length){
                               $(_this).find('input').val($p.find('.blank .check').prev().html());
                           }
                            setTimeout(function(){
                                $p.find('.blank_mask').remove() ;
                                $p.find('.blank').remove() ;
                            },200)
                        });
                    },500)


                });
                $p.delegate('.form_list[type ="multiple"]','vclick',function(){
                    //console.log($(this).attr('configurationContent'))
                    var str = $(this).attr('configurationContent');
                    var arrData = str.split(',');
                    var _this = this;
                    me.creatBlank(arrData);
                    $('.b_list').on('vclick',function(){
                        //$('.b_list').find('strong').removeClass('check');
                        //console.log($(this).find('strong').attr('class'))//
                        if($(this).find('strong').attr('class')){
                            $(this).find('strong').removeClass('check');
                        }else{
                            $(this).find('strong').addClass('check');
                        }
                    });
                    $p.find('.b_header input[value="取消"]').on('vclick',function(){
                        setTimeout(function(){
                            $p.find('.blank').hide();
                            $p.find('.blank_mask').remove() ;
                            $p.find('.blank').remove() ;
                        },200)
                    });
                    $p.find('.b_header input[value="确定"]').on('vclick',function(){
                        if( $p.find('.blank .check').length){
                            var strHtl = '';
                            $p.find('.blank .check').each(function(i,item){
                                //console.log(i,item);
                                strHtl += $(item).prev().html()+',';
                            });
                            strHtl=strHtl.substring(0,strHtl.length-1)
                            $(_this).find('input').val(strHtl);
                        }

                        setTimeout(function(){
                            $p.find('.blank').hide() ;
                            $p.find('.blank_mask').remove() ;
                            $p.find('.blank').remove() ;
                        },200)
                    });
                });

            }, 500);
        }
    },creatBlank:function(arr){
        var $p = $.mobile.activePage;
        if($p.find('.b_header').length) $p.find('.blank').remove() ;
        if(arr.length){
            var htl = '<div class="blank">' +
                '<div class="b_header"><input type="button" value="取消"/><input type="button" value="确定"/></div>'+
                        '<div class="b_text">'
                ;
            for(var i=0;i<arr.length;i++){
                htl+= '<div class="b_list"><span>'+arr[i]+'</span><strong></strong></div>';
            }
            htl+= '</div></div>';
            htl+= '<div class="blank_mask"></div>';
            $p.find('.content').append(htl);
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
        var me = signupJs;
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

        var accessToken = dmJs.getAccessToken();
        if(accessToken){
            params.accessToken = accessToken;
        }
        //console.log(params)
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
        var me = signupJs;
        // 需求详情页面
        var  $p = $.mobile.activePage;

        var data = data.datas;
        me._datas = data;
        var l = data.length;
        var strHtml = '<div class="content_box">';
        //console.log(l)
        for(var i=0;i<l;i++){
            var item = data[i];
            strHtml+=rander(item);
        };
        strHtml+='<div id="sumit_form">提交 </div></div>';
        $p.find('div[data-role="content"]').html(strHtml);
        function rander(item){
            var description =  item.description;
            if(!item.allowNull){
                description = ' <span class="noNull">*</span>'+description;
            }
            var str = '';
            switch(item.type){
                case "input":
                    str = '<div class="form_list"  configurationContent = '+ item.configurationContent +'>' +
                        '<strong class="description">'+description+':</strong>'+
                        ' <input class="vals" type="text" value="'+item.defaultValue  +'"_value="'+item.defaultValue  +'"/>'+
                    '</div>';
                    break;
                case "select":
                    str =  '<div class="form_list" type ="select" style = "position:relative" configurationContent = '+ item.configurationContent +'>' +
                    '<strong class="description">'+description+':</strong>'+
                    ' <input class="vals down" type="text" value="'+item.defaultValue  +'" _value="'+item.defaultValue  +'"/>'+
                    '<span class="mask select"></span>'+
                    '</div>';
                    break;
                case "textarea":
                    str =  '<div class="form_list" configurationContent = '+ item.configurationContent +'>' +
                    '<strong class="description">'+description+':</strong>'+
                    ' <textarea class="vals" value="'+item.defaultValue  +'"></textarea> '+
                    '</div>';
                    break;
                case "multiple":
                    str =  '<div class="form_list"type ="multiple" disabled	="disabled" style = "position:relative" configurationContent = '+ item.configurationContent +'>' +
                    '<strong class="description">'+description+':</strong>'+
                    ' <input class="vals down" type="text" value="'+item.defaultValue  +'"_value="'+item.defaultValue  +'"  />'+
                    '<span class="mask multiple"></span>'+
                    '</div>';
                    break;
            };
            return str;
        }

    }, typesetting: function (str) {
        if (str == null) {
            return '';
        }
        return '&nbsp;&nbsp;&nbsp;' + (str.replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;'));
    }, loadData: function (params) {
        // 需求详情
        //console.log(params)
        dmJs._ajax({id: 'toEnterCourse', params: params, url: '/urming_quan/service/toEnterCourse', callback: this.initWantDetails});
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
    },pageNav:function(e){
        if($(this).is('.disabled')){
            return;
        }
        var sAction = $.trim($(this).attr('action'));
        if(sAction == "pageNav"){
            signupJs.offset = ($(this).attr('data-page-num')-1)*20;
            signupJs.loadData(signupJs.preInit());
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