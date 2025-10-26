# Etapa 1: Build da aplicação
FROM node:20 AS build

# Diretório de trabalho dentro do container
WORKDIR /app

# Instala OpenSSL para permitir detecção correta pelo Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copia package.json e package-lock.json e instala dependências
COPY package*.json ./
# Copia schema do Prisma antes do npm install (postinstall roda prisma generate)
COPY prisma ./prisma
RUN npm install
# For garantir engine correta, regera após instalar openssl
RUN npx prisma generate

# Copia o resto do projeto (src/ e tsconfig.json)
COPY . .

# Compila TypeScript para a pasta dist/
RUN npm run build

# Etapa 2: Imagem de produção
FROM node:20-slim

WORKDIR /app

# Instala OpenSSL (necessário para runtime do Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copia apenas os arquivos necessários da etapa de build
COPY --from=build /app/package*.json ./
# Copia prisma, dist e node_modules (com engine correta)
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Expõe a porta do seu servidor Express
EXPOSE 3000

# Ambiente de execução
ENV NODE_ENV=development

# Comando para iniciar o servidor
CMD ["node", "dist/index.js"]
