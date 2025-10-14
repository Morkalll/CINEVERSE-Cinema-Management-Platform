/*Este index sirve para designar las relaciones entre tablas (foreigns key), es buena practica separar
las relaciones en un archivo.*/

import { Movie } from './Movie.js';
import { MovieShowing } from './MovieShowing.js';
import { Ticket } from './Ticket.js';
import { User } from './User.js';
import { Screen } from './Screen.js';

Movie.hasMany(MovieShowing, {
  foreignKey: 'movieId',
  onDelete: 'CASCADE',
  as: "movieShowings"
});
MovieShowing.belongsTo(Movie, {
  foreignKey: 'movieId',
  as: "movie"
});


User.hasMany(Ticket, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});
Ticket.belongsTo(User, {
  foreignKey: 'userId'
});

MovieShowing.hasMany(Ticket, {
  foreignKey: 'movieShowingId',
  onDelete: 'CASCADE'
});
Ticket.belongsTo(MovieShowing, {
  foreignKey: 'movieShowingId'
});

Screen.hasMany(MovieShowing, {
  foreignKey: 'screenId',
  onDelete: 'SET NULL'
});

MovieShowing.belongsTo(Screen, {
  foreignKey: 'screenId',

});


export {
  Movie,
  MovieShowing,
  Ticket,
  User,
  Screen
};