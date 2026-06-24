# WireGuard CCTV Monitor (wg-cctv-monitor)

A modern, real-time dashboard for monitoring the status and latency of WireGuard peers (MikroTik) via MQTT. Built with Next.js, React, Tailwind CSS, and MQTT.js.

---

## 🛠️ Prerequisites

Before running the application, make sure you have the following installed:
- **Node.js**: v18.x or higher (v20.x recommended)
- **npm**: v9.x or higher

---

## ⚙️ Environment Configuration

To allow the dashboard to connect to your MQTT broker, create a `.env.local` file in the root directory:

```env
# MQTT Broker connection URL (supports ws://, wss://, mqtt://, mqtts://)
NEXT_PUBLIC_MQTT_URL=wss://your-mqtt-broker.com:port

# Optional Broker authentication
NEXT_PUBLIC_MQTT_USERNAME=your-username
NEXT_PUBLIC_MQTT_PASSWORD=your-password
```

> [!NOTE]
> If these environment variables are not set or are invalid, the dashboard will mount successfully but will show a "Waiting for data…" message with a console warning.

---

## 🚀 How to Run Locally (Development)

### 1. Install Dependencies
Run the following command in the project root directory:
```bash
npm install
```

### 2. Start the Development Server

#### Option A: Standard Command (All OS)
If your folder path does not contain special characters:
```bash
npm run dev
```

#### Option B: Windows Path Escape Fallback (Recommended if path contains `&` or spaces)
If your directory path contains special characters like `&` (e.g., `R&D` or `Explore`), the Windows shell might throw execution errors (like `node_modules\.bin\... is not recognized`). Use this direct command to bypass the issue:
```bash
node node_modules/next/dist/bin/next dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the live-reloading dashboard.

---

## 📦 How to Build and Run in Production

To prepare the application for production, you must build the optimized static asset bundle and run the server.

### 1. Build the Project

#### Option A: Standard Build
```bash
npm run build
```

#### Option B: Windows Path Fallback Build
```bash
node node_modules/next/dist/bin/next build
```

### 2. Start the Production Server

Once the build is complete, start the production server:

#### Option A: Standard Start
```bash
npm run start
```

#### Option B: Windows Path Fallback Start
```bash
node node_modules/next/dist/bin/next start
```

The production server will listen on port `3000` by default.

---

## 🔍 Codebase Diagnostics & Testing

To check for typescript or linting errors, run:

- **Typecheck:** `node node_modules/typescript/lib/tsc.js --noEmit`
- **Linter:** `node node_modules/eslint/bin/eslint.js .`
