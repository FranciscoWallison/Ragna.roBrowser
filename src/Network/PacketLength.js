let packets_len = [];

async function init(packetver) {
    packetver = parseInt(packetver);
    let Lengths;

    if (packetver >= 20220000) {
        Lengths = await import('./Packets/packets2022_len_main.js');
    } else if (packetver >= 20210000) {
        Lengths = await import('./Packets/packets2021_len_main.js');
    } else if (packetver >= 20200000) {
        Lengths = await import('./Packets/packets2020_len_main.js');
    } else if (packetver >= 20190000) {
        Lengths = await import('./Packets/packets2019_len_main.js');
    } else if (packetver >= 20180000) {
        Lengths = await import('./Packets/packets2018_len_main.js');
    } else if (packetver >= 20170000) {
        Lengths = await import('./Packets/packets2017_len_main.js');
    } else if (packetver >= 20160000) {
        Lengths = await import('./Packets/packets2016_len_main.js');
    } else if (packetver >= 20150000) {
        Lengths = await import('./Packets/packets2015_len_main.js');
    } else if (packetver >= 20140000) {
        Lengths = await import('./Packets/packets2014_len_main.js');
    } else if (packetver >= 20130000) {
        Lengths = await import('./Packets/packets2013_len_main.js');
    } else if (packetver >= 20120000) {
        Lengths = await import('./Packets/packets2012_len_main.js');
    } else if (packetver >= 20110000) {
        Lengths = await import('./Packets/packets2011_len_main.js');
    } else if (packetver >= 20100000) {
        Lengths = await import('./Packets/packets2010_len_main.js');
    } else if (packetver >= 20090000) {
        Lengths = await import('./Packets/packets2009_len_main.js');
    } else if (packetver >= 20080000) {
        Lengths = await import('./Packets/packets2008_len_main.js');
    } else if (packetver >= 20070000) {
        Lengths = await import('./Packets/packets2007_len_main.js');
    } else if (packetver >= 20060000) {
        Lengths = await import('./Packets/packets2006_len_main.js');
    } else if (packetver >= 20050000) {
        Lengths = await import('./Packets/packets2005_len_main.js');
    } else if (packetver >= 20040000) {
        Lengths = await import('./Packets/packets2004_len_main.js');
    } else if (packetver >= 20030000) {
        Lengths = await import('./Packets/packets2003_len_main.js');
    }

    packets_len = Lengths.default.init(packetver);
    console.log("%c[Network] Packet Length initialized ", "color:#007000", packetver);
}

function getPacketLength(id) {
    return packets_len[id] || false;
}

export default {
    init,
    getPacketLength
};
