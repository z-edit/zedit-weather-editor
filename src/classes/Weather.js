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

    getCloudLayers() {
        return this.cloudTexturePaths.map((path, index) => {
            let texture = xelib.GetValue(this.handle, path),
                speed = this.getCloudLayerSpeed(index),
                disabled = this.getCloudLayerDisabled(index, texture),
                colors = this.getCloudLayerColors(index);
            return { index, disabled, speed, texture, colors };
        });
    }

    save() {
        // TODO
    }
}