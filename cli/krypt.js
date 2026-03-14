#!/usr/bin/env node

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const CONFIG_FILE = "krypt.json";
const DEFAULT_API_URL = "http://localhost:3000/api/v1/pull";

function showHelp() {
  console.log(`
Krypt CLI - Secure Environment Variable Manager

Usage:
  krypt <command> [options]

Commands:
  init          Initialize a new krypt.json configuration file in the current directory.
  pull          Pull secrets from the Krypt API and write them to an env file.

Options (pull):
  --token       Your Krypt API Key. Overrides the token in krypt.json.
  --output      Target file to write secrets to. (Default: .env.krypt)

Examples:
  krypt init
  krypt pull
  krypt pull --token=krp_12345 --output=.env.local
  `);
  process.exit(0);
}

function initConfig() {
  const targetPath = path.join(process.cwd(), CONFIG_FILE);
  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  ${CONFIG_FILE} already exists at ${targetPath}`);
    process.exit(0);
  }

  const defaultConf = {
    apiUrl: DEFAULT_API_URL,
    token: "",
  };

  fs.writeFileSync(targetPath, JSON.stringify(defaultConf, null, 2));
  console.log(`✅ Initialized ${CONFIG_FILE}`);
  console.log(`Please open ${CONFIG_FILE} and paste your Krypt API Key in the "token" field. MENGINGAT INI ADALAH FILE RAHASIA, pastikan krypt.json masuk ke .gitignore Anda.`);
  process.exit(0);
}

function loadConfig() {
  const targetPath = path.join(process.cwd(), CONFIG_FILE);
  if (fs.existsSync(targetPath)) {
    try {
      const content = fs.readFileSync(targetPath, "utf-8");
      return JSON.parse(content);
    } catch (err) {
      console.error(`❌ Error reading ${CONFIG_FILE}: ${err.message}`);
      return {};
    }
  }
  return {};
}

async function pullSecrets(apiUrl, token) {
  console.log(`🔒 Connecting to Krypt API at ${apiUrl}...`);
  
  return new Promise((resolve, reject) => {
    const client = apiUrl.startsWith("https") ? https : http;
    
    const req = client.get(
      apiUrl,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${data}`));
          }
        });
      }
    );
    
    req.on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp();
  }

  const command = args[0];

  if (command === "init") {
    initConfig();
  }

  if (command === "pull") {
    const config = loadConfig();
    
    // Parse arguments
    const tokenArg = args.find((arg) => arg.startsWith("--token="));
    const outputArg = args.find((arg) => arg.startsWith("--output="));

    const token = tokenArg ? tokenArg.split("=")[1] : config.token;
    const apiUrl = config.apiUrl || DEFAULT_API_URL;
    const outputFile = outputArg ? outputArg.split("=")[1] : ".env.krypt";

    if (!token) {
      console.error("❌ Error: Missing API Key.");
      console.log("Provide it via krypt.json or --token=<your_api_key>");
      process.exit(1);
    }

    try {
      const response = await pullSecrets(apiUrl, token);
      const { project, environment, secrets } = response;
      
      console.log(`✅ Authentication successful.`);
      console.log(`🚀 Project: ${project}`);
      console.log(`🌍 Environment: ${environment}`);
      console.log(`⬇️  Pulling ${Object.keys(secrets).length} secrets...`);

      let envContent = `# Pulled from Krypt (${project} - ${environment})\n`;
      envContent += `# Generated at: ${new Date().toISOString()}\n\n`;
      
      for (const [key, value] of Object.entries(secrets)) {
        const safeValue = value.includes(" ") || value.includes("\n") ? `"${value.replace(/"/g, '\\"')}"` : value;
        envContent += `${key}=${safeValue}\n`;
      }

      const targetPath = path.join(process.cwd(), outputFile);
      fs.writeFileSync(targetPath, envContent);
      
      console.log(`\n🎉 Success! Secrets written to ${targetPath}`);
    } catch (err) {
      console.error("❌ Failed to pull secrets.");
      console.error(err.message);
      process.exit(1);
    }
  } else {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
  }
}

main();
