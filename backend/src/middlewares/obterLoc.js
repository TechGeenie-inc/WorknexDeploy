import axios from 'axios';

export async function obterLoc(ip) {
    try {
        if (!ip || ip === '::1' || ip.startsWith('127.')) return null;

        const res = await axios.get(`http://ip-api.com/json/${ip}`);
        if (res.data.status === 'success') {
            return res.data;
        }
        return null;
    } catch (e) {
        console.error("Erro ao obter localizacao, ", e);
        return null;
    }
}