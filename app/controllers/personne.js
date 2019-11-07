// const controller = {};
const moment = require('moment');
require('moment/locale/fr');

// importing model 
let Personne = require('../models/personne');
// let User = require('../models/user');



exports.index = (req, res) => {
    Personne.find({}, function(err, personnes) {
        if (err) throw err;
        res.render('./personne/index.ejs', {
            personnes: personnes,
            title: 'Liste des personnes',
            moment: moment
        });
    });
};

exports.show = (req, res) => {
    Personne.findById(req.params.id, function(err, personne) {
        if (err) throw err;
        if (personne){
            res.render('./personne/show.ejs', {
                personne: personne, 
                title: personne._id,
                moment: moment
            });
        };
    })
}

exports.add = (req, res) => {
    res.render('./personne/formulaire.ejs',{
        title: 'Nouveau'
    });
}


exports.save = (req, res) => {
    let sampleFile = req.files.photo;

    if (!req.files || Object.keys(req.files).length === 0) {
        sampleFile.name = null;
    }

    if ((sampleFile.mimetype != 'image/png')   &&
        (sampleFile.mimetype != 'image/jpg')   && 
        (sampleFile.mimetype != 'image/gif')   && 
        (sampleFile.mimetype != 'image/jpeg'))
        {
            sampleFile.name = null;
    }

    
    sampleFile.mv(`${__dirname}/../../public/uploads/${sampleFile.name}`, function(err) {
        if (err)
            return res.status(500).send(err);


        // res.send('File uploaded!');
        let newPersonne = Personne({ // create a new item
            nom: req.body.nom,
            prenom: req.body.prenom,
            genre: req.body.genre,
            dob: req.body.dob,
            ville: req.body.ville,
            domaine: req.body.domaine,
            photo: sampleFile.name,
        });
    
        newPersonne.save(function(err) { // save the new item
            if (err) throw err;
            // console.log('Personne created successfully.');        
            res.redirect("/personne"); // redirect to index
        });
    });
};

exports.tirage = (req, res) => {
    const dateDujour = moment().format('YYYY-MM-DD') + 'T00:00:00.000Z';
    Personne.find({ $or:[{'dateChoisi': null}, {'dateChoisi' : new Date(dateDujour)}] }, function(err, personnes){
        if (err) throw err;
        let candidats = [];
        let choisiDujour = undefined;
        personnes.forEach(personne => {
            if (personne.dateChoisi !== null){
                    choisiDujour = personne;
            }
            if(personne.dateChoisi == null){
                candidats.push(personne);
            }
        });
        if (choisiDujour == undefined){
            var personneDuJour = candidats[Math.floor(Math.random()*candidats.length)];
            choisiDujour = personneDuJour;
            console.log(candidats.length);
            if (candidats.length !== 0){
                Personne.findByIdAndUpdate(personneDuJour.id,{
                    dateChoisi: moment().format('YYYY-MM-DD'),
                    choisi: true
                },function(err, item) {
                    if (err) throw err;
                });
            }
        }
        res.render('./personne/tirage.ejs', {
            personne: choisiDujour,  
            title: 'Tirage',
            moment: moment
        });
    });
}

exports.edit = (req, res) => {
    Personne.findById(req.params.id, function(err, item) {
        if (item.enabled === false){
            Personne.find({}, function(err, items) {
                if (err) throw err;
                return res.render('./personne/index.ejs', {
                    data: items,
                    errorMsg: 'Oups ! opération non permise',
                    title: 'Accueil'
                });
                
            });
        }
        else if (item){
            Personne.find({}, function(err, items) {
              if (err) throw err;
                res.render('./personne/formulaire.ejs', {
                    dataEdit: item,
                    title: 'Edition de ' + item.id,
                    moment: moment
                });
            });
        };
    })
}

exports.update = (req, res) => {

    let params = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        genre: req.body.genre,
        dob: req.body.dob,
        ville: req.body.ville,
        domaine: req.body.domaine,
    }

    if (req.files){
        let sampleFile = req.files.photo;
        if ((sampleFile.mimetype == 'image/png')   &&
            (sampleFile.mimetype == 'image/jpg')   && 
            (sampleFile.mimetype == 'image/gif')   && 
            (sampleFile.mimetype == 'image/jpeg'))
            {
            params = {
                nom: req.body.nom,
                prenom: req.body.prenom,
                genre: req.body.genre,
                dob: req.body.dob,
                ville: req.body.ville,
                domaine: req.body.domaine,
                photo: sampleFile.name
            }
        }


        sampleFile.mv(`${__dirname}/../../public/uploads/${sampleFile.name}`, function(err) {
            if (err){
                return res.status(500).send(err);
            }
    
            Personne.findById(req.params.id, function(err, item) {
                if (item.enabled === false){
                    Personne.find({}, function(err, items) {
                        if (err) throw err;
                        res.render('./personne/index.ejs', {
                            data: items,
                            errorMsg: 'Oups ! opération non permise',
                            title: 'Accueil'
                        });
                    });
                }
                else if (req.body.id){
                    Personne.findByIdAndUpdate(req.params.id,{
                        nom: req.body.nom,
                        prenom: req.body.prenom,
                        genre: req.body.genre,
                        dob: req.body.dob,
                        ville: req.body.ville,
                        domaine: req.body.domaine,
                        photo: sampleFile.name
                    },
                    function(err, item) {
                        if (err) throw err;
                        res.redirect("/personne");
                    });
                }
            })
        })
    

    }else{
        Personne.findById(req.params.id, function(err, item) {
            if (item.enabled === false){
                Personne.find({}, function(err, items) {
                    if (err) throw err;
                    res.render('./personne/index.ejs', {
                        data: items,
                        errorMsg: 'Oups ! opération non permise',
                        title: 'Accueil'
                    });
                });
            }
            else if (req.body.id){
                Personne.findByIdAndUpdate(req.params.id,
                    params, 
                function(err, item) {
                    if (err) throw err;
                    res.redirect("/personne");
                });
            }
        })
    }
}


exports.delete = (req, res) => { 
    Personne.findByIdAndRemove(req.params.id, function(err) {
    if (err) throw err;
    res.redirect("/personne");
    });
}


exports.disable = (req, res) => {
    if (req.params.id){
        Personne.findById(req.params.id, function(err, item) {
            var enable = '';
            if (err) throw err;
            enable = !item.enabled
            Personne.findByIdAndUpdate(req.params.id,{
                enabled: enable
            },
            function(err, item) {
                if (err) throw err;
                res.redirect("/personne");
            });
        })
    }
}

exports.reset = (req,res) => {
    Personne.find({}, function(err, personnes) {
        if (err) throw err;
        personnes.forEach(personne => {
            Personne.findByIdAndUpdate(personne.id,{
                dateChoisi: null,
                choisi: false
            }, 
            function(err, item) {
                if (err) throw err;
            });
        });
        res.redirect("/personne");
    });
}


// module.exports = controller;