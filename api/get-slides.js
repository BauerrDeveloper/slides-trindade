// api/get-slides.js
const { google } = require('googleapis');

export default async function handler(req, res) {
    try {
        // Pegamos as credenciais que configuraremos na Vercel
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // O ID da pasta que você copiou no Passo 1
        const folderId = process.env.DRIVE_FOLDER_ID;

        // Busca o arquivo mais recente (orderBy) que não esteja na lixeira
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            orderBy: 'createdTime desc',
            pageSize: 1,
            fields: 'files(id, name, webViewLink, webContentLink)',
        });

        const files = response.data.files;

        if (files.length === 0) {
            return res.status(404).json({ error: 'Nenhum arquivo encontrado na pasta.' });
        }

        // Retorna os dados do arquivo mais recente
        res.status(200).json({
            name: files[0].name,
            downloadUrl: files[0].webContentLink, // Força o download direto
            viewUrl: files[0].webViewLink       // Abre no visualizador do Drive
        });

    } catch (error) {
        console.error('Erro na API do Drive:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}