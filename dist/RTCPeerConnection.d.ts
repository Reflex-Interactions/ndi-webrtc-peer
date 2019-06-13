import { RTCDataChannel } from './RTCDataChannel';
import { RTCIceCandidate } from './RTCIceCandidate';
import { RTCSessionDescription } from './RTCSessionDescription';
import { NDIMediaTrack } from './NDIMediaTrack';
import { NDIPeerConfiguration } from './NDIPeerConfiguration';
export declare class RTCPeerConnection {
    private configuration;
    remoteDescription?: RTCSessionDescription;
    localDescription?: RTCSessionDescription;
    iceConnectionState: RTCIceConnectionState;
    iceGatheringState: RTCIceGatheringState;
    signalingState: RTCSignalingState;
    oniceconnectionstatechange?: () => void;
    onicegatheringstatechange?: () => void;
    onsignalingstatechange?: () => void;
    onicecandidate?: (event: any) => void;
    ondatachannel?: (event: any) => void;
    ontrack?: (event: any) => void;
    private signaling;
    private channel?;
    private created;
    private ssrcs;
    constructor(configuration: NDIPeerConfiguration);
    setLocalDescription(desc: RTCSessionDescription): Promise<void>;
    setRemoteDescription(desc: RTCSessionDescription): Promise<void>;
    createAnswer(answer: any): Promise<RTCSessionDescription>;
    createOffer(offer: any): Promise<RTCSessionDescription>;
    addIceCandidate(candidate?: RTCIceCandidate): Promise<void>;
    createDataChannel(name: string, config: object): RTCDataChannel;
    getStats(): Promise<void>;
    addTrack(track: NDIMediaTrack): NDIMediaTrack;
    removeTrack(track: NDIMediaTrack): void;
    replaceTrack(newTrack: NDIMediaTrack): Promise<void>;
    close(): void;
    _updateIceConnectionState(state: number): void;
    _updateIceGatheringState(state: number): void;
    _updateSignalingState(state: number): void;
    _onDataChannel(name: string): void;
    _getChannel(): RTCDataChannel;
    private request;
    private createNativePeer;
}
