const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({

    chainWebpack: config => {
        // 发布模式
        config.when(process.env.NODE_ENV === 'production', config => {
            config.entry('app').clear().add('./src/main-prod.js')
            config.plugin('html').tap(args => {
                args[0].title = '电商管理系统'
                return args
            })
        })

        config.when(process.env.NODE_ENV === 'development', config => {
            config.entry('app').clear().add('./src/main.js')
            config.plugin('html').tap(args => {
                args[0].title = 'dev-电商管理系统'
                return args
            })
        })
    },
    transpileDependencies: true,
})