/**
 * Network/NetworkManager.js
 *
 * Network Manager
 * Manage sockets and packets
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

// Importar dependências
import Configs from '../Core/Configs.js';
import Context from '../Core/Context.js';
import BinaryReader from '../Utils/BinaryReader.js';
import PACKETVER from './PacketVerManager.js';
import PacketVersions from './PacketVersions.js';
import PacketRegister from './PacketRegister.js';
import PacketCrypt from './PacketCrypt.js';
import PacketLength from './PacketLength.js';
import ChromeSocket from './SocketHelpers/ChromeSocket.js';
import JavaSocket from './SocketHelpers/JavaSocket.js';
import WebSocket from './SocketHelpers/WebSocket.js';
import TCPSocket from './SocketHelpers/TCPSocket.js';
import NodeSocket from './SocketHelpers/NodeSocket.js';

// Definições de pacotes
class Packets {
    constructor(name, Struct, size) {
        this.name = name;
        this.Struct = Struct;
        this.size = size;
        this.callback = null;
    }

    static list = [];
}

// Variáveis globais
let _sockets = [];
let _socket = null;
let _save_buffer = null;
let packetDump = Configs.get('packetDump', false);

// Funções utilitárias
function utilsLongToIP(long) {
    let buf = new ArrayBuffer(4);
    let uint8 = new Uint8Array(buf);
    let uint32 = new Uint32Array(buf);
    uint32[0] = long;
    return Array.prototype.join.call(uint8, '.');
}

function utilsBufferToHexString(buffer) {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0') + " ")
        .join('');
}

// Funções de rede
function connect(host, port, callback, isZone) {
    let socket;
    let Socket;
    const proxy = Configs.get('socketProxy', null);

    if (Context.Is.APP) {
        Socket = ChromeSocket;
    } else if (TCPSocket.isSupported()) {
        Socket = TCPSocket;
    } else if (NodeSocket.isSupported()) {
        Socket = NodeSocket;
    } else if (proxy) {
        Socket = WebSocket;
    } else {
        Socket = JavaSocket;
    }

    socket = new Socket(host, port, proxy);
    socket.isZone = !!isZone;
    socket.onClose = onClose;
    socket.onComplete = function onComplete(success) {
        let msg = 'Fail';
        let color = 'red';

        if (success) {
            msg = 'Success';
            color = 'green';

            if (_socket && _socket.ping) {
                clearInterval(_socket.ping);
            }

            socket.onMessage = receive;
            _sockets.push(_socket = socket);

            if (isZone) {
                PacketCrypt.init();
            }
        }

        console.log('%c[Network] ' + msg + ' to connect to ' + host + ':' + port, 'font-weight:bold;color:' + color);
        callback.call(this, success);
    };
}

function sendPacket(Packet) {
    const pkt = Packet.build();

    if (packetDump) {
        let fp = new BinaryReader(pkt.buffer);
        let id = fp.readUShort();
        console.log("%c[Network] Dump Send: \n%cPacket ID: 0x%s\nPacket Name: %s\nLength: %d\nContent:\n%s",
            'color:#007070', 'color:#FFFFFF',
            id.toString(16), Packet.constructor.name, pkt.buffer.byteLength, utilsBufferToHexString(pkt.buffer).toUpperCase());
    }

    console.log('%c[Network] Send: ', 'color:#007070', Packet);

    if (_socket && _socket.isZone) {
        PacketCrypt.process(pkt.view);
    }

    send(pkt.buffer);
}

function send(buffer) {
    if (_socket) {
        _socket.send(buffer);
    }
}

function registerPacket(id, Struct) {
    Struct.id = id;
    Packets.list[id] = new Packets(
        Struct.name,
        Struct,
        Struct.size
    );
}

function hookPacket(packet, callback) {
    if (!packet) {
        throw new Error('NetworkManager::HookPacket() - Invalid packet structure "' + JSON.stringify(packet) + '"');
    }

    if (!packet.id) {
        throw new Error('NetworkManager::HookPacket() - Packet not yet register "' + packet.name + '"');
    }

    Packets.list[packet.id].callback = callback;
}

function read(callback) {
    read.callback = callback;
}

read.callback = null;

function receive(buf) {
    let id, packet, fp;
    let length = 0;
    let offset = 0;
    let buffer;

    if (_save_buffer) {
        let _data = new Uint8Array(_save_buffer.length + buf.byteLength);
        _data.set(_save_buffer, 0);
        _data.set(new Uint8Array(buf), _save_buffer.length);
        buffer = _data.buffer;
    } else {
        buffer = buf;
    }

    fp = new BinaryReader(buffer);

    if (read.callback) {
        read.callback(fp);
        read.callback = null;
    }

    while (fp.tell() < fp.length) {
        offset = fp.tell();

        if (offset + 2 >= fp.length) {
            _save_buffer = new Uint8Array(buffer, offset, fp.length - offset);
            return;
        }

        id = fp.readUShort();
        let packet_len = PacketLength.getPacketLength(id);
        packet_len = packet_len ? packet_len : fp.length - offset;

        if (packet_len < 0) {
            if (offset + 4 >= fp.length) {
                _save_buffer = new Uint8Array(buffer, offset, fp.length - offset);
                return;
            }
            length = fp.readUShort();
        } else {
            length = packet_len;
        }

        offset += length;

        if (offset > fp.length) {
            offset = fp.tell() - (packet_len < 0 ? 4 : 2);
            _save_buffer = new Uint8Array(
                buffer,
                offset,
                fp.length - offset
            );
            return;
        }

        if (Packets.list[id]) {
            packet = Packets.list[id];

            if (packetDump) {
                let buffer_console = new Uint8Array(buffer, 0, length);
                console.log("%c[Network] Dump Recv:\n%cPacket ID: 0x%s\nPacket Name: %s\nLength: %d\nContent:\n%s",
                    'color:#900090', 'color:#FFFFFF',
                    id.toString(16), packet.name, length, utilsBufferToHexString(buffer_console).toUpperCase());
            }

            packet.instance = new packet.Struct(fp, offset);

            console.log('%c[Network] Recv:', 'color:#900090', packet.instance, packet.callback ? '' : '(no callback)');

            if (packet.callback) {
                packet.callback(packet.instance);
            }
        } else {
            if (packetDump) {
                let unknown_buffer = new Uint8Array(buffer, 0, length);
                console.log("%c[Network] Dump Recv:\n%cPacket ID: 0x%s\nPacket Name: [UNKNOWN]\nLength: %d\nContent:\n%s",
                    'color:#900090', 'color:#FFFFFF',
                    id.toString(16), length, utilsBufferToHexString(unknown_buffer).toUpperCase());
            }
            console.error(
                '[Network] Packet "%c0x%s%c" not registered, skipping %d bytes.',
                'font-weight:bold', id.toString(16), 'font-weight:normal', (length)
            );
        }

        if (length) {
            fp.seek(offset, SEEK_SET);
        }
    }

    _save_buffer = null;
}

function onClose() {
    const idx = _sockets.indexOf(this);

    if (this === _socket) {
        console.warn('[Network] Disconnect from server');

        if (_socket.ping) {
            clearInterval(_socket.ping);
        }

        import('UI/UIManager').then(({ showErrorBox }) => {
            showErrorBox('Disconnected from Server.');
        });
    }

    if (idx !== -1) {
        _sockets.splice(idx, 1);
    }
}

function close() {
    let idx;

    if (_socket) {
        _socket.close();

        if (_socket.izZone) {
            PacketCrypt.reset();
        }

        if (_socket.ping) {
            clearInterval(_socket.ping);
        }

        idx = _sockets.indexOf(_socket);
        _socket = null;

        if (idx !== -1) {
            _sockets.splice(idx, 1);
        }
    }
}

function setPing(callback) {
    if (_socket) {
        if (_socket.ping) {
            clearInterval(_socket.ping);
        }
        _socket.ping = setInterval(callback, 10000);

        while (_sockets.length > 1) {
            if (_socket !== _sockets[0]) {
                _sockets[0].close();
                _sockets.splice(0, 1);
            }
        }
    }
}

const NetworkManager = {
    sendPacket,
    send,
    setPing,
    connect,
    hookPacket,
    close,
    read,
    utils: {
        longToIP: utilsLongToIP
    }
};

export default NetworkManager;
