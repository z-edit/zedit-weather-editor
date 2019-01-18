class Weather {
    static get colorLabels() {
        return ['Sunrise', 'Day', 'Sunset', 'Night'];
    }

    constructor(handle) {
        this.handle = handle;
        this.cache = {};
    }

    release() {
        Object.values(this.cache).forEach(id => xelib.Release(id));
    }

    cacheElement(path) {
        if (!this.cache.hasOwnProperty(path))
            this.cache[path] = xelib.GetElement(this.handle, path);
        return this.cache[path];
    }

    getRgb(handle, path) {
        let red = xelib.GetIntValue(handle, `${path}\\Red`),
            green = xelib.GetIntValue(handle, `${path}\\Green`),
            blue = xelib.GetIntValue(handle, `${path}\\Blue`);
        return [red, green, blue];
    }

    setRgb(path, color) {
        xelib.SetIntValue(this.handle, `${path}\\Red`, color.channel.red);
        xelib.SetIntValue(this.handle, `${path}\\Green`, color.channel.green);
        xelib.SetIntValue(this.handle, `${path}\\Blue`, color.channel.blue);
    }

    getCloudLayers() {
        this.cloudLayers = this.cloudTexturePaths.map((path, index) => {
            let texture = xelib.GetValue(this.handle, path),
                speed = this.getCloudLayerSpeed(index),
                disabled = this.getCloudLayerDisabled(index, texture),
                colors = this.getCloudLayerColors(index);
            return { index, disabled, speed, texture, colors };
        });
        return this.cloudLayers;
    }

    getDALC() {
        return this.dalc = null;
    }

    saveDALC() {}

    getWeatherColors() {
        this.colors = [];
        xelib.WithEachHandle(xelib.GetElements(this.handle, 'NAM0'), h => {
            let group = { label: xelib.Name(h) };
            Weather.colorLabels.forEach(label => {
                let [r, g, b] = this.getRgb(h, label);
                group[label] = new Color(`rgb(${r}, ${g}, ${b})`);
            });
            this.colors.push(group);
        });
        return this.colors;
    }

    saveWeatherColors() {
        this.colors.forEach(group => {
            Weather.colorLabels.forEach(label => {
                this.setRgb(`NAM0\\${group.label}\\${label}`, group[label]);
            });
        });
    }

    saveCloudLayerTexture(layer) {
        let texturePath = this.cloudTexturePaths[layer.index];
        xelib.SetValue(this.handle, texturePath, layer.texture);
    }

    saveCloudLayerSpeed() {}
    saveCloudLayerDisabled() {}
    saveCloudLayerColors() {}

    saveCloudLayers() {
        this.cloudLayers.forEach(layer => {
            this.saveCloudLayerTexture(layer);
            this.saveCloudLayerSpeed(layer);
            this.saveCloudLayerDisabled(layer);
            this.saveCloudLayerColors(layer);
        });
    }

    save() {
        this.saveCloudLayers();
        this.saveWeatherColors();
        this.saveDALC();
    }
}