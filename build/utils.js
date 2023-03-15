import { GoogleSpreadsheet } from 'google-spreadsheet';
export async function connectToGSS(id = '') {
    try {
        const doc = new GoogleSpreadsheet(id);
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') || '',
        });
        await doc.loadInfo();
        return doc;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}
//# sourceMappingURL=utils.js.map