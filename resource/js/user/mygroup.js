/**
 * Created by fsk on 2016/3/11.
 */
/**
 * Created by lchysh on 2014/8/26.
 */
mygroupJs = {
    init:function(){
        this.clear();
        this.toggleEvents(true);
        this.fetchData();
    },clear:function(){
        var $p = $.mobile.activePage;
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = mygroupJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            setTimeout(function(){
                me.toggleEvents();
                $p.delegate('.userItem', 'vclick', me.toUserPage);
            }, 500);

        }
    },toUserPage:function(){
        var $el = $(this);
        viewJs.navigator.next({next:{url:'./u.html',id:'u',options:{data:{userId:$el.data("userid")}}}, lastAuto:true});
    },filterList:function(){
        var $el = $(this);
        var me = mygroupJs;
        var _self = arguments.callee;
        clearTimeout(_self.timeHandler);
        _self.timeHandler = setTimeout(function(){
            me._filterList.apply($el);
        }, 300);
    },_filterList:function(){
        var me = mygroupJs;
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
    },fetchData:function(evt){
        var me = mygroupJs;
        var userId = mainJs.parseUrlSearch().userId;
        var params = {id:userId};
        dmJs._ajax({
            method:'POST',
            id:"getGroupUserList",
            url:'/urming_quan/user/getGroupUserList',
            params:params,
            callback:function(data){
                me.parseList(data, params);
            }
        })
        return true;
    },parseList:function(data, opt){
        var total = data.data.datas.length;

        var list =  data.data.datas;
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
                var userTags = item.userTags;
                var tagHtmls = [];
                var j = 0 , l = userTags.length,tagItem;
                for(; j < l; j++){
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
                if(item.institutionUserName){
                    info.institutionUserName = "所属公众号: "+item.institutionUserName;
                }
                info.img =  mainJs.getProfilePicUrl({url:item.profileImageUrl,sex:item.sex});
                info.tag = tagHtmls.join('');
                html.push(viewJs.applyTpl(tpl, info));
            }
        }else {
            html = ['<div class="not_found_container font-gray" style="display: block"><div class="not-found-icon"></div> </div>'];
            $p.find(".myTeacherList").css("background-color","transparent");
        }
        $list.html(html.join(''));
    }
};