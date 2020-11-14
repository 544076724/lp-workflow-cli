// 实现这个项目的构建任务
const { src, dest, parallel, series, watch } = require('gulp')
// 导出读取src,写入dest,parallel并行，series顺序，watcch监听函数

const browserSync = require('browser-sync')// 导入一个 前端服务工具，用于监听文件热更新

const del = require('del')// 导入清空的库

const loadPlugins = require('gulp-load-plugins')// 导入一个默认可以获取所有gulp插件的库

const plugins = loadPlugins()// 获取所有的gulp插件
const bs = browserSync.create()// 创建一个未命名的Browsersync实例
// const GulpSSH = plugins.ssh
const cwd = process.cwd()
let config = {
    // default config
    build: {
        src: 'src',
        dist: 'dist',
        temp: 'temp',
        public: 'public',
        paths: {
            styles: 'assets/styles/*.scss',
            scripts: 'assets/scripts/*.js',
            pages: '*.html',
            images: 'assets/images/**',
            fonts: 'assets/fonts/**'
        }
    }
}
try {
   
    const loadConfig = require(`${cwd}/pages.config.js`)
    config = Object.assign({}, config, loadConfig)
   
} catch (e) { }




let deployConfig
try {
    deployConfig = require(`${cwd}/deployConfig.js`)// 部署
} catch (error) {
    console.log('没有提供部署文件')
}

const clean = () => { // gulp的清空文件夹的任务
    return del([config.build.dist, config.build.temp])
}

const style = () => { // gulp编译 scss文件为css
    return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
        // 读取设置路径下所有的scss文件，设置base路径，从src下查找,配置cwd为src 拼接为src/assets/styles/*.scss
        .pipe(plugins.sass({ outputStyle: 'expanded' }))// 放入sass转换流中 使用expanded展开输出，转换为css
        .pipe(dest(config.build.temp))// 放入dest的写入流到temp文件夹下
}
const script = () => { // gulp编译 es6+语法
    return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))// 通过babel编译所有最新特性
        .pipe(dest(config.build.temp))// 放入dest的写入流到temp文件夹下
}

const html = () => { // gulp编译html模板文件
    return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.swig({ data:config.data, defaults: { cache: false } })) // ，放入模板使用上下文数据以及 防止模板缓存导致页面不能及时更新
        .pipe(dest(config.build.temp))
}

const image = () => { // 压缩图片
    return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.dist))
}

const font = () => { // 压缩字体文件
    return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.dist))
}

const extra = () => { // 把public中的文件拿过来，放到dist中
    return src('**', { base: config.build.public, cwd: config.build.public })
        .pipe(dest(config.build.dist))
}

const serve = () => { // gulp启动一个前端服务的任务
    process.argv.includes('serve') && console.log('只提供了前端服务，监听的src下资源文件，正常开发请start')
    watch(config.build.paths.styles, { cwd: config.build.src }, style)// 监听scss文件，发生变化时执行的方法
    watch(config.build.paths.scripts, { cwd: config.build.src }, script)// 监听js文件，发生变化时执行的方法
    watch(config.build.paths.pages, { cwd: config.build.src }, html)// 监听html文件，发生变化时执行的方法
    watch([
        config.build.paths.images,
        config.build.paths.fonts,
    ], { cwd: config.build.src }, bs.reload) // 监听所有的资源文件，假如资源文件进行添加删除的化，进行更新
    watch('**', { cwd: config.build.public }, bs.reload)
    bs.init({ // 启动Browsersync服务
        notify: false, // 不显示在浏览器中的任何通知。
        port: 2080, // 端口
        // open: false,//是否打开浏览器
        files: `${config.build.temp}/**`, // 监听文件下所有文件变化
        server: {
            baseDir: [config.build.temp, config.build.dist, config.build.public, config.build.src], // 多个基目录，服务查找文件 顺序， 先从temp下查找，找不到的话，从src下，再找不到从public下查找
            routes: {
                '/node_modules': 'node_modules' // 匹配html中/node_modules路径，匹配到时，更改为相对于当前的工作目录，
                // 当前项目工程的node_modules中查找
            }
        }
    })
}

const useref = () => { // 合并html中部分(js,css为一个)文件的任务,html中有js，和css文件bulid的标识，根据标识合并然后通过if压缩
    return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })// 读取html
        .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
        // 根据html中标识合并,指定相对于当前工作目录搜索资产文件的位置,可以是字符串或字符串数组
        .pipe(plugins.if(/\.js$/, plugins.uglify()))// 合完成后，如果，压缩js
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))// 完成后如果是css，压缩
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({ // 如果有引入html压缩
            collapseWhitespace: true, // 压缩html
            minifyCSS: true, // 压缩css
            minifyJS: true// 压缩js
        })))
        .pipe(dest(config.build.dist))
}
const esLint = () => {
    return src([`${cwd}/**/*.js`, '!node_modules/**/*.js', `!${config.build.dist}/**/*.js`, `!${config.build.temp}/**/*.js`])
        .pipe(plugins.eslint({fix:true}))
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError())
}
const standard=()=>{
    return src([`${cwd}/**/*.js`,'!node_modules/**/*.js',`!${config.build.dist}/**/*.js`, `!${config.build.temp}/**/*.js`])
    .pipe(plugins.standard({fix:true}))
    .pipe(plugins.standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
}
// const gulpSSH = new GulpSSH({
//     ignoreErrors: false,
//     sshConfig: deployConfig ? deployConfig.ssh : {}
// })
/**
 * 上传前先删除服务器上现有文件...
 */
// const execSSH = () => {
//     console.log(deployConfig)
//     return gulpSSH.shell(deployConfig.commands, { filePath: 'commands.log' })
//         .pipe(dest('logs'))
// }

// const upload = (done) => { // 上传文件
//     console.log('2s后开始上传文件到服务器...')
//     setTimeout(() => {
//         console.log(`${config.build.dist}/**下文件开始上传,服务器地址为${deployConfig.remotePath}`)
//         src(`${config.build.dist}/**`, { base: config.build.dist })
//             .pipe(gulpSSH.dest(deployConfig.remotePath))
//         console.log('上传完毕.....')
//         done()
//     }, 2000)
// }
// const deploy = series(// 部署
//     execSSH,
//     upload
// )
const compile = parallel(style, script, html)// 这个几个开发阶段和上线阶段都需要的任务并行执行
// 上生产环境执行任务
const build = series(
    clean,
    parallel(
        series(compile, useref),
        image,
        font,
        extra
    )
)
const start = series(compile, serve)// 开发任务

module.exports = { // 导出gulp任务
    build,
    start,
    clean,
    serve,
    // deploy,
    esLint,
    standard
}
//作为npm包发布时依赖项必须放在dependencies不然不会自动下载
//参考https://www.jianshu.com/p/de3f9a53d2a9
// module.exports = {//导出gulp任务
//     style,
//     clean,
//     script,
//     html,
//     image,
//     font,
//     extra,
//     serve,
//     compile
// }
