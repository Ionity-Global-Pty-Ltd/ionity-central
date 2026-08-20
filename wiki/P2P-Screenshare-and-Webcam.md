# 📹 Moveable Video Camera & P2P Screenshare

Ionity Central features a high-performance floating webcam PiP and peer-to-peer screen streaming suite.

## Key Features

1. **Draggable Camera Widget** (`#floating-camera-widget`)
   - Freely draggable across the viewport with bounds clamping.
   - 60fps glassmorphism rendering with live status beacons.

2. **📍 Snap to Default Left Corner**
   - Click the "Default Left Corner" button or press `Ctrl+Shift+S` to instantly dock the camera widget to the bottom-left corner of the workspace.

3. **⛶ 1-Click Fullscreen**
   - Click the fullscreen icon to expand the stream to full workspace dimensions (`100vw` / `100vh`).

4. **⚡ Zero-Firebase P2P Streaming Mesh**
   - Stream broadcasting runs via `BroadcastChannel('ionity_screenshare_p2p_v1')` and WebRTC DataChannels.
   - Completely bypasses Firebase bandwidth and storage limits.

5. **☁️ Free VM Edge Session Ledger**
   - Active streaming sessions register a session ledger (`GCP-VM-SESS-XXXX`) on the Always-Free GCP VM (`ionity-central-vm`), storing historical streaming sessions in local storage.
