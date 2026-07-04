-- CreateTable
CREATE TABLE "Servidor" (
    "id" SERIAL NOT NULL,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Servidor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diaria" (
    "id" SERIAL NOT NULL,
    "destino" TEXT NOT NULL,
    "temPernoite" BOOLEAN NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "servidorId" INTEGER NOT NULL,

    CONSTRAINT "Diaria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Servidor_matricula_key" ON "Servidor"("matricula");

-- CreateIndex
CREATE INDEX "Diaria_servidorId_idx" ON "Diaria"("servidorId");

-- AddForeignKey
ALTER TABLE "Diaria" ADD CONSTRAINT "Diaria_servidorId_fkey" FOREIGN KEY ("servidorId") REFERENCES "Servidor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
