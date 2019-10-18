module.exports = {
    development: {
        port: process.env.PORT || 3000,
        dbHost: 'mongodb://127.0.0.1:27017/',
        dbName: 'presidea'
    },
    test: {
        port: process.env.PORT || 3100,
        dbHost: 'mongodb://127.0.0.1:27017/',
        dbName: 'presidea_test'
    }
}