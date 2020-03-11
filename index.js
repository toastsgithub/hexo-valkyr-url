const nunjucks = require('nunjucks')
const path = require('path')
const fs = require('hexo-fs')
const url_for = require('hexo-util').url_for.bind(hexo)
const { promisify } = require('util')
const TEMPLATE_PATH = path.resolve(__dirname, 'valkyr.njk')
const REG_NAMED_ARG = new RegExp(/\[([^=]+)=(.+)\]/)

hexo.extend.tag.register(`valkyrurl`, function(args, content){
    
    const opts = {}
    args.forEach(arg => {
        const matched = arg.match(REG_NAMED_ARG)
        opts[matched[1]] = matched[2]
    })
    const data = {
        title: opts.title || opts.url,
        url: opts.url,
        desc: opts.desc,
        // TODO: Support default image or failed image placeholder
        avatar: opts.avatar
    }
    const render = promisify(nunjucks.renderString)
    const tpl = fs.readFileSync(TEMPLATE_PATH)
    return render(tpl, data)
}, {
    async: true
});