/**
 * Created by fsk on 2016/3/11.
 */

myProjectJs = {
    init:function(){
        this.clear();
        this.toggleEvents(true);
        this.fetchData();
    },clear:function(){
        var $p = $.mobile.activePage;
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = myProjectJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.userItem', 'vclick', me.toUserPage);
                $p.delegate('.do_btn', 'vclick', me.doAct);
                $p.delegate('.tab-bar-head>div:not(.sel)', 'vclick', me.tab);
            }, 500);

        }
    },tab:function(){
        var $p = $.mobile.activePage;
        var me = myProjectJs;

        $p.find('.tab-bar-head>div').removeClass('sel')
        $(this).addClass('sel')
        me.fetchData($(this).index());
    },doAct:function(e){
        var me = myProjectJs;
        var param = {}
        param.id = $(this).parent().parent().parent().attr('data-userid');
        param.accessToken = dmJs.sStore.getUserInfo().accessToken;
        var _this = this;
        switch($(this).attr('act')){
            case "release":
                var id = "removeRelationship",
                    url = '/urming_quan/user/removeRelationship';
                var options = {};
                options.noText =
                viewJs.dialogPop('确定移出该成员？',_ajax)
                //_ajax();
                break;
            case "allow":
                param.status = 1;
                var id = "dealApply",
                    url = '/urming_quan/user/dealApply';
                _ajax();
                break;
            case "reject":
                var id = "dealApply",
                    url = '/urming_quan/user/dealApply';
                param.status = 2;
                _ajax();
                break;
            case "exit":
                param.institutionUserID = $(this).parent().parent().parent().attr('data-userid');
                var id = "user/exitInstitution",
                    url = '/urming_quan/user/exitInstitution';
                viewJs.dialogPop('确定退出项目组？',_ajax)
                break;
            case "no":
                return;
                break;

        }
        function _ajax(){
            if(arguments[0] === false) return;
            dmJs._ajax({
                method:'POST',
                id:id,
                url:url,
                params:param,
                callback:function(data){
                    if(id == "removeRelationship"){
                        me.fetchData(false);
                    }else{
                        me.fetchData(true);
                    }
                }
            })
        }

        return false;
    },toUserPage:function(){
        var $el = $(this);
        //console.log($el.data("userid"))
        viewJs.navigator.next({next:{url:'./u.html',id:'u',options:{data:{userId:$el.attr("userid")}}}, lastAuto:true});
    },filterList:function(){
        var $el = $(this);
        var me = myProjectJs;
        var _self = arguments.callee;
        clearTimeout(_self.timeHandler);
        _self.timeHandler = setTimeout(function(){
            me._filterList.apply($el);
        }, 300);
    },_filterList:function(){
        var me = myProjectJs;
        var $p = $.mobile.activePage;
        var $list = $p.find('.friendList');
        var $el = $(this);
        var lastKeyWord = $.trim($el.data('lastKeyWord'));
        var originalVal = $.trim($el.val());
        var val = originalVal.replace(/[^\u4E00-\u9FA5]/g,'');
//        val = originalVal;
        if(val != ''){
            if(lastKeyWord != val){
                if(me.fetchData({keyword:val})){
                    $el.data('lastKeyWord', val);
                }
            }
        } else {
//            if(lastKeyWord != ''){
            me.fetchData();
            $el.data('lastKeyWord', '');
//            }
        }
    },fetchData:function(tabIdx){
        var $p = $.mobile.activePage;
        var me = myProjectJs;
        var user = dmJs.sStore.getUserInfo()
        var userId = mainJs.parseUrlSearch().userId;
        var params = {};
        params.accessToken = user.accessToken;
        params.offset = 0;
        params.pageSize = 20;
        if(user.user.isGroup){
            $p.find('.tab-bar-head').show()
            if(tabIdx == 1){
                params.status = 0;
                dmJs._ajax({
                    method:'POST',
                    id:"getMemberList",
                    url:'/urming_quan/user/getMemberList',
                    params:params,
                    callback:function(data){
                        me.parseList(data, params);
                        if(data.total){
                            $('.is_tips').addClass('tip').html(data.total)
                        }else{
                            $('.is_tips').removeClass('tip').html('')
                        }
                    }
                })
            }else{
                params.status = 0;
                dmJs._ajax({
                    method:'POST',
                    id:"getMemberList",
                    url:'/urming_quan/user/getMemberList',
                    params:params,
                    callback:function(data){
                        if(data.total){
                            $('.is_tips').addClass('tip').html(data.total)
                        }else{
                            $('.is_tips').removeClass('tip').html('')
                        }
                    }
                })
                params.status = 1;
                dmJs._ajax({
                    method:'POST',
                    id:"getMemberList",
                    url:'/urming_quan/user/getMemberList',
                    params:params,
                    callback:function(data){
                        me.parseList(data, params);
                    }
                })
            }

        }else{
            dmJs._ajax({
                method:'POST',
                id:"getMyGroup",
                url:'/urming_quan/user/getMyGroup',
                params:params,
                callback:function(data){
                    me.parseList(data, params);
                }
            })
            $p.find('.ui-listview').addClass('notGroup')
            $p.find('.ui-title').html('我的项目组')
        }


        return true;
    },parseList:function(data, opt){
        var total = data.datas.length;
        var list =  data.datas;
        var $p = $.mobile.activePage;
        var html = [];
        var $list = $p.find('.groupList');
        if(total > 0){
            var tpl = $p.find('#user_item_tpl').html();
            var item,info={};
            for(var i = 0; i < total; i++){
                item = list[i];
                info.sex = viewJs.setSexMarkCls(item);
                var idcardValidated = 'empty';
                if(item.type == 2){
                    idcardValidated = item.isIdcardValidated == 1?'enterprise':'unauthorized-enterprise';
                } else if(item.isTeacherValidated == 1 || item.type == 3){
                    idcardValidated = item.isIdcardValidated == 1?'teacher':'unauthorized-teacher';
                }else if(item.isIdcardValidated == 1){
                    idcardValidated = 'person';
                }
                info.userType= idcardValidated;
                info.idcardValidated = 'idcardValidated';
                /*
                 info.idcardValidated = item.isIdcardValidated == '1' ? 'idcardValidated' : '';
                 info.isMoneyGuaranteed = item.isMoneyGuaranteed == '1' ? 'validateBankCardOK' : '';
                 */
                var user = item.user ? 'user':'groupUser';
                var userTags = item[user].userTags;
                var tagHtmls = [];
                var j = 0 , l = userTags.length,tagItem;
                for(; j < l; j++){
                    tagItem = userTags[j];
                    if($.trim(tagItem.tagName) == "北大创新"){
                        continue;
                    }
                    if(j>1){
                        break;
                    }
                    tagHtmls.push([
                        '<div class="tagItem">',
                        '<span class="tagName">',tagItem.tagName,
                        '</span><span class="prvalue font-blue">',
                        tagItem.prvalue == null ? '' : Math.floor(tagItem.prvalue),
                        '</span>',
                        '</div>'
                    ].join(''));
                }
                if(item.user){
                    info.releaseContent = '移出团队';
                    info.release = 'release';
                    info.id = item.id;
                }else{
                    if(item.status){
                        info.releaseContent = '退出';
                        info.release = 'exit';
                    }else{
                        info.releaseContent = '申请中'
                        info.release = 'no';
                    }
                    info.id = item[user].id;

                }
                info.prvalue = Math.floor(item[user].prvalue);
                info.userName = item[user].realname;
                if(item.institutionUserName){
                    info.institutionUserName = "所属公众号: "+item.institutionUserName;
                }
                info.img =  mainJs.getProfilePicUrl({url:item[user].profileImageUrl,sex:item.sex});
                info.tag = tagHtmls.join('');
                info.num = item.groupCount;
                info.userId = item[user].id;
                html.push(viewJs.applyTpl(tpl, info));

            }

        }else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>'];
            $p.find(".myTeacherList").css("background-color","transparent");
        }
        $list.html(html.join(''));
        if($p.find('.ui-title').html()=='项目成员'){
            if(opt.status){
                $('.do_btn').hide();
                $('.release').show();
            }else{
                $('.do_btn').show();
                $('.release').hide();
            }
        }else{
            $('.release').show();
            $('.num').show();
        }

    }
};