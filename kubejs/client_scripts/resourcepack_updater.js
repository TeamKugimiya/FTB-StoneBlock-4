const Minecraft = Java.loadClass("net.minecraft.client.Minecraft");
const ResourceOverridesManager = Java.loadClass("fuzs.resourcepackoverrides.client.data.ResourceOverridesManager");

const TARGET_LANGUAGE = "zh_tw";

function updateResourcePacks(instance) {
    let defaultResourcePacks = ResourceOverridesManager.getDefaultResourcePacks(true);
    if (defaultResourcePacks == null || defaultResourcePacks.size() === 0) {
        console.info("[ResourcePackUpdater] 沒有設定預設資源包，跳過");
        return false;
    }

    let currentResourcePacks = instance.options.resourcePacks;

    let userPacks = [];
    for (let i = 0; i < currentResourcePacks.size(); ++i) {
        let packStr = "" + currentResourcePacks.get(i);
        if (packStr.startsWith("file/") && !defaultResourcePacks.contains(packStr)) {
            userPacks.push(packStr);
        }
    }

    let newResourcePacks = [];
    for (let i = 0; i < userPacks.length; ++i) {
        newResourcePacks.push(userPacks[i]);
    }
    for (let i = 0; i < defaultResourcePacks.size(); ++i) {
        newResourcePacks.push("" + defaultResourcePacks.get(i));
    }

    let currentFilePacks = [];
    for (let i = 0; i < currentResourcePacks.size(); ++i) {
        let packStr = "" + currentResourcePacks.get(i);
        if (packStr.startsWith("file/")) {
            currentFilePacks.push(packStr);
        }
    }

    let needModification = false;
    if (currentFilePacks.length !== newResourcePacks.length) {
        needModification = true;
    } else {
        for (let i = 0; i < newResourcePacks.length; ++i) {
            if (currentFilePacks[i] !== newResourcePacks[i]) {
                needModification = true;
                break;
            }
        }
    }

    if (needModification) {
        currentResourcePacks.clear();
        for (let i = 0; i < newResourcePacks.length; ++i) {
            currentResourcePacks.add(newResourcePacks[i]);
        }
        console.info("[ResourcePackUpdater] 資源包已更新: " + newResourcePacks.join(", "));
        return true;
    }

    console.info("[ResourcePackUpdater] 資源包清單正確，無需修改");
    return false;
}

function updateLanguage(instance) {
    let currentLang = instance.options.languageCode;
    if (currentLang !== TARGET_LANGUAGE) {
        instance.options.languageCode = TARGET_LANGUAGE;
        console.info("[ResourcePackUpdater] 語言從 " + currentLang + " 切換至 " + TARGET_LANGUAGE);
        return true;
    }
    console.info("[ResourcePackUpdater] 語言已是 " + TARGET_LANGUAGE);
    return false;
}

{
    try {
        let instance = Minecraft.getInstance();
        if (instance != null && instance.options != null) {
            let changed = false;
            changed = updateResourcePacks(instance) || changed;
            changed = updateLanguage(instance) || changed;

            if (changed) {
                instance.options.save();
                console.info("[ResourcePackUpdater] options.txt 已儲存");
            }
            console.info("[ResourcePackUpdater] 初始化完成");
        }
    } catch (e) {
        console.error("[ResourcePackUpdater] 執行失敗: " + e);
    }
}