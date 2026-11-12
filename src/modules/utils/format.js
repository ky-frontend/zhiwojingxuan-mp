/**
 * 图片格式化
 *
 * @export
 * @param 仅缩放的用法： ImgUrlFormat.widthHeightFunc(url,width,height)，height可传''空值，isMmeft默认为true
 * @param 缩放+裁剪的用法： ImgUrlFormat.widthHeightCutFunc(url,width,height)，height也可以传''空值
 * @param 缩放+填充背景色的用法： ImgUrlFormat.widthHeightBackgroundFunc(url,width,height)，height也可以传''空值
 * @param 仅改变图片质量的用法： ImgUrlFormat.imagesLimFunc(url,q)，宽高不传,q是质量
 *
 * @param 七牛云 https://developer.qiniu.com/dora/manual/1270/the-advanced-treatment-of-images-imagemogr2
 * @param 阿里云 https://help.aliyun.com/document_detail/44688.html?spm=a2c4g.11186623.6.1283.20de5bbfMd4bWq
 * @returns
 */
export class ImgUrlFormat {
  // 判断是七牛云阿里云图片
  static imageOrigin(url) {
    if (!url) {
      return '';
    }

    // 判断是否是gif图片，如果是则不添加压缩参数，因为添加压缩参数后就没有动画效果了
    if (url.indexOf('.gif') !== -1) {
      return url;
    }

    // if(/(img.*\.yit\.com)/.test(url)) {
    //     return 'qiniuyun'
    // } else if ((/(asset(\-\w+)?\.yit\.com)/.test(url)) || (/(oss\-cn(\-\w+)?\.aliyuncs\.com)/.test(url))) {  //测试环境，阿里云url可能会新增一种--》https://yit-prod.oss-cn-hangzhou.aliyuncs.com/images/retail-store/offline-default20181010.png oss-cn是固定有的
    //     return 'aliyun'
    // }else{
    //     return ''
    // }
    return 'aliyun';
  }

  // 仅等比缩放
  static widthHeightFunc(url, width, height, isMmeft = true, opts = { quality: 80 }) {
    if (!url) {
      return '';
    }

    // 判断是否是gif图片，如果是则不添加压缩参数，因为添加压缩参数后就没有动画效果了
    if (url.indexOf('.gif') !== -1) {
      return url;
    }

    // 去掉原有的图片裁剪压缩后缀，重复添加后缀显示异常
    url = url.replace(/(^\s*)|(\s*$)/g, '');
    url = url.replace(/(@.*)|(\?.*)/, '');
    // 七牛云
    if (ImgUrlFormat.imageOrigin(url) === 'qiniuyun') {
      if (!height) {
        // 指定目标图片宽度，高度等比缩放，Width取值范围1-9999。
        url = url + `?imageMogr2/thumbnail/${width}x`;
      } else {
        // 等比缩放，比例值为宽缩放比和高缩放比的较大值，Width 和 Height 取值范围1-9999。
        // 注意：宽缩放比：目标宽/原图宽 高缩放比：目标高/原图高
        url = url + `?imageMogr2/thumbnail/!${width}x${height}r`;
      }
    }
    // 阿里云
    if (ImgUrlFormat.imageOrigin(url) === 'aliyun') {
      // 默认，m_mfit，等比缩放，延伸出指定w与h的矩形框外。
      if (isMmeft) {
        if (!height) {
          /*
                        ❗️缩放必拼后缀 ?x-oss-process=image/ ➕ resize/corp, ➕ 各种裁剪缩放参数
                        mfit：等比缩放，延伸出指定w与h的矩形框外的最小图片。
                        指定当目标缩略图大于原图时是否处理。值是 1 表示不处理；值是 0 表示处理。
                        优先按宽缩放 则w_${width}写在h前面
                    */
          url =
            url +
            `?x-oss-process=image/resize,m_mfit,limit_1,w_${width}/quality,q_${
              (opts && opts.quality) || 80
            }`;
        } else {
          url =
            url +
            `?x-oss-process=image/resize,m_mfit,limit_1,w_${width},h_${height}/quality,q_${
              (opts && opts.quality) || 80
            }`;
        }
      } else {
        // m_lfit：等比缩放，限制在指定w与h的矩形内的最大图片。
        if (!height) {
          url =
            url +
            `?x-oss-process=image/resize,m_lfit,limit_1,w_${width}/quality,q_${
              (opts && opts.quality) || 80
            }`;
        } else {
          url =
            url +
            `?x-oss-process=image/resize,m_lfit,limit_1,w_${width},h_${height}/quality,q_${
              (opts && opts.quality) || 80
            }`;
        }
      }
    }
    return url;
  }

  // 等比缩放+居中裁剪
  static widthHeightCutFunc(url, width, height, opts = { quality: 80 }) {
    if (!url) {
      return '';
    }

    // 判断是否是gif图片，如果是则不添加压缩参数，因为添加压缩参数后就没有动画效果了
    if (url.indexOf('.gif') !== -1) {
      return url;
    }

    url = url.replace(/(^\s*)|(\s*$)/g, '');
    url = url.replace(/(@.*)|(\?.*)/, '');
    // 七牛云
    if (ImgUrlFormat.imageOrigin(url) === 'qiniuyun') {
      if (!height) {
        // 限定缩略图的长边最少为<LongEdge>，短边最少为<ShortEdge>，进行等比缩放，居中裁剪。如果只指定 w 参数或只指定 h 参数，表示长边短边限定为同样的值。同上模式4，但超出限定的矩形部分会被裁剪。
        url = url + `?imageView2/5/w/${width}`;

        // 例子：https://img01.yit.com/CMSRESQN/d9986b2a6220a30487d4b3d5583bdc13_210X338.jpeg?imageMogr2/thumbnail/210x/gravity/Center/crop/210x

        // 按宽等比缩放，再从中心向外裁剪
        // url = url + `?imageMogr2/thumbnail/${width}x/gravity/Center/crop/${width}x`
      } else {
        // 第一步
        // 等比缩放，比例值为宽缩放比和高缩放比的较大值，Width 和 Height 取值范围1-9999。
        // 注意：宽缩放比：目标宽/原图宽 高缩放比：目标高/原图高

        // 第二步
        // gravity/Center 从中心向外开始裁剪

        // 第三步
        // crop/${width}x${height} 同时指定目标图片宽高。取值范围为0-10000。
        url =
          url + `?imageMogr2/thumbnail/!${width}x${height}r/gravity/Center/crop/${width}x${height}`;
      }
    }
    // 阿里云
    if (ImgUrlFormat.imageOrigin(url) === 'aliyun') {
      if (!height) {
        //按宽度等比缩放到传入的宽度值裁剪
        url = url + `?x-oss-process=image/crop,g_center,w_${width}`;
      } else {
        // m_fill：固定宽高，将延伸出指定w与h的矩形框外的最小图片进行居中裁剪。
        // limit_0: 指定当目标缩略图大于原图时是否处理。值是 1 表示不处理；值是 0 表示处理。
        url = url + `?x-oss-process=image/resize,m_fill,limit_0,w_${width},h_${height}`;
      }

      if (opts.quality) {
        url += `/quality,q_${opts.quality}`;
      }
    }
    return url;
  }

  // 等比缩放+填充背景色
  static widthHeightBackgroundFunc(
    url,
    width,
    height,
    fillBackgroundColor = { qiniuyun: 'I0ZGNjY2Ng==', aliyun: 'FFFFFF' },
  ) {
    if (!url) {
      return '';
    }

    // 判断是否是gif图片，如果是则不添加压缩参数，因为添加压缩参数后就没有动画效果了
    if (url.indexOf('.gif') !== -1) {
      return url;
    }

    url = url.replace(/(^\s*)|(\s*$)/g, '');
    url = url.replace(/(@.*)|(\?.*)/, '');
    // 七牛云
    if (ImgUrlFormat.imageOrigin(url) === 'qiniuyun') {
      /*
            等比缩放，填充白色背景

            官方文档没有extent，这个是20181226号新加的，
            因为我们和七牛有合作，算是他们的大客户吧，有要求，他们就配合着做了。况且，他们友商（阿里云）就有这个功能，他们没有，说不过去。


            thumbnail/800x800表示是将图片最长800或者最宽800等比缩放，
            extent/800x800/表示将缩放后的图居中放在这个方框内，background/I0ZGNjY2Ng==表示填充的颜色，I0ZGNjY2Ng== 这个是颜色的base64编码，实际是 #FF6666。
            */
      if (!height) {
        // 没有高度时只有缩放功能，不填白，不裁剪
        // url = url + `?imageMogr2/thumbnail/${width}x/extent/${width}x/background/I0ZGRkZGRg==`

        url =
          url + `?imageMogr2/thumbnail/!${width}x${height}r/gravity/Center/crop/${width}x${height}`;
      } else {
        url =
          url +
          `?imageMogr2/thumbnail/${width}x${height}/extent/${width}x${height}/background/${fillBackgroundColor.qiniuyun}`; //红色 I0ZGNjY2Ng==
      }
    }
    // 阿里云
    if (ImgUrlFormat.imageOrigin(url) === 'aliyun') {
      // m_pad，固定宽高，缩略的部分填充白色。
      if (!height) {
        url =
          url +
          `?x-oss-process=image/resize,m_pad,w_${width},color_${fillBackgroundColor.aliyun}/quality,q_80`;
      } else {
        url =
          url +
          `?x-oss-process=image/resize,m_pad,w_${width},h_${height},color_${fillBackgroundColor.aliyun}/quality,q_80`; //荧光色 00FF00
      }
    }
    return url;
  }

  // 仅压缩
  static imagesLimFunc(url, q = 75) {
    if (!url) {
      return '';
    }

    // 判断是否是gif图片，如果是则不添加压缩参数，因为添加压缩参数后就没有动画效果了
    if (url.indexOf('.gif') !== -1) {
      return url;
    }

    url = url.replace(/(^\s*)|(\s*$)/g, '');
    url = url.replace(/(@.*)|(\?.*)/, '');
    // 七牛云
    if (ImgUrlFormat.imageOrigin(url) === 'qiniuyun') {
      /*
            支持 JPG、JPEG、PNG 格式。瘦身后画质不变，分辨率不变，格式不变，文件体积大幅缩小。
            */
      url = url + `?imageslim`;
    }
    // 阿里云
    if (ImgUrlFormat.imageOrigin(url) === 'aliyun') {
      // 如果图片保存成 jpg 或 webp, 可以支持质量变换
      url = url + `?x-oss-process=image/quality,q_${q}`;
    }
    return url;
  }
}

/**
 * 价格单位转换（分转成元）
 * @param {number} price 单位为分
 * @returns 价格单位为元
 */
export const formatPrice = (price, decimal = 2) => {
  if (typeof price !== 'number') return '';
  return (price / 100).toFixed(decimal);
};

/**
 * 数字1000转换为1k，10000转换为1w
 * @param {number} num
 * @returns
 * @example
 * 1000 => 1k
 * 10000 => 1w
 * 100000 => 10w
 */
export const formatNum = (num) => {
  if (typeof num !== 'number') return '';
  if (num < 1000) {
    return num;
  } else if (num < 10000) {
    return `${(num / 1000).toFixed(1)}k`;
  } else if (num < 100000) {
    return `${(num / 10000).toFixed(1)}w`;
  }
};
