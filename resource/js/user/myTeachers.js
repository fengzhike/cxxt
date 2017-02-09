myTeachersJs = {
    init:function(){
        if(!this.chkLogin()){
            return;
        }
        this.clear();
        this.toggleEvents(true);
        this.fetchData();
        //console.log(myTeachersJs.chkLogin());
    },clear:function(){
        var $p = $.mobile.activePage;
        $p.find('.myTeacherList').empty();
    },chkLogin:function(){
        var user = dmJs.sStore.getUserInfo();
        if(user == null){
            viewJs.dialogPop('请先登录！', function(){
                viewJs.navigator.pre();
            }, '错误', {onlyBtnOk:true});
            return;
        }
        return user;
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = myTeachersJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('[action]', 'vclick', me.doAction);
                $p.delegate('#filter-follow', 'input', me.filterList);
            }, 500);

        }
    },doAction:function(){
        var $el = $(this);
        var me = myTeachersJs;
        var sAction = $el.attr('action');
        switch(sAction){
            case 'pageNav':
                me.fetchData.apply($el, arguments);
                break;
            case 'userDetail':
                me.toUserPage.call($el, arguments);
        }
    },toUserPage:function(){
        var $el = $(this);
        var param = mainJs.parseUrlSearch($.trim($el.attr('param')));
        viewJs.navigator.next({next:{url:'./u.html',id:'u',options:{data:param}}, lastAuto:true});
    },filterList:function(){
        var $el = $(this);
        var me = myTeachersJs;
        var _self = arguments.callee;
        clearTimeout(_self.timeHandler);
        _self.timeHandler = setTimeout(function(){
            me._filterList.apply($el);
        }, 300);
    },_filterList:function(){
                var me = myTeachersJs;
        var $p = $.mobile.activePage;
        var $list = $p.find('.myTeacherList');
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
    },fetchData:function(evt){
        var _self = arguments.callee;
        var me = myTeachersJs;
        if(_self.busy){
            return;
        }

        var offset = 0;
        if(evt && evt.type == 'vclick'){
            var $el = $(this);
            if($el.is('.disabled')){
                return;
            }
            offset = (Number($el.attr('data-page-num'))-1)*mainJs.PAGE_SIZE;
        }
        _self.busy = true;

        var id;
        if(mainJs.parseUrlSearch().userId){
            id = mainJs.parseUrlSearch().userId;
        }else{
            var user = me.chkLogin();
            if(!user){
                return;
            }
            id=user.user.id;
        }
        var params = {offset:offset,pageSize:mainJs.PAGE_SIZE,id:id};
        dmJs._ajax({
            method:'POST',
            id:'getInstitutionUserList',
            url:'/urming_quan/user/getInstitutionUserList',
            params:params,
            callback:function(data){
                me._data = data;
                me.parseList(data, params);
            }
        }).complete(function(){
            viewJs.delayCancelBusy(_self);
        });
        return true;
    },parseList:function(data, opt){
        var _PAGE_SIZE = mainJs.PAGE_SIZE;
        var total = data.data.total;
        var list =  data.data.datas;
        var l = Math.min(list.length, _PAGE_SIZE);
        var $p = $.mobile.activePage;
        var $paper = $p.find('.pager-nav');
        $paper.empty();
        var paperTpl = $p.find('#paper_tpl').html();
        var pageInfo = {};
        pageInfo.hasPre = opt.offset > 0 ? '' : 'disabled';
        pageInfo.hasNext = (opt.offset+_PAGE_SIZE) < total ? '' : 'disabled';
        var pageCurrent = Math.ceil(opt.offset/_PAGE_SIZE+0.1);
        pageInfo.pagePre = pageCurrent-1;
        pageInfo.pageNext = pageCurrent+1;
        pageInfo.pageCurrentTotal = total < _PAGE_SIZE ? '1' : [pageCurrent, Math.ceil(total/_PAGE_SIZE)].join('/');
        var html = [];
        var $list = $p.find('.myTeacherList');
        if(total > 0){
            var tpl = $p.find('#user_item_tpl').html();
            var item,info={};
            for(var i = 0; i < l; i++){
                item = list[i];
                info.sex = viewJs.setSexMarkCls(item);
                var idcardValidated = 'empty';
                if(item.type == 2){
                    idcardValidated = 'enterprise';
                } else if(item.isTeacherValidated == 1){
                    idcardValidated = 'teacher';
                }else if(item.isIdcardValidated == 1){
                    idcardValidated = 'person';
                }
                info.userType= idcardValidated;
                info.idcardValidated = 'idcardValidated';
                var userTags = item.userTags;
                var tagHtmls = [];
                var j = 0 , ll = userTags.length,tagItem;
                for(; j < ll; j++){
                    tagItem = userTags[j];
                    if($.trim(tagItem.tagName) == "北大创新"){
                        continue;
                    }
                    if(j>3){
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
                info.id = item.id;
                info.prvalue = Math.floor(item.prvalue);
                info.userName = item.realname;
                info.institutionUserName = "所属公众号:"+item.institutionUserName;
                info.img =  mainJs.getProfilePicUrl({url:item.profileImageUrl,sex:item.sex});
                info.tag = tagHtmls.join('');
                html.push(viewJs.applyTpl(tpl, info));
            }
            var tmp = viewJs.applyTpl(paperTpl, pageInfo);
            $paper.html(tmp);
        }else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>'];
            $p.find(".myTeacherList").css("background-color","transparent");
        }
        $list.html(html.join(''));
    }
};