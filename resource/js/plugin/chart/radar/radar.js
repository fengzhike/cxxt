/**
 * Created by lchysh on 14-12-16.
 */
(function (module) {
    function drawLine(ctx, points, opt) {
        ctx.save();
        ctx.beginPath();

        var point = points[0];
        var count = points.length;

        ctx.moveTo(point[0], point[1]);
        var i = 1;
        for (; i < count; i++) {
            point = points[i];
            ctx.lineTo(point[0], point[1]);
        }

        if (count > 2) {
            point = points[0];
            ctx.lineTo(point[0], point[1]);
        }

        ctx.closePath();
        if (!opt.fill) {
            ctx.strokeStyle = opt.color;
            ctx.stroke();
        } else {
            ctx.fillStyle = opt.color;
            ctx.fill();
        }

        ctx.restore();
    }

    function getPoints(d, a, l) {
        var points = [], i = 0, tx, ty, ta;
        for (; i < l; i++) {
            ta = -Math.PI / 2 + i * a;
            tx = formatNum(d * Math.cos(ta));
            ty = formatNum(d * Math.sin(ta));
            points.push([tx, ty]);
        }
        return points;
    }

    function formatNum(val) {
        return Number(val.toFixed(2));
    }

    function getScales(vals) {
        var i = 1, l = vals.length;
        var max = vals[0];
        var tmp;
        for (; i < l; i++) {
            tmp = vals[i];
            max = Math.max(max, tmp);
        }
        var steps = 5, unitStep = 10;
        var step = Math.ceil(max / (unitStep * (steps - 1))) * unitStep;
        max = step * (steps - 1);
        return {max: max, step: step, steps: steps};
    }

    function getRealPoints(a, l, vals, scaleCfg) {
        var i, d = scaleCfg.outD;
        var max;
        max = scaleCfg.max;
        var points = [], tx, ty, ta, td;
        i = 0;
        for (; i < l; i++) {
            ta = -Math.PI / 2 + i * a;
            td = d * vals[i] / max;
            tx = formatNum(td * Math.cos(ta));
            ty = formatNum(td * Math.sin(ta));
            points.push([tx, ty]);
        }
        return points;
    }

    function drawSteps(ctx, stepDs, cfg) {
        ctx.save();
        var steps = cfg.steps, i = 0;
        var step = cfg.step, txt, point;
        for (; i < steps; i++) {
            txt = Math.floor(step * i) + '';
            point = [0, -stepDs[i] + 5];
            ctx.fillText(txt, 10, point[1]);
        }
        ctx.restore();
    }

    function drawLables(ctx, points, opt) {
        var labels = opt.labels;
        var font = opt.font;
        ctx.save();
        var i = 0, count = points.length, label, point, w, x, y;
        for (; i < count; i++) {
            label = labels[i];
            w = ctx.measureText(label.txt).width;
            point = points[i];
            x = point[0];
            y = point[1];
            if (x < 0) {
                x -= w;
            } else if (x > 0) {
                x += 0;
            } else {
                x = -w / 2;
            }
            var dy = font.offset.y;
            if (y > 0) {
                y += font.size + dy;
            } else if (y < 0) {
                y -= dy;
            }
            ctx.font = opt.fontStyle;
            ctx.fillStyle = label.color;
            ctx.fillText(label.txt, x, y);
        }
        ctx.restore();
    }

    module.radarChartJs = {
        init: function (opt) {
            var ret = {};
            var size = opt.size || {};
            var labelWidth = opt.labelWidth;
            var outD, cx, cy, data, vCount, steps = opt.steps, angle, ctx, i;
            var canvas = document.createElement('canvas');
            ctx = canvas.getContext('2d');
            var font = opt.font;
            opt.fontStyle = ctx.font = [font.size, 'px', ' ', font.family].join('');
            console.log(ctx.font);
            canvas.width = size[0] || 0;
            canvas.height = size[1] || 0;
            outD = Math.ceil(Math.min(canvas.width - labelWidth * 2,
                canvas.height - (font.size + font.offset.y) * 2) / 2);
            cx = (canvas.width) / 2;
            cy = (canvas.height) / 2;
            ctx.translate(cx, cy);
            data = opt.data;
            var list = data[0];
            // 顶点数目
            vCount = list.length;
            var stepDs = [0], stepD;
            // steps 圈正多边形线
            var points;
            angle = 2 * Math.PI / vCount;
            i = 1;
            var polygons = [];

            for (; i <= steps; i++) {
                stepD = formatNum(outD * i / steps);
                stepDs.push(stepD);
                points = getPoints(stepD, angle, vCount);
                polygons.push(points);
            }
            var outPolygon = points;
            // 刻度距中心距离
            var outDLines = [];
            // 外层顶点到中心连线
            i = points.length - 1;
            for (; i > -1; i--) {
                outDLines.push([[0, 0], points[i]]);
            }
            var scaleCfg = getScales(list);
            scaleCfg.outD = outD;
            // 实际值
            var realPoints = getRealPoints(angle, vCount, list, scaleCfg);
            ret.canvas = canvas;
            ret.draw = function (animateCfg) {
                if(animateCfg){
                    ctx.clearRect(-cx, -cy, size[0], size[1]);
                }

                var i;
                // 绘制多边形
                i = polygons.length - 1;
                for (; i > -1; i--) {
                    drawLine(ctx, polygons[i], {color: opt.baseColor});
                }
                // 绘制legend
                drawLables(ctx, outPolygon, opt);
                // 绘制外径线
                i = outPolygon.length - 1;
                for (; i > -1; i--) {
                    drawLine(ctx, outDLines[i], {color: opt.baseColor});
                }
                // 刻度值
                drawSteps(ctx, stepDs, scaleCfg);
                if (animateCfg) {
                    var speed = animateCfg.speed || 0.01, tmpD = animateCfg.tmpD || speed * outD;
                    //i =0;

                    var aCount = animateCfg.aCount || 0;
                    if (tmpD >= outD) {
                        tmpD = outD;
                    }
                    aCount++;
                    scaleCfg.outD = tmpD;
                    realPoints = getRealPoints(angle, vCount, list, scaleCfg);
                    drawLine(ctx, realPoints, {color: opt.chartColor, fill: true});
                    if (tmpD >= outD) {
                        return;
                    }
                    tmpD += speed * outD + 0.1 * aCount * aCount;
                    animateCfg.tmpD = tmpD;
                    animateCfg.speed = speed;
                    animateCfg.aCount = aCount;
                    ret.animateId = requestAnimationFrame(function () {
                        ret.draw(animateCfg);
                    });
                } else {
                    // 绘制实际数据线
                    drawLine(ctx, realPoints, {color: opt.chartColor, fill: true});
                }

                return ret;
            };
            return ret;
        }
    };
})(window.jQuery || window);