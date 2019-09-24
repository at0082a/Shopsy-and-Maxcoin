CREATE DATABASE shopsy;

DROP TABLE IF EXISTS coinvalues CASCADE;

CREATE TABLE order(
    id INT PRIMARY KEY NOT NULL ,
    user_id INT FOREIGN KEY NOT NULL,
    email varchar(100) NOT NULL,  
    orderstatus varchar(100) NOT NULL,  
);

CREATE TABLE orderitems(
    id INT PRIMARY KEY NOT NULL,
    order_id INT FOREIGN KEY NOT NULL,
    sku INT NOT NULL,
    qty INT NOT NULL,
    valuedate DATE NULL,
    coinvalue DECIMAL( 16,8 ) NULL,
);
