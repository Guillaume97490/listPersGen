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
        if ((sampleFile.mimetype == 'image/png')   ||
            (sampleFile.mimetype == 'image/jpg')   || 
            (sampleFile.mimetype == 'image/gif')   || 
            (sampleFile.mimetype == 'image/jpeg'))
            {
                // sampleFile.name = null;
                params.photo = sampleFile.name;
        }
        sampleFile.mv(`${__dirname}/../../public/uploads/${sampleFile.name}`, function(err) {
            if (err)
                return res.status(500).send(err);
    
            // res.send('File uploaded!');
            let newPersonne = Personne(
                params
                );
        
            newPersonne.save(function(err) { // save the new item
                if (err) throw err;
                // console.log('Personne created successfully.');        
                res.redirect("/personne"); // redirect to index
            });
        });

    }else{
        let newPersonne = Personne(
            params
            );
    
        newPersonne.save(function(err) { // save the new item
            if (err) throw err;
            // console.log('Personne created successfully.');        
            res.redirect("/personne"); // redirect to index
        });
    }

};

exports.tirage = (req, res) => {
    console.log('================');
    const dateDujour = moment().format('YYYY-MM-DD') + 'T00:00:00.000Z';
    Personne.find({ $or:[{'dateChoisi': null}, {'dateChoisi' : new Date(dateDujour)}] }, {dateChoisi:1}, function(err, personnes){
    console.log('================');
        
        if (err) throw err;
        let candidats = [];
        let choisiDujour = undefined;
        p = personnes.length
        for (let i = 0; i < p; i++) {
            if (personnes[i].dateChoisi !== null){
                choisiDujour = personnes[i];
                break;
            }
            if(personnes[i].dateChoisi == null){
                candidats.push(personnes[i]);
            }
        };
        nBCandidats = candidats.length;
        if (choisiDujour == undefined){ // 
            var personneDuJour = candidats[Math.floor(Math.random()*nBCandidats)];
            choisiDujour = personneDuJour;
            if (nBCandidats !== 0){

                Personne.findByIdAndUpdate(personneDuJour._id,{
                    dateChoisi: moment().format('YYYY-MM-DD'),
                    choisi: true
                },function(err, item) {
                    if (err) throw err;
                });
            }else{ // reset des personnes choisis
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
                    // res.redirect("/personne");
                });
            }
        }
        let id = choisiDujour._id;
        Personne.findById(id, function(err, item) {
            res.render('./personne/tirage.ejs', {
                personne: item,  
                title: 'Tirage',
                moment: moment
            });

        })
    }).lean();
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
        if ((sampleFile.mimetype == 'image/png')   ||
            (sampleFile.mimetype == 'image/jpg')   || 
            (sampleFile.mimetype == 'image/gif')   || 
            (sampleFile.mimetype == 'image/jpeg')){
                // console.log('====================')
                // console.log(sampleFile.mimetype);
                params.photo = sampleFile.name;
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
                    // console.log(params);
                    Personne.findByIdAndUpdate(req.params.id,
                        params,
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


exports.seedPersonne = function(req,res){
    for (let index = 0; index < 90000; index++) {

        console.log([index]);

        let newPersonne = Personne({
            nom: 'user'+[index],
            prenom: 'user'+[index],
            genre: 'h',
            dob: '2019-11-15T00:00:00.000Z',
            ville: 'a',
            domaine: 'a'
        });
    
        newPersonne.save(function(err) { // save the new item
            if (err) throw err;
        });
    }
}


// module.exports = controller;