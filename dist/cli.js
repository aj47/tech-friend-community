#!/usr/bin/env node
"use strict";
/**
 * Agent Battler CLI
 *
 * A wrapper CLI that captures network requests made by AI coding agents
 * using mitmproxy instead of asciicinema.
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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const proxy_wrapper_1 = require("./proxy-wrapper");
const SUPPORTED_AGENTS = ['claude', 'auggie', 'cursor', 'copilot', 'codeium', 'chatgpt'];
function parseArgs() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        return null;
    }
    return {
        agent: args[0].toLowerCase(),
        instruction: args.slice(1).join(' '),
    };
}
function printUsage() {
    console.error('Usage: agent-battler <agent> <instruction>');
    console.error('');
    console.error('Examples:');
    console.error('  agent-battler claude "Fix the login bug"');
    console.error('  agent-battler auggie "Add user authentication"');
    console.error('  agent-battler cursor "Refactor the API"');
    console.error('');
    console.error(`Supported agents: ${SUPPORTED_AGENTS.join(', ')}`);
}
async function main() {
    const command = parseArgs();
    if (!command) {
        printUsage();
        process.exit(1);
    }
    if (!SUPPORTED_AGENTS.includes(command.agent)) {
        console.error(`Error: Unsupported agent "${command.agent}"`);
        console.error(`Supported agents: ${SUPPORTED_AGENTS.join(', ')}`);
        process.exit(1);
    }
    console.log(`🤖 Agent Battler - Running ${command.agent}`);
    console.log(`📝 Instruction: "${command.instruction}"`);
    console.log('📡 Network requests will be captured using mitmproxy');
    console.log('');
    // Check if mitmproxy is installed
    const isInstalled = await proxy_wrapper_1.ProxyWrapper.checkInstalled();
    if (!isInstalled) {
        console.error('❌ Error: mitmproxy is not installed');
        console.error('');
        console.error(proxy_wrapper_1.ProxyWrapper.getInstallInstructions());
        process.exit(1);
    }
    // Create logs directory
    const logsDir = path.join(process.cwd(), 'agent-battler-logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    // Generate log file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logsDir, `${command.agent}-${timestamp}.json`);
    console.log(`📝 Network logs will be saved to: ${logFile}`);
    console.log('');
    // Create proxy wrapper
    const proxy = new proxy_wrapper_1.ProxyWrapper({
        logFile,
        verbose: process.env.VERBOSE === '1',
    });
    try {
        // Start the proxy
        console.log('🚀 Starting mitmproxy...');
        await proxy.start();
        console.log('✅ Proxy started successfully');
        console.log('');
        // Execute the agent command with proxy environment
        await executeAgentCommand(command, proxy);
        console.log('');
        console.log('✅ Command completed');
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
    finally {
        // Stop the proxy
        console.log('🛑 Stopping proxy...');
        await proxy.stop();
        console.log('✅ Proxy stopped');
        console.log('');
        console.log(`📊 Network capture saved to: ${logFile}`);
    }
}
async function executeAgentCommand(command, proxy) {
    return new Promise((resolve, reject) => {
        console.log(`⚠️  Note: This is a demonstration implementation.`);
        console.log(`    To fully integrate with ${command.agent}, you would need to:`);
        console.log(`    1. Configure ${command.agent} to use the proxy`);
        console.log(`    2. Execute the actual ${command.agent} command`);
        console.log(`    3. Pass the instruction to the agent`);
        console.log('');
        console.log('For now, simulating a 5-second agent execution...');
        // Simulate agent execution
        setTimeout(() => {
            console.log(`✅ ${command.agent} execution completed (simulated)`);
            resolve();
        }, 5000);
    });
}
// Run the CLI
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
