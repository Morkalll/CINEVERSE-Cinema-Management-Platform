import { Movie } from './Movie.js';
import { MovieShowing } from './MovieShowing.js';
import { Ticket } from './Ticket.js';
import { User } from './User.js';
import { Screen } from './Screen.js';
import { Seat } from './Seats.js';
import { OrderItem } from './OrderItem.js';  
import { Products } from './Products.js';  
import { Order } from './Order.js';  



Movie.hasMany(MovieShowing, 
{
  foreignKey: 'movieId',
  onDelete: 'CASCADE', 
  as: "movieShowings"
});

MovieShowing.belongsTo(Movie, 
{
  foreignKey: 'movieId',
  as: "movie"
});



User.hasMany(Ticket, 
{
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

Ticket.belongsTo(User, 
{
  foreignKey: 'userId'
});



MovieShowing.hasMany(Ticket, 
{
  foreignKey: 'movieShowingId',
  onDelete: 'CASCADE'
});

Ticket.belongsTo(MovieShowing, 
{
  foreignKey: 'movieShowingId'
});



Screen.hasMany(MovieShowing, 
{
  foreignKey: 'screenId',
  onDelete: 'CASCADE'  
});

MovieShowing.belongsTo(Screen, 
{
  foreignKey: 'screenId'
});



MovieShowing.hasMany(Seat, 
{ 
  foreignKey: "showingId",
  onDelete: 'CASCADE', 
  as: "seats" 
});

Seat.belongsTo(MovieShowing, 
{ 
  foreignKey: "showingId" 
});

Order.hasMany(OrderItem, 
{
  foreignKey: "orderId" 
});

OrderItem.belongsTo(Order, 
  { 
    foreignKey: "orderId"
  });


OrderItem.belongsTo(MovieShowing, { 
  foreignKey: 'refId', 
  constraints: false,
  as: 'movieShowing'
});

OrderItem.belongsTo(Products, { 
  foreignKey: 'refId', 
  constraints: false,
  as: 'product'
});

export {
  Movie,
  MovieShowing,
  Ticket,
  User,
  Screen,
  Seat,
  OrderItem,
  Order,
  Products
};