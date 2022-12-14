-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(20) NOT NULL,
    "password" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(10) NOT NULL,
    "last_name" VARCHAR(10) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);
