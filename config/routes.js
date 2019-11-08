var home = require('../app/controllers/home');
var personne = require('../app/controllers/personne');

//you can include all your controllers

module.exports = function (app, passport) {



    // Login & Signup 
    app.get('/login', home.login);
    app.get('/signup', home.signup);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));





    // Home
    app.get('/', home.loggedIn, home.home);//home
    app.get('/home', home.loggedIn, home.home);//home


    // Personnes


    app.get('/personne', personne.index);
    // app.get('/show/:id', personne.show);
    app.get('/personne/add', personne.add);
    app.post('/personne/save', personne.save);
    app.get('/personne/edit/:id', personne.edit);
    app.get('/personne/tirage-du-jour', personne.tirage);
    app.get('/personne/reset', personne.reset);
    app.post('/personne/update/:id', personne.update);
    app.get('/personne/delete/:id', personne.delete);

    // app.get('/seed-personne', personne.seedPersonne);



    // Exemple pages
    app.get('/page-public', home.pagePublic);
    
    app.get('/page-inscrits', home.loggedIn, home.pageInscrits); // inscrit

    app.get('/page-admin', home.loggedIn, home.pageAdmin); // admin


}
