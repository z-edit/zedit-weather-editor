class FO3Weather extends Weather {
    constructor(handle) {
        super(handle);
        this.cloudTexturePaths = ['DNAM', 'CNAM', 'ANAM', 'BNAM'];
    }

    getCloudLayerSpeed(layerIndex) {
        let cloudSpeed = this.cacheElement('ONAM');
        return xelib.GetIntValue(cloudSpeed, `[${layerIndex}]`) / 255.0;
    }

    saveCloudLayerSpeed(layer) {
        let cloudSpeed = this.cacheElement('ONAM'),
            speedValue = Math.round(layer.speed * 255);
        xelib.SetIntValue(cloudSpeed, `[${layer.index}]`, speedValue);
    }

    getCloudLayerDisabled(layerIndex, texture) {
        return !texture;
    }

    getCloudLayerColor(layerIndex, colorIndex) {
        let path = `PNAM\\[${layerIndex}]\\[${colorIndex}]`,
            red = xelib.GetIntValue(this.handle, `${path}\\Red`),
            green = xelib.GetIntValue(this.handle, `${path}\\Green`),
            blue = xelib.GetIntValue(this.handle, `${path}\\Blue`);
        return new Color(`rgb(${red}, ${green}, ${blue})`);
    }

    saveCloudLayerColor(layer, label, colorIndex) {
        let path = `PNAM\\[${layer.index}]\\[${colorIndex}]`;
        this.setRgb(path, layer[label]);
    }

    getCloudLayerColors(layerIndex) {
        return Weather.colorLabels.reduce((colors, label, colorIndex) => {
            colors[label] = this.getCloudLayerColor(layerIndex, colorIndex);
            return colors;
        }, {});
    }

    saveCloudLayerColors(layer) {
        Weather.colorLabels.forEach((label, index) => {
            this.saveCloudLayerColor(layer, label, index);
        });
    }
}