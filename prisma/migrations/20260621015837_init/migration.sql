-- CreateTable
CREATE TABLE "Servidor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Diaria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "destino" TEXT NOT NULL,
    "temPernoite" BOOLEAN NOT NULL,
    "valorTotal" REAL NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "servidorId" INTEGER NOT NULL,
    CONSTRAINT "Diaria_servidorId_fkey" FOREIGN KEY ("servidorId") REFERENCES "Servidor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Servidor_matricula_key" ON "Servidor"("matricula");
