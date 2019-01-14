class FO3Weather extends Weather {
    constructor(handle) {
        super(handle);
        this.cloudTexturePaths = ['DNAM', 'CNAM', 'ANAM', 'BNAM'];
    }

    getCloudLayerSpeed(layerIndex) {
        let cloudSpeed = this.cacheElement('ONAM');
        return xelib.GetIntValue(cloudSpeed, `[${layerIndex}]`) / 255.0;
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

    getCloudLayerColors(layerIndex) {
        return Weather.colorLabels.reduce((colors, label, colorIndex) => {
            colors[label] = this.getCloudLayerColor(layerIndex, colorIndex);
            return colors;
        }, {});
    };
}