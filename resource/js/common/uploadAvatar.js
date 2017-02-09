/**
 * Created by lchysh on 2014/9/15.
 */
// ▲★◆◇→＾♀♂□●○★☆№■※□◇―￣＼＠＃○＿＾■№△§§△→→←＿＿＿
uploadAvatarJs = {
    i18n:{
        I01:'裁剪图片贴士：<br>两根手指缩放图片，单根手指拖动裁剪框',
        I02:'裁剪图片贴士：<br>滚动鼠标缩放图片，鼠标左键拖动裁剪框'
    },
    init:function(){
        var me = uploadAvatarJs;
        me.loadThumb();
    },
    setup:function($file,$avatar,toggleEvents){
        var me = uploadAvatarJs;
        me.$file = $file;
        me.$avatar = $avatar;
        me.toggleEvents = toggleEvents || function(){};
        me.$file.unbind('change').change(me.takePic);
    },toEditLargeImage:function($canvas){
        var me = uploadAvatarJs;
        me.toggleEvents();
        $('#toEditLargeImageDlg').remove();
        var $dlg = $([
            '<div id="toEditLargeImageDlg" class="ui-page itemEditor fullScreen vChild">',
            '<div data-role="header"  style="z-index: 2;">',
            '<a	class="ui-btn vBack ui-icon-back ui-btn-icon-notext">返回</a> ',
            '<h1>编辑图片</h1>',
            '<a	class="ui-btn finish">完成</a> ',
            '</div>',
            '<div class="content">',
            '<div id ="quickCrop-help" style="position:relative;background-color: #2c3e50;margin-top:.5em;padding:.5em;"></div>',
            '<div class="photoViewCtr" style="max-width:100%;max-height:100%;text-align:center;">',
            '<div id="cropScaleTarget" class="imgEditor" style="display:inline-block;width:auto;height:auto;">',

            '</div>',
            '</div>',
            '</div>',
            '</div>'].join('')).hide().enhanceWithin();
        $(document.body).append($dlg);
        var w = Number($canvas.attr('id', 'cropCanvas').attr('width'));
        var h = Number($canvas.attr('height'));
        var bx = (w+4-150)/2;
        var by = (h+4+150)/2;
        var crop  = $([
            '<div id= "cropTarget" draggable="true" style="margin-left:',bx+'px;margin-top:-',by+'px;',
            'position: absolute;box-shadow: inset 0 0 20px rgba(0, 0, 0, .4);width:',150,'px;height:',150,'px;',
            '">',

            '</div>'
        ].join(''));
        var $viewer = $dlg.find('.content>.photoViewCtr>.imgEditor').empty().append($canvas).append(crop);
        $dlg.show();
        var isMobile = browser.versions.mobile;
        var tip = isMobile ? me.i18n.I01 : me.i18n.I02;
        $('#quickCrop-help').html('<span class="vclose" style="float:right;padding: 0 .5em;">X</span><div>'+tip+'</div>')
            .show().find('.vclose').on('tap', function(){
                $('#quickCrop-help').slideToggle(700);
            });
        var setStyle = function(key, val){
            $(this).css(key, val);
        };
        setTimeout(function(){
            var cropScaleTarget = document.getElementById("cropCanvas");
            setStyle.apply(cropScaleTarget, ['transition', 'all ease 0.05s']);
            touch.on('#cropCanvas', 'touchstart', function(ev){
                ev.preventDefault();
            });
            var initialScale = 1;
            var currentScale;
            var dx, dy;
            var minScale = Math.max(200/w, 200/h);
            touch.on('#cropCanvas', 'pinchend', function(ev){
                currentScale = ev.scale - 1;
                currentScale = initialScale + currentScale;
                currentScale = currentScale > 2 ? 2 : currentScale;
                currentScale = currentScale < minScale ? minScale : currentScale;
                setStyle.apply(cropScaleTarget, ['transform', 'scale(' + currentScale + ')']);
                console.log("当前缩放比例为:" + currentScale + ".");
            });

            touch.on('#cropCanvas', 'pinchend', function(ev){
                initialScale = currentScale;
            });
            $('#cropCanvas').on('mousewheel', function(e){
                var ev = e.originalEvent;
                var diffScale = 0;
                if(ev.deltaY > 0){
                    diffScale = 0.01;
                } else {
                    diffScale = -0.01;
                }
                currentScale = initialScale + diffScale;
                currentScale = currentScale > 2 ? 2 : currentScale;
                currentScale = currentScale < minScale ? minScale : currentScale;
                setStyle.apply(cropScaleTarget, ['transform', 'scale(' + currentScale + ')']);
                initialScale = currentScale;
            });
            touch.on('#cropTarget', 'touchstart', function(ev){
                ev.preventDefault();
            });
            var target = crop[0];
            touch.on('#cropTarget', 'drag', function(ev){
                dx = dx || 0;
                dy = dy || 0;
                var offx = dx + ev.x + "px";
                var offy = dy + ev.y + "px";
                setStyle.apply(target, ['transform', "translate3d(" + offx + "," + offy + ",0)"]);
            });

            touch.on('#cropTarget', 'dragend', function(ev){
                dx += ev.x;
                dy += ev.y;
            });
            $dlg.delegate('.ui-btn.vBack', 'vclick', function(){
                me.toggleEvents();
                $dlg.remove();
                me.toggleEvents(true);
            });
            $dlg.delegate('.ui-btn.finish', 'vclick', function(){
                var scale = currentScale == null ? 1 : currentScale;
                var rw = rh = Math.round(150/scale);
                dx = dx == null ? 0 : dx;
                dy = dy == null ? 0 : dy;
                var x = Math.floor(w/2 + dx/scale - rw/2);
                var y = Math.floor(h/2 + dy/scale - rh/2);
                console.log([x, y, rw, rh]);
                var c = $canvas[0];
                var t = c.getContext('2d');
                var d = t.getImageData(x, y, rw, rh);
                $canvas.attr({width:rw,height:rh});
                t.putImageData(d, 0, 0);
                var img = new Image();
                img.onload = function(){
                    // 统一图片规格：150x150
                    $canvas.attr({width:150,height:150});
                    t.clearRect(0,0, c.width, c.height);
                    t.drawImage(this, 0, 0, rw, rh,0,0,150,150);
                    var dl = c.toDataURL();
                    me.$avatar.attr('src', dl);
                    $dlg.remove();
                    me.uploadPortraitByFile();
                    me.toggleEvents(true);
                };
                img.src = c.toDataURL();
            });
        }, 500);
    },uploadPortraitByFile:function(){
        var me = uploadAvatarJs;
        var userInfo = dmJs.sStore.getUserInfo();
        var accessToken = userInfo.accessToken;
        var formData = new FormData();
        formData.append('accessToken', accessToken);
        formData.append('picString', me.$avatar.attr('src').split(',')[1]);
        dmJs.ajaxForm(formData, mainJs.getApiUrl('/urming_quan/user/uploadPortraitByFile'), function(data){
            userInfo.user.profileImageUrl = data.user.profileImageUrl;
            userInfo.saveSelf();
            viewJs.showPopMsg('修改头像成功');
        });
    },takePic:function(){
        var files = this.files;
        if (!files.length) return;
        var f = files[0];
        uploadAvatarJs.makeThumb(f);
    },loadThumb:function(){
        viewJs.loadJs([{
            ns:$('<div>'), varName:'makeThumb', url:'/js/make-thumb/make-thumb.min.js?__ver=2',
            title:'缩略图工具'},
            {
                ns:window, varName:'touch', url:'/js/plugin/touch/touch-0.2.14.min.js',
                title:'触控组件'
            }
        ], {});
    },makeThumb:function(file){
        var me = uploadAvatarJs;
        var $file = me.$file;
        viewJs.maskReadImg();
        var maxSize  = [Math.max(150, Math.min(1024, $(window).width())),
            Math.max(150, Math.min(1024, $(window).height()))];
        $file.makeThumb(file, {
            keepCanvas:true,
            maxWidth:maxSize[0],
            maxHeight:maxSize[1],
            success: function(dataURL, tSize, file, sSize, fEvt, $canvas) {
                // 可以得到图片名, 高度等信息, 用来做一些判断, 比如图片大小是否符合要求等..
                me.toEditLargeImage($canvas);
                $file.val('');
                viewJs.finishReadImg();
            },error:function(){
                viewJs.finishReadImg();
                viewJs.showPopMsg('文件读取失败');
            }
        });
    }
};