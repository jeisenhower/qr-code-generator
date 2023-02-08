import express from 'express';
import qr from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const startServer = async () => {
    const app = express();
    const port = process.env.PORT || 9595;

    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.get('/', (req, res) => {
        return res.status(200).json({
            message: 'Hello there'
        });
    });

    app.post('/qrcode', async (req, res) => {
        const url = req.body.url;

        if (url == null) {
            return res.status(400).json({
                error: 'Provided URL for encoding must not be empty'
            });
        }

        const fileId = uuidv4();

        //const filePath = `${__dirname}/storage/public/${fileId}.png`;

        const filePath = path.join(__dirname, 'storage', 'public', `${fileId}.png`);

        qr.toFile(filePath, url, async function(err) {
            if (err) {
                return res.status(500).json({
                    error: 'Could not create the QR code for the facility. Please contact a system administrator'
                });
            }
    
            await res.status(201).sendFile(filePath, async function(err) {
                if (err) {
                    console.log('Error: Could not download file');
                    res.status(500).json({error: 'Internal server error'});
                }

                try {
                    await fs.unlinkSync(filePath);
                } catch(e) {
                    console.log('Error removing the file', filePath);
                }
                return;
            });
        });
    });

    app.listen(port, () => console.log('Server running'));
}

startServer();

