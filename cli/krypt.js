#!/usr/bin/env node

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const args = process.argv.slice(2);
const CONFIG_FILE = "krypt.json";
const BASE_URL = process.env.KRYPT_API_URL || "https://krypt-zeta-eight.vercel.app/api/v1";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function showHelp() {
  console.log(`
Krypt CLI - Secure Environment Variable Manager

Usage:
  krypt <command> [options]

Commands:
  init          Initialize a new krypt.json configuration file.
  pull          Pull secrets from the Krypt API.

Options (pull):
  [environment] Specific environment to pull (e.g., development, staging).
  --all         Pull all environments in the project.
  --token       Your Krypt API Key. Overrides the token in krypt.json.
  --output      Target file to write secrets to. (Default: .env.[envName])
  --reselect    Force re-selection of project.

Examples:
  krypt init
  krypt pull
  krypt pull development
  krypt pull --all
  krypt pull staging --output=.env.stg
  `);
  process.exit(0);
}

async function initConfig() {
  const targetPath = path.join(process.cwd(), CONFIG_FILE);
  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  ${CONFIG_FILE} already exists.`);
  }

  let token = args.find((arg) => arg.startsWith("--token="))?.split("=")[1];

  if (!token) {
    if (!process.stdin.isTTY) {
      console.error("❌ Error: Non-interactive environment detected. Please provide --token=...");
      process.exit(1);
    }
    console.log("Welcome to Krypt! Let's get you set up.");
    token = await question("🔑 Enter your Environment API Key: ");
  }

  if (!token) {
    console.error("❌ Error: API Key is required.");
    process.exit(1);
  }

  const defaultConf = {
    token: token.trim(),
    projectSlug: ""
  };

  fs.writeFileSync(targetPath, JSON.stringify(defaultConf, null, 2));
  console.log(`✅ Initialized ${CONFIG_FILE}`);
  console.log(`Now you can run 'krypt pull' to fetch your secrets.`);
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

function saveConfig(config) {
  const targetPath = path.join(process.cwd(), CONFIG_FILE);
  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
}

async function fetchFromApi(endpoint, token) {
  const apiUrl = endpoint.startsWith("http") ? endpoint : `${BASE_URL}/${endpoint}`;
  
  return new Promise((resolve, reject) => {
    const client = apiUrl.startsWith("https") ? https : http;
    
    const req = client.get(
      apiUrl,
      {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        
        res.on("end", () => {
          try {
            const parsedData = JSON.parse(data);
            if (res.statusCode === 200) {
              resolve(parsedData);
            } else {
              reject(new Error(parsedData.error || `API Error: ${res.statusCode}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
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
    await initConfig();
  }

  if (command === "pull") {
    const config = loadConfig();
    
    const tokenArg = args.find((arg) => arg.startsWith("--token="));
    const outputArg = args.find((arg) => arg.startsWith("--output="));
    const reselect = args.includes("--reselect");
    const pullAll = args.includes("--all");
    
    // The environment name can be the 2nd argument (after 'pull') if it's not a flag
    const envArg = args.slice(1).find(arg => !arg.startsWith("-"));

    const token = tokenArg ? tokenArg.split("=")[1] : config.token;

    if (!token) {
      console.error("❌ Error: Missing API Key.");
      console.log("Run 'krypt init' or provide --token=<your_api_key>");
      process.exit(1);
    }

    try {
      let projectSlug = config.projectSlug;

      if (!projectSlug || reselect) {
        console.log("🔍 Fetching your projects...");
        const info = await fetchFromApi("info", token);
        const { projects } = info;

        if (!projects || projects.length === 0) {
          console.error("❌ No projects found on your account.");
          process.exit(1);
        }

        console.log("\nSelect a Project:");
        projects.forEach((p, i) => console.log(`  [${i + 1}] ${p.name} (/${p.slug})`));
        const pChoice = await question("\nEnter number: ");
        const project = projects[parseInt(pChoice) - 1];

        if (!project) {
          console.error("❌ Invalid choice.");
          process.exit(1);
        }

        projectSlug = project.slug;
        config.projectSlug = projectSlug;
        saveConfig(config);
        console.log(`✨ Selected Project: ${project.name}`);
      }

      // Fetch project info to get available environments
      const info = await fetchFromApi("info", token);
      const project = info.projects.find(p => p.slug === projectSlug);

      if (!project) {
        console.error(`❌ Error: Project ${projectSlug} not found or access denied.`);
        console.log("Try running with --reselect");
        process.exit(1);
      }

      let envsToPull = [];

      if (pullAll) {
        envsToPull = project.environments.filter(e => e.name !== "universal");
      } else if (envArg) {
        const found = project.environments.find(e => e.name === envArg.toLowerCase());
        if (!found) {
          console.error(`❌ Error: Environment '${envArg}' not found in project ${project.name}.`);
          console.log("Available environments:", project.environments.map(e => e.name).join(", "));
          process.exit(1);
        }
        envsToPull = [found];
      } else {
        // Interactive selection if nothing specified
        console.log(`\nSelect Environment for ${project.name}:`);
        project.environments.forEach((e, i) => console.log(`  [${i + 1}] ${e.name}`));
        const eChoice = await question("\nEnter number: ");
        const env = project.environments[parseInt(eChoice) - 1];

        if (!env) {
          console.error("❌ Invalid choice.");
          process.exit(1);
        }
        envsToPull = [env];
      }

      for (const env of envsToPull) {
        console.log(`🔒 Pulling secrets for '${env.name}'...`);
        const response = await fetchFromApi(`pull?projectSlug=${projectSlug}&envName=${env.name}`, token);
        const { secrets, project: projName, environment } = response;
        
        let envContent = `# Pulled from Krypt (${projName} - ${environment})\n`;
        envContent += `# Generated at: ${new Date().toISOString()}\n\n`;
        
        for (const [key, value] of Object.entries(secrets)) {
          const safeValue = value.includes(" ") || value.includes("\n") ? `"${value.replace(/"/g, '\\"')}"` : value;
          envContent += `${key}=${safeValue}\n`;
        }

        const fileName = outputArg ? outputArg.split("=")[1] : `.env.${env.name}`;
        const targetPath = path.join(process.cwd(), fileName);
        fs.writeFileSync(targetPath, envContent);
        
        console.log(`✅ Secrets written to ${fileName}`);
      }

      console.log(`\n🎉 Done!`);
      process.exit(0);
    } catch (err) {
      console.error("❌ Error:");
      console.error(err.message);
      process.exit(1);
    }
  } else {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
  }
}

main();
