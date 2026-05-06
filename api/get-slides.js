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

        // Busca os arquivos mais recentes (orderBy) que não estejam na lixeira
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            orderBy: 'createdTime desc',
            pageSize: 20, // Aumentado para retornar uma lista
            fields: 'files(id, name, webViewLink, webContentLink)',
        });

        const files = response.data.files;

        if (files.length === 0) {
            return res.status(404).json({ error: 'Nenhum arquivo encontrado na pasta.' });
        }

        // Retorna a lista de arquivos
        const filesList = files.map(file => ({
            id: file.id,
            name: file.name,
            downloadUrl: file.webContentLink, // Força o download direto
            viewUrl: file.webViewLink       // Abre no visualizador do Drive
        }));

        res.status(200).json(filesList);

    } catch (error) {
        console.error('Erro na API do Drive:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}