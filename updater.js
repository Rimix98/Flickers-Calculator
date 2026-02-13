// Auto-updater for Flickers Calculator
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
    currentVersion: '1.0.0',
    updateUrl: 'https://api.github.com/repos/Rimix98/Flickers-Calculator/releases/latest',
    downloadPath: './updates'
};

class Updater {
    constructor() {
        this.currentVersion = CONFIG.currentVersion;
        this.updateUrl = CONFIG.updateUrl;
    }

    async checkForUpdates() {
        return new Promise((resolve, reject) => {
            console.log('Checking for updates...');
            
            https.get(this.updateUrl, {
                headers: { 'User-Agent': 'Flickers-Calculator-Updater' }
            }, (res) => {
                let data = '';
                
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const release = JSON.parse(data);
                        
                        // Check if response is an error
                        if (release.message) {
                            console.log('GitHub API response:', release.message);
                            resolve({ hasUpdate: false, error: release.message });
                            return;
                        }
                        
                        // Check if tag_name exists
                        if (!release.tag_name) {
                            console.log('No releases found in repository');
                            resolve({ hasUpdate: false, error: 'No releases found' });
                            return;
                        }
                        
                        const latestVersion = release.tag_name.replace('v', '');
                        
                        if (this.compareVersions(latestVersion, this.currentVersion) > 0) {
                            resolve({
                                hasUpdate: true,
                                version: latestVersion,
                                downloadUrl: release.assets[0]?.browser_download_url,
                                releaseNotes: release.body
                            });
                        } else {
                            resolve({ hasUpdate: false });
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', reject);
        });
    }

    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
            if (parts1[i] > parts2[i]) return 1;
            if (parts1[i] < parts2[i]) return -1;
        }
        return 0;
    }

    async downloadUpdate(url, filename) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(CONFIG.downloadPath)) {
                fs.mkdirSync(CONFIG.downloadPath, { recursive: true });
            }

            const filePath = path.join(CONFIG.downloadPath, filename);
            const file = fs.createWriteStream(filePath);

            console.log(`Downloading update to ${filePath}...`);

            https.get(url, (response) => {
                const totalSize = parseInt(response.headers['content-length'], 10);
                let downloaded = 0;

                response.on('data', (chunk) => {
                    downloaded += chunk.length;
                    const percent = ((downloaded / totalSize) * 100).toFixed(1);
                    process.stdout.write(`\rProgress: ${percent}%`);
                });

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    console.log('\nDownload complete!');
                    resolve(filePath);
                });
            }).on('error', (err) => {
                fs.unlink(filePath, () => {});
                reject(err);
            });
        });
    }

    async installUpdate(filePath) {
        console.log('Installing update...');
        
        // For Windows installer
        if (filePath.endsWith('.exe')) {
            execSync(`start "" "${filePath}"`, { shell: true });
            console.log('Update installer launched. Please follow the installation wizard.');
        } else {
            console.log('Please manually install the update from:', filePath);
        }
    }
}

// CLI usage
if (require.main === module) {
    const updater = new Updater();
    
    (async () => {
        try {
            const updateInfo = await updater.checkForUpdates();
            
            if (updateInfo.error) {
                console.log('\nNote:', updateInfo.error);
                console.log('\nTo enable updates:');
                console.log('1. Create a GitHub repository for this project');
                console.log('2. Update "updateUrl" in update-config.json with your repo URL');
                console.log('3. Create a release with tag (e.g., v1.0.1) and upload .exe file');
                return;
            }
            
            if (updateInfo.hasUpdate) {
                console.log(`\nNew version available: ${updateInfo.version}`);
                console.log('Release notes:', updateInfo.releaseNotes);
                
                if (!updateInfo.downloadUrl) {
                    console.log('\nNo download file found in release. Please download manually.');
                    return;
                }
                
                console.log('\nDownloading update...');
                
                const filename = `flickers-calculator-${updateInfo.version}.exe`;
                const filePath = await updater.downloadUpdate(updateInfo.downloadUrl, filename);
                
                await updater.installUpdate(filePath);
            } else {
                console.log('You are using the latest version!');
            }
        } catch (error) {
            console.error('Error checking for updates:', error.message);
            console.log('\nMake sure:');
            console.log('- You have internet connection');
            console.log('- GitHub repository URL is correct in update-config.json');
            console.log('- Repository has at least one release');
        }
    })();
}

module.exports = Updater;
