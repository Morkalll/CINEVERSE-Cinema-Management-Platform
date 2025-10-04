CREATE TABLE IF NOT EXISTS Movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  genre TEXT,
  poster TEXT,
  posterCarousel TEXT,
  duration TEXT,
  rating REAL,
  releaseDate DATE,
  synopsis TEXT,
  director TEXT
);


INSERT INTO Movies (title, genre, poster, posterCarousel, duration, rating, releaseDate, synopsis, director) VALUES
('Rambo First Blood Part II', 'Acción', 'https://image.tmdb.org/t/p/w1280/TuW7rwhdVPrm3qBsBGnn747Uar.jpg', 'https://images8.alphacoders.com/796/thumb-1920-796344.jpg', '1 h 36m', '7.2', '22 de mayo de 1985', 'Rambo es excarcelado y enviado de vuelta al Vietnam con una nueva misión: averiguar el paradero de unos soldados norteamericanos desaparecidos. Tras saltar en paracaídas en la jungla, portando únicamente un cuchillo y un arco con flechas, se le dice que no ataque al enemigo y que sólo haga fotografías de reconocimiento. Pero el plan no saldrá como estaba previsto.', 'George P. Cosmatos'),
('The Fantastic 4 : First Steps', 'Ciencia Ficción, Aventuras', 'https://image.tmdb.org/t/p/w1280/ckfiXWGEMWrUP53cc6QyHijLlhl.jpg', 'https://images.hdqwalls.com/wallpapers/the-fantastic-four-first-steps-official-pt.jpg', '1 h 54m', '7.3', '24 de julio de 2025', 'En un mundo retrofuturista, los Cuatro Fantásticos deben defender la Tierra de Galactus, un dios espacial devorador de planetas, mientras enfrentan dilemas familiares y el nacimiento de un hijo con poderes cósmicos.', 'Matt Shakman'),
('Spiderman: Across the Spider-Verse', 'Animación, Superhéroes, Aventura', 'https://image.tmdb.org/t/p/w1280/iacLPcp2o2pClRToPjNAZjGhxAK.jpg', 'https://comicbook.com/wp-content/uploads/sites/4/2022/12/762b1087-dece-43b4-94e0-94ae13069e71.jpg', '2 h 20m', '8.5', '2 de junio de 2023', 'Miles Morales se embarca en una travesía por el multiverso junto a Gwen Stacy, enfrentando a una sociedad de Spider-People y redefiniendo lo que significa ser un héroe.', 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson'),
('Bloodsport', 'Acción, Artes Marciales', 'https://image.tmdb.org/t/p/original/uMD7wrjdNh3HxRuIbQs0qRZVHY.jpg', 'https://wallpapercave.com/wp/wp2044098.jpg', '1 h 32m', '6.8', '26 de febrero de 1988', 'Frank Dux, un soldado estadounidense, viaja a Hong Kong para participar en el Kumité, un torneo secreto de artes marciales donde deberá enfrentarse a los luchadores más letales del mundo.', 'Newt Arnold'),
('Avatar: The Way of Water', 'Ciencia Ficción, Aventura', 'https://image.tmdb.org/t/p/w1280/i9S3fjjCLYbtX7prpEje6BUZvC0.jpg', 'https://dx35vtwkllhj9.cloudfront.net/20thcenturystudios/avatar-the-way-of-water/images/regions/us/share.jpg', '3 h 12m', '7.5', '16 de diciembre de 2022', 'Jake Sully y Neytiri deben proteger a su familia de una nueva amenaza que los obliga a explorar los océanos de Pandora y enfrentar batallas épicas por su supervivencia.', 'James Cameron'),
('Dragon Ball Super : Super Hero', 'Anime, Acción, Fantasía', 'https://image.tmdb.org/t/p/w1280/pi0iZOEHeA3ih4p1IwAG4x2DZNH.jpg', 'https://cdn.wallpapersafari.com/55/76/3iTQXW.jpg', '1 h 39m', '7.0', '11 de junio de 2022', 'La Patrulla Roja resurge con nuevos androides Gamma 1 y 2. Piccolo y Gohan deben enfrentarse a Cell Max en una batalla que pondrá a prueba sus límites.', 'Tetsuro Kodama'),
('Super Mario Bros', 'Animación, Aventura, Comedia', 'https://image.tmdb.org/t/p/w1280/zNKs1T0VZuJiVuhuL5GSCNkGdxf.jpg', 'https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2023/02/super-mario-bros-pelicula-2953600.jpg?tf=1920x', '1 h 32m', '7.0', '5 de abril de 2023', 'Mario y Luigi son transportados al Reino Champiñón, donde deben enfrentarse a Bowser para salvar a Luigi y detener sus planes de conquista.', 'Aaron Horvath, Michael Jelenic'),
('John Wick 4', 'Acción, Suspenso', 'https://image.tmdb.org/t/p/w1280/mj2Z9HnRSIEk3n7yVPoOY4Uzzfh.jpg', 'https://img.englishcinemabarcelona.com/jE95Cy5ezJ0lBWxuJjTp_sYbUIVxugjqc8Usq3EtxMM/resize:fill:800:450:1:0/gravity:sm/aHR0cHM6Ly9leHBhdGNpbmVtYXByb2QuYmxvYi5jb3JlLndpbmRvd3MubmV0L2ltYWdlcy9hOTgzMzFlOS0zMzU4LTQ1YWEtODZkYi0zMTRiNGEyZTU0N2QuanBn.jpg', '2 h 49m', '7.6', '24 de marzo de 2023', 'John Wick busca su libertad enfrentando a la Alta Mesa en un duelo mortal, mientras recorre el mundo enfrentando enemigos implacables y redefiniendo su legado.', 'Chad Stahelski');
