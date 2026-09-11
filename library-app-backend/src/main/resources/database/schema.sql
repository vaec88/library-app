CREATE TABLE category (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    status      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE book (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    author      VARCHAR(150) NOT NULL,
    isbn        VARCHAR(13) UNIQUE,
    available   BOOLEAN NOT NULL DEFAULT TRUE,
    category_id INT NOT NULL REFERENCES category(id)
);

CREATE TABLE client (
    id         SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    id_number  VARCHAR(10) UNIQUE NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE reservation (
    id                SERIAL PRIMARY KEY,
    reservation_date  DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    client_id         INT NOT NULL REFERENCES client(id)
);

CREATE TABLE reservation_detail (
    id             SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL REFERENCES reservation(id),
    book_id        INT NOT NULL REFERENCES book(id)
);