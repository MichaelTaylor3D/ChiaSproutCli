const fs = require('fs');
const yaml = require('js-yaml');
const { getChiaRoot } = require('chia-root-resolver');
const superagent = require('superagent');
const _ = require('lodash');

const API_ENDPOINT = 'https://api.datalayer.storage/mirrors/v1/check_connection';
const CHIA_PORT = 8575;

async function getPublicIpv4(forceIp4 = false) {
    const httpsUrls = ['https://icanhazip.com/', 'https://api.ipify.org/'];

    for (const url of httpsUrls) {
        if (forceIp4 && url === 'https://icanhazip.com/') {
            console.log('Skipping icanhazip.com for IPv4 only request');
            continue;
        }

        try {
            const response = await superagent.get(url);
            const ip = response.text.trim();
            if (!_.isEmpty(ip)) {
                console.log(`IP retrieved from ${url}: ${ip}`);
                return ip;
            }
        } catch (error) {
            console.error(`Error retrieving IP from ${url}:`, error.message);
        }
    }

    console.error('Public IPv4 address not found');
    return null;
}

async function checkFilePropagationServerReachable() {
    let ip4 = await getPublicIpv4(true);
    if (ip4) {
        const successIPv4 = await checkConnection(`http://${ip4}:${CHIA_PORT}`, 'IPv4');
        if (!successIPv4) return false;
    } else {
        return false;
    }

    let ip6 = await getPublicIpv4();
    if (ip6) {
        const successIPv6 = await checkConnection(`http://[${ip6}]:${CHIA_PORT}`, 'IPv6');
        if (!successIPv6) return false;
    } else {
        console.log('IPv6 address not found or not needed');
    }

    return true;
}

async function checkConnection(hostname, ipType) {
    try {
        const response = await superagent
            .post(API_ENDPOINT)
            .set('Content-Type', 'application/json')
            .send({ hostname });

        if (!response.body.success) {
            console.error(`${ipType} request failed`);
            return false;
        }
        console.log(`${ipType} connection successful`);
        return true;
    } catch (error) {
        console.error(`Error with ${ipType} request:`, error.message);
        return false;
    }
}

async function checkChiaConfigIpHost() {
    try {
        const chiaRoot = getChiaRoot();
        console.log(`Chia root directory: ${chiaRoot}`);
        const configFile = `${chiaRoot}/config/config.yaml`;

        if (!fs.existsSync(configFile)) {
            console.error('Chia config file not found');
            return false;
        }

        const config = yaml.load(fs.readFileSync(configFile, 'utf8'));
        if (!config.data_layer || typeof config.data_layer.host_ip === 'undefined') {
            console.error('data_layer.host_ip not found in config');
            return false;
        }

        console.log(`Chia config data_layer.host_ip: ${config.data_layer.host_ip}`);
        return config.data_layer.host_ip === '0.0.0.0' || config.data_layer.host_ip === '';
    } catch (error) {
        console.error('Error checking Chia config:', error.message);
        return false;
    }
}

function runTests() {
    return Promise.all([
        checkChiaConfigIpHost(),
        checkFilePropagationServerReachable()
    ])
    .then(() => {
        console.log('All tests passed');
        return true;
    })
    .catch(error => {
        console.error('Error in running tests:', error.message);
        return false;
    });
}

module.exports = { checkChiaConfigIpHost, checkFilePropagationServerReachable, getPublicIpv4, runTests };
