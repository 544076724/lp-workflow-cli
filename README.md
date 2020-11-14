# lp-workflow-cli
一个web工作流的脚手架


pages.config.js 为打包的一些相关信息，模板如，data是html中传递的 数据上下文,不需要的话可以不传递
module.exports = {
  build: {
    src: 'src',
    dist: 'dist',
    temp: '.tmp',
    public: 'public',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**'
    }
  },
  data: {
    menus: [
      {
        name: 'Home',
        icon: 'aperture',
        link: 'index.html'
      },
      {
        name: 'Features',
        link: 'features.html'
      },
      {
        name: 'About',
        link: 'about.html'
      },
      {
        name: 'Contact',
        link: '#',
        children: [
          {
            name: 'Twitter',
            link: 'https://twitter.com/w_zce'
          },
          {
            name: 'About',
            link: 'https://weibo.com/zceme'
          },
          {
            name: 'divider'
          },
          {
            name: 'About',
            link: 'https://github.com/zce'
          }
        ]
      }
    ],
    pkg: require('./package.json'),
    date: new Date()
  }
}

deployConfig.js是部署配置 模板如

const remotePath = ''
module.exports = {
  ssh: { // 正式
    host: '192.168.31.227',
    port: 8822,
    username: 'root',
    password: 'a1234567'
  },
  remotePath,
  commands: [
    // 删除现有文件
    `rm -rf ${remotePath}`
  ]
}

脚手架提供以下命令 ：
lp-workflow-cli build   打包任务     
lp-workflow-cli start   开发任务
lp-workflow-cli clean   清空打包开发文件夹
lp-workflow-cli serve   单纯启动前端服务，如果之前没有运行过  start或者build的话，会从src目录下查找文件
lp-workflow-cli deploy  部署上线任务
lp-workflow-cli esLint  esLint 语法检查需要配置文件  默认是 --fix
lp-workflow-cli standard  standard语法检查默认是 --fix







