import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { deflateRawSync } from "node:zlib";

const root = process.cwd();
const distDir = path.join(root, "dist");
const releaseDir = path.join(root, "release");

function run(executable, args) {
    const result = spawnSync(executable, args, {
        cwd: root,
        stdio: "inherit",
        shell: false,
    });
    if (result.error) {
        console.error(result.error.message);
        process.exit(1);
    }
    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

function runPnpm(args) {
    if (process.env.npm_execpath) {
        run(process.execPath, [process.env.npm_execpath, ...args]);
        return;
    }
    run(process.platform === "win32" ? "pnpm.cmd" : "pnpm", args);
}

function collectFiles(directory, base = directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectFiles(fullPath, base));
        } else if (entry.isFile()) {
            files.push({
                fullPath,
                zipPath: path.relative(base, fullPath).replaceAll(path.sep, "/"),
            });
        }
    }
    return files.sort((a, b) => a.zipPath.localeCompare(b.zipPath));
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[i] = c >>> 0;
}

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
    const year = Math.max(date.getFullYear(), 1980);
    const dosTime =
        (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { dosDate, dosTime };
}

function createZip(files, outputPath) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const { dosDate, dosTime } = dosDateTime();

    for (const file of files) {
        const data = fs.readFileSync(file.fullPath);
        const compressed = deflateRawSync(data, { level: 9 });
        const name = Buffer.from(file.zipPath);
        const crc = crc32(data);

        const localHeader = Buffer.alloc(30);
        localHeader.writeUInt32LE(0x04034b50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt16LE(0, 6);
        localHeader.writeUInt16LE(8, 8);
        localHeader.writeUInt16LE(dosTime, 10);
        localHeader.writeUInt16LE(dosDate, 12);
        localHeader.writeUInt32LE(crc, 14);
        localHeader.writeUInt32LE(compressed.length, 18);
        localHeader.writeUInt32LE(data.length, 22);
        localHeader.writeUInt16LE(name.length, 26);
        localHeader.writeUInt16LE(0, 28);

        const centralHeader = Buffer.alloc(46);
        centralHeader.writeUInt32LE(0x02014b50, 0);
        centralHeader.writeUInt16LE(20, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt16LE(0, 8);
        centralHeader.writeUInt16LE(8, 10);
        centralHeader.writeUInt16LE(dosTime, 12);
        centralHeader.writeUInt16LE(dosDate, 14);
        centralHeader.writeUInt32LE(crc, 16);
        centralHeader.writeUInt32LE(compressed.length, 20);
        centralHeader.writeUInt32LE(data.length, 24);
        centralHeader.writeUInt16LE(name.length, 28);
        centralHeader.writeUInt16LE(0, 30);
        centralHeader.writeUInt16LE(0, 32);
        centralHeader.writeUInt16LE(0, 34);
        centralHeader.writeUInt16LE(0, 36);
        centralHeader.writeUInt32LE(0, 38);
        centralHeader.writeUInt32LE(offset, 42);

        localParts.push(localHeader, name, compressed);
        centralParts.push(centralHeader, name);
        offset += localHeader.length + name.length + compressed.length;
    }

    const centralDirectory = Buffer.concat(centralParts);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(0, 4);
    end.writeUInt16LE(0, 6);
    end.writeUInt16LE(files.length, 8);
    end.writeUInt16LE(files.length, 10);
    end.writeUInt32LE(centralDirectory.length, 12);
    end.writeUInt32LE(offset, 16);
    end.writeUInt16LE(0, 20);

    fs.writeFileSync(outputPath, Buffer.concat([...localParts, centralDirectory, end]));
}

runPnpm(["run", "build"]);
run(process.execPath, ["scripts/verify-extension-package.mjs"]);

const manifest = JSON.parse(fs.readFileSync(path.join(distDir, "manifest.json"), "utf8"));
const version = manifest.version ?? "0.1.0";
const zipPath = path.join(releaseDir, `Local-AI-Side-Panel-${version}.zip`);
const obsoleteZipPath = path.join(releaseDir, `Gemma-Local-AI-${version}.zip`);

fs.mkdirSync(releaseDir, { recursive: true });
fs.rmSync(zipPath, { force: true });
fs.rmSync(obsoleteZipPath, { force: true });

const files = collectFiles(distDir);
createZip(files, zipPath);

console.log(`Created ${path.relative(root, zipPath)}`);
console.log(`size=${fs.statSync(zipPath).size} bytes`);
console.log("zip_root_contents:");
for (const file of files) console.log(`- ${file.zipPath}`);
