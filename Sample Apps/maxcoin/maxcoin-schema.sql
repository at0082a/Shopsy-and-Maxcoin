CREATE DATABASE maxcoin;

DROP TABLE IF EXISTS coinvalues CASCADE;

CREATE TABLE coinvalues(
    id INT PRIMARY KEY NOT NULL ,
    valuedate DATE NULL,
    coinvalue DECIMAL( 16,8 ) NULL,
);
