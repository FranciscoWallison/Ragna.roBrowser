/**
 * UIVersionManager.js
 *
 * Manage Component
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @autor Vincent Thibault
 */

import Configs from '../Core/Configs.js';
import PACKETVER from '../Network/PacketVerManager.js';

const _UIAliases = {};

const UIVersionManager = {
    getUIAlias(name) {
        return name in _UIAliases ? _UIAliases[name] : false;
    },

    selectUIVersion(publicName, versionInfo) {
        let SelectedUI = versionInfo.default;
        let _maxDate = 0;

        function getUIbyGameMode(gameMode) {
            if (typeof gameMode === 'object' && Object.keys(gameMode).length > 0) {
                for (const [keydate, UI] of Object.entries(gameMode)) {
                    const dateNum = parseInt(keydate);
                    if (PACKETVER.value >= dateNum && dateNum > _maxDate) {
                        SelectedUI = UI;
                        _maxDate = dateNum;
                    }
                }
            }
        }

        // Common UI
        getUIbyGameMode(versionInfo.common);

        if (Configs.get('renewal')) {
            // Renewal only UI
            getUIbyGameMode(versionInfo.re);
        } else {
            // Classic only UI
            getUIbyGameMode(versionInfo.prere);
        }

        // Store selected UI name
        _UIAliases[publicName] = SelectedUI.name;
        console.log("%c[UIVersion] " + publicName + ": ", "color:#007000", SelectedUI.name);
        return SelectedUI;
    },

    getUIController(publicName, versionInfo) {
        let _selectedUI;

        const UIController = {
            selectUIVersion() {
                _selectedUI = UIVersionManager.selectUIVersion(publicName, versionInfo);
            },

            selectUIVersionWithJob(job) {
                _selectedUI = versionInfo.job[job] || versionInfo.job.default;
                _UIAliases[publicName] = _selectedUI.name;
                console.log("[UIVersion] " + publicName + ": ", _selectedUI.name);
            },

            selectSpecificUIVersion(version) {
                _selectedUI = versionInfo.common[version] || versionInfo.default;
                _UIAliases[publicName] = _selectedUI.name;
                console.log("[UIVersion] " + publicName + ": ", _selectedUI.name);
            },

            getUI() {
                return _selectedUI;
            }
        };

        return UIController;
    },

    // DEPRECATED
    // WILL BE REMOVED AFTER REFACTORING
    getEquipmentVersion() {
        if (Configs.get('clientVersionMode') === 'PacketVer') {
            return PACKETVER.value >= 20090601 ? 1 : 0;
        }
        return Configs.get('clientVersionMode') === 'PreRenewal' ? 0 : 1;
    },

    getWinStatsVersion() {
        if (Configs.get('clientVersionMode') === 'PacketVer') {
            return PACKETVER.value >= 20090601 ? 1 : 0;
        }
        return Configs.get('clientVersionMode') === 'PreRenewal' ? 0 : 1;
    },

    getInventoryVersion() {
        if (Configs.get('clientVersionMode') === 'PacketVer') {
            return PACKETVER.value >= 20090601 ? 1 : 0;
        }
        return Configs.get('clientVersionMode') === 'PreRenewal' ? 0 : 1;
    }
};

export default UIVersionManager;
