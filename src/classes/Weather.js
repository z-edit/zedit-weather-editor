class Weather {
    static colorLabels = ['Sunrise', 'Day', 'Sunset', 'Night'];

    constructor(handle) {
        this.handle = handle;
        this.cache = {};
    }

    cacheElement = path => {
        if (!this.cache.hasOwnProperty(path))
            this.cache[path] = xelib.GetElement(this.handle, path);
        return this.cache[path];
    };

    getCloudLayers = () => {
        return this.cloudTexturePaths.map((path, index) => {
            let texture = xelib.GetValue(this.handle, path),
                speed = this.getCloudLayerSpeed(index),
                disabled = this.getCloudLayerDisabled(index, texture),
                colors = this.getCloudLayerColors(index);
            return { index, disabled, speed, texture, colors };
        });
    };

    save = () => {
        // TODO
    };
}