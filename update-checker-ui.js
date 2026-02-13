// UI integration for update checker
class UpdateChecker {
    constructor() {
        this.config = null;
        this.loadConfig();
    }

    async loadConfig() {
        try {
            const response = await fetch('update-config.json');
            this.config = await response.json();
            
            if (this.config.autoCheck) {
                this.checkForUpdates();
                setInterval(() => this.checkForUpdates(), this.config.checkInterval);
            }
        } catch (error) {
            console.log('Update config not found, skipping auto-update check');
        }
    }

    async checkForUpdates() {
        if (!this.config) return;

        try {
            const response = await fetch(this.config.updateUrl, {
                headers: { 'User-Agent': 'Flickers-Calculator' }
            });
            
            const release = await response.json();
            const latestVersion = release.tag_name.replace('v', '');
            
            if (this.compareVersions(latestVersion, this.config.version) > 0) {
                this.showUpdateNotification(latestVersion, release.html_url);
            }
        } catch (error) {
            console.log('Could not check for updates:', error.message);
        }
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

    showUpdateNotification(version, url) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span class="update-icon">🔔</span>
                <div class="update-text">
                    <strong>New version available: ${version}</strong>
                    <p>Click to download the latest version</p>
                </div>
                <button class="update-close">×</button>
            </div>
        `;
        
        notification.addEventListener('click', (e) => {
            if (!e.target.classList.contains('update-close')) {
                window.open(url, '_blank');
            }
        });

        notification.querySelector('.update-close').addEventListener('click', (e) => {
            e.stopPropagation();
            notification.remove();
        });

        document.body.appendChild(notification);

        // Add styles
        if (!document.getElementById('update-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'update-notification-styles';
            style.textContent = `
                .update-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    padding: 15px 20px;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                    max-width: 350px;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .update-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .update-icon {
                    font-size: 24px;
                }

                .update-text {
                    flex: 1;
                }

                .update-text strong {
                    display: block;
                    margin-bottom: 4px;
                }

                .update-text p {
                    margin: 0;
                    font-size: 13px;
                    opacity: 0.9;
                }

                .update-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    font-size: 24px;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }

                .update-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .update-notification:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize update checker when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new UpdateChecker();
    });
} else {
    new UpdateChecker();
}
