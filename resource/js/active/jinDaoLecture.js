/**
 * Created by lzl on 2016/3/23.
 */
jinDaoLectureJs={
    init:function(){
        this.toggleEvents(true);
        this.setRem();
        this.initPage();
    },initPage:function(){
        var $p = $.mobile.activePage;
        var me = jinDaoLectureJs;
        $(".ui-footer").remove();
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
        var me = jinDaoLectureJs;
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
                        var next = {url:'./jinDaoLecture.html', id:'jinDaoLecture'};
                        dmJs.sStore.saveSuccessTo(next);
                        viewJs.navigator.next({
                            next:{url:'./login.html', id:'signIn'}
                        });
                    }else{
                        $p.find('.course_download a').attr('href','http://p.img.euming.com/quan_img/UEditor/20160323/1458705469302070692.pdf');
                    }
                });
                $p.delegate('.toCourse', 'vclick', function () {
                    viewJs.navigator.next({
                        next: {
                            url: './course.html', id: 'course',
                            options: {
                                data: {serviceID: 2574}
                            }
                        },
                        lastAuto: true
                    });
                });
                $p.delegate('.user_message','vclick',function(){
                    if(!accessToken){
                        var next = {url:'./jinDaoLecture.html', id:'jinDaoLecture'};
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
                //        next: {url: './jinDaoLecture.html', id: 'jinDaoLecture',
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
