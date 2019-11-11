
# Description :
Application qui choisit aléatoirement une personne par jour dans une liste, lorsqu’on se rend sur l'écran “tirage du jour”. Une personne ne peut pas être choisis deux fois.
Lorsque tout le monde est choisi, la liste est remise à zéro et les personnes peuvent être à nouveaux choisis.


## Fonctionnalitées :
- CRUD des personnes (création, affichage, modification et suppression)
- Authentification des utilisateurs de l’application (écrans d’inscription et de connexion)
- Seed des personnes (100 000 personnes peuvent être générées par la route [/seed-personne](localhost:8042//seed-personne)
- Pagination des données sur l’écran qui affiche les personnes
- Upload de photo pour une personne


## Structure des données du model Personne :

**nom** : String, requis
**prenom** : String, requis
**genre** : String, enum : [‘h’,’f’], requis
**photo** : string, (nom du fichier image)
**domaine** : String
**dob** : Date, requis (date de naissance)
**ville** : String
**dateChoisi** : Date, default : null


## Technologies utilisées :
- Node js
- Express
- mongoose
- ejs
- javascript
- scripts npm
- html
- css
- javascript
