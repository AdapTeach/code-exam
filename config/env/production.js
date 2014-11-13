module.exports = {
    port: process.env.OPENSHIFT_NODEJS_PORT || 8080,
    address : process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1"
};