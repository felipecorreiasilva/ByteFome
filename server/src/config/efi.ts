// /src/config/efi.ts

import EfiPay from 'sdk-node-apis-efi';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isProduction = process.env.EFI_ENVIRONMENT === 'production';

// Seleciona as credenciais e o certificado correspondentes ao ambiente atual
const clientId = isProduction 
    ? process.env.EFI_CLIENT_ID_PROD 
    : process.env.EFI_CLIENT_ID_DEV;

const clientSecret = isProduction 
    ? process.env.EFI_CLIENT_SECRET_PROD 
    : process.env.EFI_CLIENT_SECRET_DEV;

const certificatePath = isProduction 
    ? process.env.EFI_CERT_PROD_PATH 
    : process.env.EFI_CERT_DEV_PATH;

if (!clientId || !clientSecret || !certificatePath) {
    throw new Error('❌ Erro: Credenciais ou caminho do certificado da Efí Bank em falta no ficheiro .env');
}

// Resolve o caminho absoluto do certificado a partir da raiz do projeto
const absoluteCertPath = path.resolve(process.cwd(), certificatePath);

// Instancia a SDK oficial da Efí Pay
const efi = new EfiPay({
    client_id: clientId,
    client_secret: clientSecret,
    certificate: absoluteCertPath,
    sandbox: !isProduction // Se não for produção, sandbox assume true (homologação)
});

export default efi;