const fs = require('fs');
const yaml = require('js-yaml');
const chiaRootResolver = require('chia-root-resolver');
const axios = require('axios');
const superagent = require("superagent");
const _ = require("lodash");

const checkFilePropagationServerReachable = async () => {
    try {
        const ip4 = await getPublicIpv4(true);
        const ip6 = await getPublicIpv4();
        try {
            ip6 = await publicIpv4();
        } catch (error) {
            console.log('IPv6 address not found:', error);
            ip6 = null; // If IPv6 is not available, set it to null
        }

        const response = await axios.post('https://api.datalayer.storage/system/v1/check_server', { ip4, ip6 });
        return response.data.success;
    } catch (error) {
        console.error('Error in checkFilePropagationServerReachable:', error);
        return false;
    }
};

async function getPublicIpv4(forceIp4 = false) {
    const httpsUrls = ["https://icanhazip.com/", "https://api.ipify.org/"];
    
    for (const url of httpsUrls) {
        if (forceIp4 && url === "https://icanhazip.com/") {
            continue; // Skip this URL if forceIp4 option is set
        }
        
        try {
            const response = await superagent.get(url);
            const ip = (response.text || "").trim();
            if (!_.isEmpty(ip)) {
                return ip;
            }
        } catch (error) {
            console.error(`Error retrieving IP from ${url}:`, error.message);
        }
    }

    throw new Error("Public IPv4 address not found");
}

const checkChiaConfigIpHost = async () => {
    try {
        const chiaRoot = await chiaRootResolver();
        const configFile = `${chiaRoot}/mainnet/config/config.yaml`;

        if (!fs.existsSync(configFile)) {
            throw new Error('Chia config file not found');
        }

        const config = yaml.load(fs.readFileSync(configFile, 'utf8'));

        if (!config.data_layer || typeof config.data_layer.ip_host === 'undefined') {
            throw new Error('data_layer.ip_host not found in config');
        }

        return config.data_layer.ip_host === '0.0.0.0' || config.data_layer.ip_host === '';
    } catch (error) {
        console.error('Error checking Chia config:', error);
        return false;
    }
};

module.exports = { checkChiaConfigIpHost };
module.exports = { checkFilePropagationServerReachable };
module.exports = { getPublicIpv4 };