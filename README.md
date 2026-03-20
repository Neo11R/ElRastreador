# 🏛️ El Rastreador: Public Procurement Audit Tool v2.0

![License](https://img.shields.io/badge/license-Apache--2.0-yellow)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20PWA-black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)

**El Rastreador** is an advanced transparency solution designed to monitor and audit the flow of public capital in Spain in real-time. By integrating directly with official government feeds, this platform democratizes access to complex public procurement data, presenting it in a visual and actionable format.

---

## 🚀 Key Features

* **📡 Real-Time Data Streaming:** Encrypted connection to the *Plataforma de Contratación del Sector Público* (Government of Spain).
* **💰 Audited Capital Monitor:** Dynamic algorithm that aggregates and categorizes the total amount of detected tenders.
* **🏷️ Smart Categorization:** Intelligent icon system to identify works, supplies, software services, and healthcare emergencies.
* **📱 Native Bridge (Capacitor):** Optimized user experience for Android with native support for AdMob and evidence sharing.
* **🛡️ Citizen Audit:** Direct access to official tender documents via deep links.

## 🛠️ Tech Stack & Architecture

* **Frontend Core:** React.js with advanced hooks (`useCallback`, `useRef`).
* **UI/UX:** Tailwind CSS + Framer Motion for a fluid "Premium Dark Mode" interface.
* **Native Integration:** Capacitor.js for hardware and network API access.
* **Data Handling:** High-performance XML Parser for processing official ATOM feeds.

## 🏛️ Official Data Sources
Information integrity is our priority. Data is retrieved from:
* **Plataforma de Contratación del Sector Público.**
* **Sistema de Información de Contratación Pública del Estado.**
* *Automatic updates every time the "Vault" is opened.*

## ⚙️ Setup and Deployment

### Prerequisites
* `Node.js` (v18+)
* `npm` or `yarn`

### Steps
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Neo11R/ElRastreador.git](https://github.com/Neo11R/ElRastreador.git)
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Security Configuration:**
    Edit the security constants in `src/App.tsx` with your own AdMob IDs and Proxy URL.
4.  **Run in development:**
    ```bash
    npm run dev
    ```

## 💰 Support Public Transparency

This is an open-source project maintained by the community. If you find this tool useful for investigation or auditing, please consider making a donation to keep the data servers active.

* **USDT (TRC-20 Network):** `TFMwRuM6cneJWoafKuFfJKvMTbn5jAjycc`
* **Network:** Tron (TRC20)

---
*Disclaimer: This tool is not affiliated with any government entity. It is an independent viewer for official public data.*
