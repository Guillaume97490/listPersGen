const moment = require('moment');
require('moment/locale/fr');
var faker = require('faker');
faker.locale = "fr";


// importing model 
let Personne = require('../models/personne');
// let User = require('../models/user');
exports.indexPaginate = (req, res) => {
    // console.log(req.session.role_id)
    let role = req.session.role_id;
    // console.log(req.session);
    let page = Number(req.params.page);
    let nbParPage = 10;
    let totalPages = undefined;
    Personne.estimatedDocumentCount({}, function( err, count){
        totalPages = Math.ceil(Number(count)/nbParPage) ;
        if (totalPages < page){
            return res.redirect('/404');
        }
    }).lean();
    if (page <= 0){
        return res.redirect('/404');
    }
    
    Personne.find({}, function(err, personnes) {
        if (err) throw err;
        res.render('./personne/index.ejs', {
            personnes: personnes,
            title: 'Liste des personnes',
            moment: moment,
            totalPages:totalPages,
            page: page,
            role: role
        });
    }).lean().skip(((page)*nbParPage)-nbParPage).limit(nbParPage).sort('_id');
};


// exports.index = (req, res) => {
//     Personne.find({}, function(err, personnes) {
//         if (err) throw err;
//         res.render('./personne/index.ejs', {
//             personnes: personnes,
//             title: 'Liste des personnes',
//             moment: moment
//         });
//     }).lean();
// };



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

exports.add = (req, res) => res.render('./personne/formulaire.ejs', {title: 'Nouveau'})

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
                res.redirect("/personnes/page-1"); // redirect to index
            });
        });

    }else{
        let newPersonne = Personne(
            params
            );
    
        newPersonne.save(function(err) { // save the new item
            if (err) throw err;
            // console.log('Personne created successfully.');        
            res.redirect("/personnes/page-1"); // redirect to index
        });
    }

};

exports.tirage = (req, res) => {
    
    const dateDujour = moment().format('YYYY-MM-DD') + 'T00:00:00.000Z';
    Personne.find({ $or:[{'dateChoisi': null}, {'dateChoisi' : new Date(dateDujour)}] }, function(err, personnes){
    
        
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
                    // res.redirect("/personnes/page-1");
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
    }).lean().select({dateChoisi:1});
}

exports.edit = (req, res) => {
    Personne.findById(req.params.id, function(err, item) {
        if (item.enabled === false){
            // Personne.find({}, function(err, items) {
            //     if (err) throw err;
            //     return res.render('./personne/index.ejs', {
            //         data: items,
            //         errorMsg: 'Oups ! opération non permise',
            //         title: 'Accueil'
            //     });
            res.redirect("/personnes/page-1");
            // });
        }
        else if (item){
            // Personne.find({}, function(err, items) {
            //   if (err) throw err;
                res.render('./personne/formulaire.ejs', {
                    dataEdit: item,
                    title: 'Edition de ' + item.id,
                    moment: moment
                });
            // });
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
                        res.redirect("/personnes/page-1");
                    });
                }
            })
        })
    }else{
        Personne.findById(req.params.id, function(err, item) {
            if (item.enabled === false){
                // Personne.find({}, function(err, items) {
                //     if (err) throw err;
                //     res.render('./personne/index.ejs', {
                //         data: items,
                //         errorMsg: 'Oups ! opération non permise',
                //         title: 'Accueil'
                //     });
                // });
                res.redirect("/personnes/page-1");
            }
            else if (req.body.id){
                Personne.findByIdAndUpdate(req.params.id,
                    params, 
                function(err, item) {
                    if (err) throw err;
                    res.redirect("/personnes/page-1");
                });
            }
        })
    }
}


exports.delete = (req, res) => { 
    Personne.findByIdAndRemove(req.params.id, function(err) {
    if (err) throw err;
    res.redirect("/personnes/page-1");
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
                res.redirect("/personnes/page-1");
            });
        })
    }
}

exports.reset = (req,res) => {
    Personne.find({dateChoisi: {$ne: null} }, function(err, personnes) {
        if (err) throw err;
        personnes.forEach(personne => {
            Personne.findByIdAndUpdate(personne._id,{
                dateChoisi: null,
                choisi: false
            }, 
            function(err, item) {
                if (err) throw err;
            });
        });
        res.redirect("/personnes/page-1");
    }).lean().select({_id:1});
}


exports.seedPersonne = function(req,res){
    Personne.deleteMany({}, function (err) {
        if (err) throw err;
        for (let index = 0; index < 100000; index++) {
            console.log([index]);
            let newPersonne = Personne({
                nom: faker.name.lastName(),
                prenom: faker.name.firstName(),
                genre: faker.random.arrayElement(['h','f']),
                dob: faker.date.past(40, '2000-01-01'),
                ville: faker.address.city(),
                domaine: faker.lorem.word(),
                photo:faker.image.avatar()
            });
            newPersonne.save(function(err) { // save the new item
                if (err) throw err;
            });
        }
        res.redirect('/personnes/page-1')

    });
}