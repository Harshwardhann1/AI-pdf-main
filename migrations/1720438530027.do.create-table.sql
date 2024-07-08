--1720438530027.do.create-table.sql

CREATE TABLE "pdf"(
    "id" SERIAL PRIMARY KEY,
    "text" TEXT NULL,
    "createBy" INT NOT NULL,
    "updatedAt" TIMESTAMPTZ NULL
)