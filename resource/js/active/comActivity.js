/**
 * Created by lzl on 2016/3/23.
 */
comActivityJs={
    init:function(){
        this.toggleEvents(true);
       /// this.setRem();
        this.initPage();
    },initPage:function(){
        var $p = $.mobile.activePage;
        var me = comActivityJs;
        $(".ui-footer").remove();
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
                        title:'《创新思维与共享发展》', // 分享标题
                        desc: '通过【创新学堂】平台查看《创新思维与共享发展》课程讲义，学习网络课程，参与互动问答。', // 分享描述
                        link: 'http://m.edu.euming.com/comActivity.html', // 分享链接
                        imgUrl: 'http://m.edu.euming.com/resource/images/activity/share_wx.png', // 分享图标
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
                        title: '通过【创新学堂】平台查看《创新思维与共享发展》课程讲义，学习网络课程，参与互动问答。', // 分享标题
                        link: 'http://m.edu.euming.com/comActivity.html', // 分享链接
                        imgUrl: 'http://m.edu.euming.com/resource/images/activity/share_wx.png', // 分享图标
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
       /* if(!dmJs.getAccessToken()){
            $p.find('.course_download .unland').show();
            $p.find('.course_download .land').hide();
        }else{
            $p.find('.course_download .unland').hide();
            $p.find('.course_download .land').show();
        }*/
        //$p.find('.content').html( $p.find('#home_page').html());
    },toggleEvents:function(isBind){
        var $p = $.mobile.activePage;
        var me = comActivityJs;
        $p.undelegate();
        if(isBind){
            $p.one('pagebeforehide', function(){
                me.toggleEvents();
            });
            var accessToken = dmJs.getAccessToken();
            setTimeout(function() {
                me.toggleEvents();
                //$p.delegate('', 'vclick', me.learningCardExplain);
                $p.delegate('[data-format]', 'input', viewJs.validInput);
                $p.delegate('.sure', 'vclick', me.toIndex);
                $p.delegate('.course_download', 'vclick',function(){
                    if(!accessToken){
                        var next = {url:'./comActivity.html', id:'comActivity'};
                        dmJs.sStore.saveSuccessTo(next);
                        viewJs.navigator.next({
                            next:{url:'./login.html', id:'signIn'}
                        });
                    }else{
                        $p.find('.course_download a').attr('href','http://cdnimg2.edu.euming.com/pkuie/2016/04/22/s_1461308062409_TBq6Gq.pdf');
                    }
                });
                $p.delegate('.toCourse', 'vclick', function () {
                    viewJs.navigator.next({
                        next: {
                            url: './course.html', id: 'course',
                            options: {
                                data: {serviceID: 3934}
                            }
                        },
                        lastAuto: true
                    });
                });
                $p.delegate('.user_message','vclick',function(){
                    if(!accessToken){
                        var next = {url:'./comActivity.html', id:'comActivity'};
                        dmJs.sStore.saveSuccessTo(next);
                        viewJs.navigator.next({
                            next:{url:'./login.html', id:'signIn'}
                        });
                    }else{
                        viewJs.navigator.next({
                            next: {url: './updateInfo.html', id: 'updateInfo',
                                options: {
                                    data: {}
                                }},
                            lastAuto: true
                        });
                    }

                });
                //$p.delegate('.aaa','vclick',function(){
                //    viewJs.navigator.next({
                //        next: {url: './comActivity.html', id: 'comActivity',
                //            options: {
                //                data: {}
                //            }},
                //        lastAuto: false
                //    });
                //});
                 $p.delegate('.up_question','vclick',function(){
                     viewJs.navigator.next({
                         next: {url: './addQuestion.html', id: 'addQuestion',
                         options: {
                         data: {catId:5,catName:'问题'}
                         }},
                         lastAuto: true
                     });
                 });
                $p.delegate('.in_answer','vclick',function(){
                     var params = {
                         orderType:4,
                         area1:'中国',
                         pageSize:20,
                         offset:0,
                         searchKind:'question',
                         categoryName:'问题',
                         categoryParentId:5,
                         catId:5
                     }
                     viewJs.navigator.next({
                         next: {url: './searchResult.html', id: 'searchResult',
                         options: {
                         data: params
                         }},
                         lastAuto: true
                     })
                 })
                }, 500);

        }
    },setRem:function(){
        setTimeout(function() {
            var $p = $.mobile.activePage;
            oHtml = $p.parent().parent()[0];
            var iWidth=document.documentElement.clientWidth;
            iWidth=iWidth>$('.content').width() ? $('.content').width():iWidth;
            oHtml.style.fontSize = iWidth/16+"px";
        }, 10);
    },toIndex:function() {
        viewJs.navigator.next({next:{url:'./', id:'startpage'}});
    }
};
