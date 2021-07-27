let NeDB = require('nedb');
let db = new NeDB({
    filename: 'users.db',
    autoload: true,
})

module.exports = (app) => {
    let route = app.route('/users');

    //traz todos os usuários
    route.get((req, res) => {
        //.sort = 1 para ascendente || -1 para descendente
        db.find({}).sort({name: 1}).exec((err, users) => {
            if(err) {
                app.utils.error.send(err, req, res);
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({
                    users
                });
            }
        });
    })

    //insere um usuário novo
    route.post((req, res) => {

        if(!app.utils.validator.user(app, req, res)) return false;

        db.insert(req.body, (err, user) => {
            if(err) {
                app.utils.error.send(err, req, res);
            } else {
                res.status(200).json(user);
            }
        })
    });
    
    let routeId = app.route('/users/:id');

    //pega um usuário específico pelo _id
    routeId.get((req, res) => {
        db.findOne({_id: req.params.id}).exec((err, user) => {
            if(err) {
                app.utils.error.send(err, req, res);
            } else {
                res.status(200).json(user);
            }
        });
    });

    //atualiza um usuário
    routeId.put((req, res) => {
        if(!app.utils.validator.user(app, req, res)) return false;
        
        db.update({_id: req.params.id}, req.body, err => {
            if(err) {
                app.utils.error.send(err, req, res);
            } else {
                res.status(200).json(Object.assign(req.params, req.body));
            }
        });
    });

    //delete um usuário
    routeId.delete((req, res) => {
        db.remove({_id: req.params.id}, {}, err => {
            if(err) {
                app.utils.error.send(err, req, res);
            } else {
                res.status(200).json(req.params);
            }
        });
    });
};