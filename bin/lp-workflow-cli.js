#!/usr/bin/env node

//添加命令行参数
process.argv.push('--cwd')//设置工作目录
console.log(process.cwd())
process.argv.push(process.cwd())//做成脚手架的话，命令行通过bin下的cmd 执行  也就是当前工程bin下
process.argv.push('--gulpfile')//设置gulpfile文件目录
process.argv.push(require.resolve('..'))
//或者写相对路径require.resolve('../lib/index.js'),不写的话默认..找到上级，然后会默认找package.json里的main 路径做执行
require('gulp/bin/gulp')//启动gulp