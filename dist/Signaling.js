"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const readline_1 = require("readline");
class Signaling {
    constructor(peer) {
        this.peer = peer;
        this.lastCorrelation = 0;
        this.resolutions = new Map();
    }
    spawn() {
        this.process = child_process_1.spawn('ndi-webrtc-peer-worker', this.createArguments());
        this.process.on('exit', (code, signal) => this.onProcessExit(code, signal));
        //
        this.process.stderr.setEncoding('utf-8');
        this.process.stdout.setEncoding('utf-8');
        this.process.stdin.setDefaultEncoding('utf-8');
        //
        this.process.stderr.on('data', data => this.onProcessStdErr(data));
        this.reader = readline_1.createInterface({
            input: this.process.stdout,
            output: null,
            terminal: false,
        });
        this.reader.on('line', line => this.onProcessLine(line));
    }
    destroy() {
        this.reader.close();
        this.writeLine('STOP\n');
    }
    request(command, payload) {
        const promise = new Promise((resolve, reject) => {
            this.lastCorrelation++;
            const correlation = this.lastCorrelation;
            //
            const json = { command, payload, correlation };
            this.writeLine(JSON.stringify(json) + '\n');
            //
            const resolution = { reject, resolve };
            this.resolutions.set(correlation, resolution);
        });
        return promise;
    }
    //
    //
    //
    onProcessLine(line) {
        // this.log("<-" + line);
        try {
            const json = JSON.parse(line);
            if (!!json.correlation) {
                this.processReply(json);
            }
            else {
                this.processState(json);
            }
        }
        catch (e) {
            this.log(e);
        }
    }
    processReply(reply) {
        const resolution = this.resolutions.get(reply.correlation);
        if (resolution) {
            this.resolutions.delete(reply.correlation);
            if (reply.ok) {
                resolution.resolve(reply.payload);
            }
            else {
                resolution.reject(reply.error);
            }
        }
        else {
            this.log('Resolution for correlation ' + reply.correlation + ' not found');
        }
    }
    processState(state) {
        switch (state.command) {
            case 'OnIceConnectionChange':
                const icc = state.payload.state;
                this.peer._updateIceConnectionState(icc);
                break;
            case 'OnIceGatheringChange':
                const igc = state.payload.state;
                this.peer._updateIceGatheringState(igc);
                break;
            case 'OnSignalingChange':
                const sc = state.payload.state;
                this.peer._updateSignalingState(sc);
                break;
            case 'OnIceCandidate':
                if (this.peer.onicecandidate) {
                    this.peer.onicecandidate({ candidate: state.payload });
                }
                break;
            case 'OnDataChannel':
                const name = state.payload.name;
                this.peer._onDataChannel(name);
                break;
            case 'OnDataChannelStateChange': {
                const channel = this.peer._getChannel();
                if (channel) {
                    const dcsc = state.payload.state;
                    channel._updateDataChannelState(dcsc);
                }
                break;
            }
            case 'OnDataChannelMessage': {
                const channel = this.peer._getChannel();
                if (channel && channel.onmessage) {
                    channel.onmessage(state.payload);
                }
                break;
            }
            case 'OnAddTrack':
                if (this.peer.ontrack) {
                    this.peer.ontrack(state.payload);
                }
                break;
            case 'OnRemoveTrack':
                break;
            default:
                this.log('Invalid state' + state.payload);
                console.log(state);
        }
    }
    createArguments() {
        return [];
    }
    onProcessStdErr(data) {
        console.log(data);
    }
    onProcessExit(code, signal) {
        console.log('exit ' + code);
        for (const value of this.resolutions.values()) {
            value.reject('signaling closed');
        }
    }
    writeLine(line) {
        // this.log("->" + line);
        this.process.stdin.write(line);
    }
    log(error) {
        console.log(error);
    }
}
exports.Signaling = Signaling;
//# sourceMappingURL=Signaling.js.map