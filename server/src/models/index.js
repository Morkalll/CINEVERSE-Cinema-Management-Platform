import { Movie } from './Movie.js';
import { MovieShowing } from './MovieShowing.js';
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



User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });



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
  foreignKey: "orderId",
  as: "orderItems"
});

OrderItem.belongsTo(Order, 
  { 
    foreignKey: "orderId",
    as: "order"
  });


User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });


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
  User,
  Screen,
  Seat,
  OrderItem,
  Order,
  Products
};