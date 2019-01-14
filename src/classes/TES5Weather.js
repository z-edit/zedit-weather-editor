class TES5Weather extends Weather {
    cloudTexturePaths = ['00TX', '10TX', '20TX', '30TX', '40TX', '50TX', '60TX',
        '70TX', '80TX', '90TX', ':0TX', ';0TX', '<0TX', '=0TX', '>0TX', '?0TX',
        '@0TX', 'A0TX', 'B0TX', 'C0TX', 'D0TX', 'E0TX', 'F0TX', 'G0TX', 'H0TX',
        'I0TX', 'J0TX', 'K0TX', 'L0TX'];

    getCloudLayerSpeed = (layerIndex) => {
        let xSpeeds = this.cacheElement('Cloud Speeds\\QNAM'),
            ySpeeds = this.cacheElement('Cloud Speeds\\RNAM');
        return {
            x: parseFloat(xelib.GetValue(xSpeeds, `[${layerIndex}]`)),
            y: parseFloat(xelib.GetValue(ySpeeds, `[${layerIndex}]`))
        }
    };

    getDisabledCloudLayers = () => {
        return xelib.GetEnabledFlags(this.handle, 'NAM1')
            .map(str => parseInt(str, 10))
    };

    getCloudLayerDisabled = (layerIndex) => {
        if (!this.hasOwnProperty('disabledLayers'))
            this.disabledLayers = this.getDisabledCloudLayers();
        return this.disabledLayers.includes(layerIndex);
    };

    getCloudLayerColor = (layerIndex, colorIndex) => {
        let path = `PNAM\\${layerIndex}\\${colorIndex}`,
            alphaPath = `JNAM\\${layerIndex}\\${colorIndex}`,
            red = xelib.GetIntValue(this.handle, `${path}\\Red`),
            green = xelib.GetIntValue(this.handle, `${path}\\Green`),
            blue = xelib.GetIntValue(this.handle, `${path}\\Blue`),
            alpha = xelib.GetFloatValue(this.handle, alphaPath) * 255;
        return new Color(`rgba(${red}, ${green}, ${blue}, ${alpha})`);
    };

    getCloudLayerColors = (layerIndex) => {
        return Weather.colorLabels.reduce((colors, label, colorIndex) => {
            colors[label] = this.getCloudLayerColor(layerIndex, colorIndex);
            return colors;
        });
    };
}