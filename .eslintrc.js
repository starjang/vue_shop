module.exports = {
    root: true,

    env: {
        node: true
    },

    extends: [
        'plugin:vue/vue3-essential',
        //'@vue/standard'
    ],

    parserOptions: {
        parser: '@babel/eslint-parser'
    },

    rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        'sapce-before-function-paren': 0,
        'vue/no-deprecated-slot-attribute': 'off'
    }
}