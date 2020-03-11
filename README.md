# hexo-valkyr-url

a simple url card display plugin for hexo

## install

``` shell
npm install hexo-valkyr-url
```

## usage
`{% valkyrurl [url=http://example.com] [otherOpt=value] %}`

## options
options are formed like `[key=value]` (bracket included)

supported options are:
- `avatar` image that describe your link (optional)
- `title` title
- `desc` description
- `url` destination when you click image url or title

## example
```
{% valkyrurl
[url=https://github.com/toastsgithub/valkyr-ssh]
[title="valkyr ssh manager"]
[avatar=http://images2.dzmtoast.top/post-cover/github-logo_hub2899c31b6ca7aed8d6a218f0e752fe4_46649_1200x1200_fill_box_center_2.png]
[desc="valkyr-ssh, a simple commandline tool to help you store ssh login address"]
%}
```

**example above will produce this in your article**
![a03be6ca-5d5d-9d90-3c73-7011a891e903.png](http://images2.dzmtoast.top/blog-content/a03be6ca-5d5d-9d90-3c73-7011a891e903.png)


🚨 **Attension please**
if your option value contains whitespace, you should quote value with `""`

i.e. : [title="my name is peter"] instead of [title=my name is peter]

cause in latter case, hexo will split it into different arguments: `[title=my`(arg1), `name`(arg2), `is`(arg3), `peter]`(arg4)

## demo
[zmou's blog](https://blog.dzmtoast.top/about)