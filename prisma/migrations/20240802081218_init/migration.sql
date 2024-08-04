-- CreateTable
CREATE TABLE "Assosiation" (
    "id" CHAR(36) NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(30) NOT NULL,
    "acronym" VARCHAR(5) NOT NULL,

    CONSTRAINT "Assosiation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(36) NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" SMALLINT NOT NULL,
    "email" TEXT NOT NULL,
    "usingAuthenticator" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "assosiationId" CHAR(36) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailToken" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "token" INTEGER NOT NULL,
    "userId" CHAR(36) NOT NULL,
    "endOfLive" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TowFactorAppUser" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "secret" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "userId" CHAR(36) NOT NULL,

    CONSTRAINT "TowFactorAppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ipAdress" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "withToken" BOOLEAN NOT NULL,
    "successful" BOOLEAN NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "loginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assosiation_name_key" ON "Assosiation"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assosiationId_fkey" FOREIGN KEY ("assosiationId") REFERENCES "Assosiation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailToken" ADD CONSTRAINT "EmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TowFactorAppUser" ADD CONSTRAINT "TowFactorAppUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
