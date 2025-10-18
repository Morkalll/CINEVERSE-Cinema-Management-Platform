
import { Movie } from './models/Movie.js';
import { MovieShowing } from './models/MovieShowing.js';
import { Products } from './models/Products.js';
import { Screen } from './models/Screen.js';
import { User } from './models/User.js';
import { sequelize } from './db.js';

// Sincroniza los modelos con la base de datos.
await sequelize.sync({ alter: true });

// Inserta las películas en la base de datos.
await Movie.bulkCreate([
  {
    title: 'Rambo First Blood Part II',
    genre: 'Acción',
    poster: 'https://image.tmdb.org/t/p/w1280/TuW7rwhdVPrm3qBsBGnn747Uar.jpg',
    posterCarousel: 'https://images8.alphacoders.com/796/thumb-1920-796344.jpg',
    duration: 96, // 1h 36m
    rating: 7.2,
    releaseDate: new Date('1985-05-22'),
    synopsis: 'Rambo es excarcelado y enviado de vuelta al Vietnam con una nueva misión: averiguar el paradero de unos soldados norteamericanos desaparecidos. Tras saltar en paracaídas en la jungla, portando únicamente un cuchillo y un arco con flechas, se le dice que no ataque al enemigo y que sólo haga fotografías de reconocimiento. Pero el plan no saldrá como estaba previsto.',
    director: 'George P. Cosmatos'
  },
  {
    title: 'The Fantastic 4 : First Steps',
    genre: 'Ciencia Ficción, Aventuras',
    poster: 'https://image.tmdb.org/t/p/w1280/ckfiXWGEMWrUP53cc6QyHijLlhl.jpg',
    posterCarousel: 'https://images.hdqwalls.com/wallpapers/the-fantastic-four-first-steps-official-pt.jpg',
    duration: 114, // 1h 54m
    rating: 7.3,
    releaseDate: new Date('2025-07-24'),
    synopsis: 'En un mundo retrofuturista, los Cuatro Fantásticos deben defender la Tierra de Galactus, un dios espacial devorador de planetas, mientras enfrentan dilemas familiares y el nacimiento de un hijo con poderes cósmicos.',
    director: 'Matt Shakman'
  },
  {
    title: 'Spiderman: Across the Spider-Verse',
    genre: 'Animación, Superhéroes, Aventura',
    poster: 'https://image.tmdb.org/t/p/w1280/iacLPcp2o2pClRToPjNAZjGhxAK.jpg',
    posterCarousel: 'https://comicbook.com/wp-content/uploads/sites/4/2022/12/762b1087-dece-43b4-94e0-94ae13069e71.jpg',
    duration: 140, // 2h 20m
    rating: 8.5,
    releaseDate: new Date('2023-06-02'),
    synopsis: 'Miles Morales se embarca en una travesía por el multiverso junto a Gwen Stacy, enfrentando a una sociedad de Spider-People y redefiniendo lo que significa ser un héroe.',
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson'
  },
  {
    title: 'Bloodsport',
    genre: 'Acción, Artes Marciales',
    poster: 'https://image.tmdb.org/t/p/original/uMD7wrjdNh3HxRuIbQs0qRZVHY.jpg',
    posterCarousel: 'https://wallpapercave.com/wp/wp2044098.jpg',
    duration: 92, // 1h 32m
    rating: 6.8,
    releaseDate: new Date('1988-02-26'),
    synopsis: 'Frank Dux, un soldado estadounidense, viaja a Hong Kong para participar en el Kumité, un torneo secreto de artes marciales donde deberá enfrentarse a los luchadores más letales del mundo.',
    director: 'Newt Arnold'
  },
  {
    title: 'Avatar: The Way of Water',
    genre: 'Ciencia Ficción, Aventura',
    poster: 'https://image.tmdb.org/t/p/w1280/i9S3fjjCLYbtX7prpEje6BUZvC0.jpg',
    posterCarousel: 'https://dx35vtwkllhj9.cloudfront.net/20thcenturystudios/avatar-the-way-of-water/images/regions/us/share.jpg',
    duration: 192, // 3h 12m
    rating: 7.5,
    releaseDate: new Date('2022-12-16'),
    synopsis: 'Jake Sully y Neytiri deben proteger a su familia de una nueva amenaza que los obliga a explorar los océanos de Pandora y enfrentar batallas épicas por su supervivencia.',
    director: 'James Cameron'
  },
  {
    title: 'Dragon Ball Super : Super Hero',
    genre: 'Anime, Acción, Fantasía',
    poster: 'https://image.tmdb.org/t/p/w1280/pi0iZOEHeA3ih4p1IwAG4x2DZNH.jpg',
    posterCarousel: 'https://cdn.wallpapersafari.com/55/76/3iTQXW.jpg',
    duration: 99, // 1h 39m
    rating: 7.0,
    releaseDate: new Date('2022-06-11'),
    synopsis: 'La Patrulla Roja resurge con nuevos androides Gamma 1 y 2. Piccolo y Gohan deben enfrentarse a Cell Max en una batalla que pondrá a prueba sus límites.',
    director: 'Tetsuro Kodama'
  },
  {
    title: 'Super Mario Bros',
    genre: 'Animación, Aventura, Comedia',
    poster: 'https://image.tmdb.org/t/p/w1280/zNKs1T0VZuJiVuhuL5GSCNkGdxf.jpg',
    posterCarousel: 'https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2023/02/super-mario-bros-pelicula-2953600.jpg?tf=1920x',
    duration: 92, // 1h 32m
    rating: 7.0,
    releaseDate: new Date('2023-04-05'),
    synopsis: 'Mario y Luigi son transportados al Reino Champiñón, donde deben enfrentarse a Bowser para salvar a Luigi y detener sus planes de conquista.',
    director: 'Aaron Horvath, Michael Jelenic'
  },
  {
    title: 'John Wick 4',
    genre: 'Acción, Suspenso',
    poster: 'https://image.tmdb.org/t/p/w1280/mj2Z9HnRSIEk3n7yVPoOY4Uzzfh.jpg',
    posterCarousel: 'https://img.englishcinemabarcelona.com/jE95Cy5ezJ0lBWxuJjTp_sYbUIVxugjqc8Usq3EtxMM/resize:fill:800:450:1:0/gravity:sm/aHR0cHM6Ly9leHBhdGNpbmVtYXByb2QuYmxvYi5jb3JlLndpbmRvd3MubmV0L2ltYWdlcy9hOTgzMzFlOS0zMzU4LTQ1YWEtODZkYi0zMTRiNGEyZTU0N2QuanBn.jpg',
    duration: 169, // 2h 49m
    rating: 7.6,
    releaseDate: new Date('2023-03-24'),
    synopsis: 'John Wick busca su libertad enfrentando a la Alta Mesa en un duelo mortal, mientras recorre el mundo enfrentando enemigos implacables y redefiniendo su legado.',
    director: 'Chad Stahelski'
  }
]);


await Screen.bulkCreate([

  {
    id: 1,
    name: "Sala 1",
    capacity: 150

  },
  {
    id: 2,
    name: "Sala 2",
    capacity: 150

  },
  {
    id: 3,
    name: "Sala 3",
    capacity: 150

  },
  {
    id: 4,
    name: "Sala 4",
    capacity: 150

  },
]),


  await MovieShowing.bulkCreate([
    {
      movieId: 1, // Rambo
      showtime: new Date('2025-10-07T18:00:00'),
      screenName: 'Sala 1',
      screenId: 1,
      capacity: 100,
      ticketPrice: 1200.00,
      format: '2D'
    },
    {
      movieId: 2, // Fantastic 4
      showtime: new Date('2025-10-07T20:30:00'),
      screenName: 'Sala 2',
      screenId: 2,

      capacity: 120,
      ticketPrice: 1500.00,
      format: 'IMAX'
    },
    {
      movieId: 3, // Spiderman
      showtime: new Date('2025-10-08T17:00:00'),
      screenName: 'Sala 3',
      screenId: 3,

      capacity: 90,
      ticketPrice: 1300.00,
      format: '3D'
    },
    {
      movieId: 4, // Bloodsport
      showtime: new Date('2025-10-08T19:45:00'),
      screenName: 'Sala 1',
      screenId: 1,

      capacity: 100,
      ticketPrice: 1100.00,
      format: '2D'
    },
    {
      movieId: 5, // Avatar
      showtime: new Date('2025-10-09T21:00:00'),
      screenName: 'Sala 4',
      screenId: 4,

      capacity: 150,
      ticketPrice: 1600.00,
      format: 'IMAX'
    },
    {
      movieId: 6, // Dragon Ball
      showtime: new Date('2025-10-09T16:30:00'),
      screenName: 'Sala 2',
      screenId: 2,

      capacity: 120,
      ticketPrice: 1250.00,
      format: '4D'
    },
    {
      movieId: 7, // Super Mario
      showtime: new Date('2025-10-10T15:00:00'),
      screenName: 'Sala 3',
      screenId: 3,

      capacity: 80,
      ticketPrice: 1000.00,
      format: '2D'
    },
    {
      movieId: 8, // John Wick 4
      showtime: new Date('2025-10-10T22:00:00'),
      screenName: 'Sala 4',
      screenId: 4,

      capacity: 120,
      ticketPrice: 1400.00,
      format: '3D'
    },
  ]),

  await Products.bulkCreate([
    {
      id: 1,
      name: "Pochoclos Grandes",
      price: 2500,
      stock: 30,
      image: "https://http2.mlstatic.com/D_NQ_NP_818319-MLA86689449233_062025-O.webp",
      description:
        "Baldes de pochoclos mantecosos y recién hechos, ideales para disfrutar la película."
    },
    {
      id: 2,
      name: "Nachos con Queso",
      price: 3000,
      stock: 50,
      image: "https://www.divinacocina.es/wp-content/uploads/nachos-con-salsa-queso.jpg",
      description:
        "Totopos de maíz crocantes acompañados con salsa de queso cheddar caliente."
    },
    {
      id: 3,
      name: "Pancho Clásico",
      price: 2000,
      stock: 40,
      image: "https://www.dygcombos.com.ar/fotos/1580493378panchos.jpg",
      description:
        "Pancho con salchicha tipo viena en pan suave, con kétchup y mostaza a elección."
    },
    {
      id: 4,
      name: "Pizza Individual Muzza",
      price: 3500,
      stock: 35,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGwczl4P-5X1lnIfLQ8Rwpfeiv-kBBCodMJQ&s",
      description:
        "Porción individual de pizza de mozzarella con salsa de tomate y orégano."
    },
    {
      id: 5,
      name: "Gaseosa Grande",
      price: 1800,
      stock: 70,
      image: "https://http2.mlstatic.com/D_NQ_NP_778437-MLU73713842898_012024-O.webp",
      description:
        "Vaso grande de gaseosa a elección: Coca-Cola, Sprite o Fanta."
    },
    {
      id: 6,
      name: "Chocolate Block",
      price: 1500,
      stock: 80,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1I-IFnElK96U7kwMxwKWf7wLLPolviKpEYQ&s",
      description:
        "Barra de chocolate con leche, ideal para los amantes de lo dulce."
    },
    {
      id: 7,
      name: "Helado en Vaso",
      price: 2200,
      stock: 45,
      image: "https://www.shutterstock.com/image-photo/three-glasses-ice-cream-strawberry-260nw-2463468307.jpg",
      description:
        "Vaso con helado cremoso de vainilla o chocolate, con salsa de topping."
    }

  ])

  



console.log('¡Películas insertadas correctamente y funciones creadas!');