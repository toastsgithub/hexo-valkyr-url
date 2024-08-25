const nunjucks = require('nunjucks')
const path = require('path')
const fs = require('hexo-fs')
const url_for = require('hexo-util').url_for.bind(hexo)
const { promisify } = require('util')
const TEMPLATE_PATH = path.resolve(__dirname, 'valkyr.njk')
const STYLE_PATH = path.resolve(__dirname, './style.css')
const REG_NAMED_ARG = new RegExp(/\[([^=]+)=(.+)\]/)
const fetch = require('cross-fetch');
// NOTE: v1.0.0 及以上的 cheerio 要求使用 node v18, 否则会找不到 ReadableStream
const cheerio = require('cheerio');
const { get } = require('lodash');

const DEFAULT_ICON_SELECTOR = 'head link[rel~=icon]';
const DEFAULT_ICON_ATTR = 'href';

const DEFAULT_DESC_SELECTOR = 'head meta[name~=description]';
const DEFAULT_DESC_ATTR = 'content';

/**
 * [origin]: {
 *   request: Promise;
 *   result: string;
 * }
 */
const metaRequestMap = {

}

// 每次处理到 valkyrurl 标签时，调用此函数
// 处理完后返回 html 字符串
hexo.extend.tag.register(`valkyrurl`,  async function(args, content){
    const opts = {}
    args.forEach(arg => {
        const matched = arg.match(REG_NAMED_ARG)
        opts[matched[1]] = matched[2]
    })
    let title = opts.title || opts.url;
    let avatar = opts.avatar;
    let url = opts.url;
    let desc = opts.desc;

    const enableAutoImg = get(hexo.config, 'valkyr_url.auto_img');
    const enableAutoDesc = get(hexo.config, 'valkyr_url.auto_desc');
    if (enableAutoImg || enableAutoDesc) {
        const { $: doc, origin } = await getMetaOfUrl(opts.url);
        if (enableAutoImg) {
            const autoImgUrl = await getImageUrlOfMeta(doc, origin);
            if (autoImgUrl) {
                avatar = autoImgUrl;
            }
        }
        if (enableAutoDesc) {
            const autoDesc = await getDescOfMeta(doc);
            if (autoDesc) {
                desc = autoDesc;
            }
        }
    }

    const data = {
        title,
        url,
        desc,
        // TODO: Support default image or failed image placeholder
        avatar,
    }
    const render = promisify(nunjucks.renderString)
    const tpl = fs.readFileSync(TEMPLATE_PATH)
    return render(tpl, data)
}, {
    async: true
})

async function getMetaOfUrl(url) {
    let request;
    let $;
    let origin;
    if (url) {
        try {
            const urlObj = new URL(url);
            origin = urlObj.origin;
            if (metaRequestMap[origin]) {
                // 同 hostname 直接使用缓存
                request = metaRequestMap[origin];
            } else {
                request = metaRequestMap[origin] = fetch(origin, { timeout: 5000 });
            }
            const resp = await request;
            const respType = resp.headers.get('content-type');
            // 非 html content 不处理
            if (respType.includes('text/html')) {
                const text = await resp.text();
                $ = cheerio.load(text);
            }
        } catch (err) {
            // console.log(`debug: getMetaOfUrl 失败 url=[${url}]`);
        }
    }
    return { $, origin };
}

async function getImageUrlOfMeta($, origin) {
    if (!$) {
        return;
    }
    let result;
    let siteIconUrl = $(DEFAULT_ICON_SELECTOR).attr(DEFAULT_ICON_ATTR);
    const autoImgParsers = get(hexo.config, 'valkyr_url.auto_img_parsers') || [];
    for (let conf of autoImgParsers) {
        const { pattern, attr, selector } = conf;
        if (!pattern || !attr || !selector) continue;
        if (!(new RegExp(pattern).test(origin))) continue;
        const url = $(selector).attr(attr);
        if (url) {
            siteIconUrl = url;
            break;
        }
    }
    result = (new URL(siteIconUrl, origin)).toString();
    return result;
}

async function getDescOfMeta($) {
    if (!$) {
        return;
    }
    return $(DEFAULT_DESC_SELECTOR).attr(DEFAULT_DESC_ATTR);
}