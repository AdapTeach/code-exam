module.exports = {
    port: process.env.OPENSHIFT_NODEJS_PORT || 8080,
    address: process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
    clientUrl: 'http://www.myAppUrl.com',
    authUrl: 'auth service URL',
    db: {
        address: 'mongodb://localhost/code-exam',
        user: '',
        pass: ''
    }
};