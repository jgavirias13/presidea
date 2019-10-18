const controller = require('../controllers/userController');
const verifyToken = require('../utils').verifyToken;

module.exports = (router) => {
    router.route('/users')
        .get(verifyToken, controller.getUsers)
        .post(controller.register);
    router.route('/users/:id')
        .get(controller.getById)
        .delete(controller.delete)
        .put(controller.update);
    router.route('/login')
        .post(controller.login);
    router.route('/refresh')
        .post(controller.refrescarToken);
}