"use strict";
/**
 * Proxy Wrapper Module
 *
 * Manages mitmproxy lifecycle for capturing network requests from AI agents.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyWrapper = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class ProxyWrapper {
    constructor(config) {
        this.proxyProcess = null;
        this.config = Object.assign({ port: 8080, verbose: false }, config);
        // Look for addon script in lib folder (works for both compiled and source)
        const possiblePaths = [
            path.join(__dirname, 'mitmproxy-addon.py'), // When running from dist
            path.join(__dirname, '..', 'lib', 'mitmproxy-addon.py'), // When running from dist
            path.join(process.cwd(), 'lib', 'mitmproxy-addon.py'), // From project root
        ];
        this.addonScript = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
    }
    /**
     * Start the mitmproxy process
     */
    async start() {
        return new Promise((resolve, reject) => {
            // Check if addon script exists
            if (!fs.existsSync(this.addonScript)) {
                reject(new Error(`Addon script not found: ${this.addonScript}`));
                return;
            }
            // Start mitmdump with our addon
            const args = [
                '-s', this.addonScript,
                '--set', `logfile=${this.config.logFile}`,
                '--listen-port', this.config.port.toString(),
                '--quiet', // Suppress most output
            ];
            if (this.config.verbose) {
                console.log(`Starting mitmproxy: mitmdump ${args.join(' ')}`);
            }
            this.proxyProcess = (0, child_process_1.spawn)('mitmdump', args, {
                stdio: this.config.verbose ? 'inherit' : 'pipe',
            });
            this.proxyProcess.on('error', (error) => {
                reject(new Error(`Failed to start mitmproxy: ${error.message}`));
            });
            // Give the proxy a moment to start up
            setTimeout(() => {
                if (this.proxyProcess && !this.proxyProcess.killed) {
                    resolve();
                }
                else {
                    reject(new Error('Proxy process died unexpectedly'));
                }
            }, 1000);
        });
    }
    /**
     * Stop the mitmproxy process
     */
    async stop() {
        return new Promise((resolve) => {
            if (!this.proxyProcess) {
                resolve();
                return;
            }
            this.proxyProcess.on('close', () => {
                this.proxyProcess = null;
                resolve();
            });
            // Send SIGTERM to gracefully shut down
            this.proxyProcess.kill('SIGTERM');
            // Force kill after 5 seconds if still running
            setTimeout(() => {
                if (this.proxyProcess && !this.proxyProcess.killed) {
                    this.proxyProcess.kill('SIGKILL');
                }
            }, 5000);
        });
    }
    /**
     * Get environment variables to configure child processes to use the proxy
     */
    getProxyEnv() {
        const proxyUrl = `http://localhost:${this.config.port}`;
        return {
            HTTP_PROXY: proxyUrl,
            HTTPS_PROXY: proxyUrl,
            http_proxy: proxyUrl,
            https_proxy: proxyUrl,
            // Disable SSL verification for the proxy (needed for HTTPS interception)
            NODE_TLS_REJECT_UNAUTHORIZED: '0',
        };
    }
    /**
     * Check if mitmproxy is installed
     */
    static async checkInstalled() {
        return new Promise((resolve) => {
            const check = (0, child_process_1.spawn)('which', ['mitmdump']);
            check.on('close', (code) => {
                resolve(code === 0);
            });
            check.on('error', () => {
                resolve(false);
            });
        });
    }
    /**
     * Get installation instructions for mitmproxy
     */
    static getInstallInstructions() {
        return `
mitmproxy is not installed. Please install it:

macOS:
  brew install mitmproxy

Linux (Ubuntu/Debian):
  sudo apt-get install mitmproxy

Linux (Fedora):
  sudo dnf install mitmproxy

Using pip:
  pip install mitmproxy

For more information, visit: https://mitmproxy.org/
    `.trim();
    }
}
exports.ProxyWrapper = ProxyWrapper;
