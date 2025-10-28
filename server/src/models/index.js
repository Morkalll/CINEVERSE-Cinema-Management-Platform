import { Movie } from './Movie.js';
import { MovieShowing } from './MovieShowing.js';
import { Ticket } from './Ticket.js';
import { User } from './User.js';
import { Screen } from './Screen.js';
import { Seat } from './Seats.js';


// Movie -> MovieShowing (one-to-many)
Movie.hasMany(MovieShowing, 
{
  foreignKey: 'movieId',
  onDelete: 'CASCADE',  // ✅ When movie deleted, delete all showings
  as: "movieShowings"
});

MovieShowing.belongsTo(Movie, 
{
  foreignKey: 'movieId',
  as: "movie"
});


// User -> Ticket (one-to-many)
User.hasMany(Ticket, 
{
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

Ticket.belongsTo(User, 
{
  foreignKey: 'userId'
});


// MovieShowing -> Ticket (one-to-many)
MovieShowing.hasMany(Ticket, 
{
  foreignKey: 'movieShowingId',
  onDelete: 'CASCADE'
});

Ticket.belongsTo(MovieShowing, 
{
  foreignKey: 'movieShowingId'
});


// Screen -> MovieShowing (one-to-many)
Screen.hasMany(MovieShowing, 
{
  foreignKey: 'screenId',
  onDelete: 'CASCADE'  // ✅ CHANGED from SET NULL to CASCADE
});

MovieShowing.belongsTo(Screen, 
{
  foreignKey: 'screenId'
});


// MovieShowing -> Seat (one-to-many)
MovieShowing.hasMany(Seat, 
{ 
  foreignKey: "showingId",
  onDelete: 'CASCADE',  // ✅ ADDED CASCADE
  as: "seats" 
});

Seat.belongsTo(MovieShowing, 
{ 
  foreignKey: "showingId" 
});


export {
  Movie,
  MovieShowing,
  Ticket,
  User,
  Screen,
  Seat
};