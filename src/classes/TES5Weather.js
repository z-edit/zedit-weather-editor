class TES5Weather extends Weather {
    constructor(handle) {
        super(handle);
        this.cloudTexturePaths = ['00TX', '10TX', '20TX', '30TX', '40TX', '50TX', '60TX',
        '70TX', '80TX', '90TX', ':0TX', ';0TX', '<0TX', '=0TX', '>0TX', '?0TX',
        '@0TX', 'A0TX', 'B0TX', 'C0TX', 'D0TX', 'E0TX', 'F0TX', 'G0TX', 'H0TX',
        'I0TX', 'J0TX', 'K0TX', 'L0TX'];
    }

    getCloudLayerSpeed(layerIndex) {
        let xSpeeds = this.cacheElement('Cloud Speed\\QNAM'),
            ySpeeds = this.cacheElement('Cloud Speed\\RNAM');
        return {
            x: parseFloat(xelib.GetValue(xSpeeds, `[${layerIndex}]`)),
            y: parseFloat(xelib.GetValue(ySpeeds, `[${layerIndex}]`))
        }
    };

    getDisabledCloudLayers() {
        return xelib.GetEnabledFlags(this.handle, 'NAM1')
            .map(str => parseInt(str, 10))
    };

    getCloudLayerDisabled(layerIndex) {
        if (!this.hasOwnProperty('disabledLayers'))
            this.disabledLayers = this.getDisabledCloudLayers();
        return this.disabledLayers.includes(layerIndex);
    };

    getCloudLayerColor (layerIndex, colorIndex) {
        let path = `PNAM\\[${layerIndex}]\\[${colorIndex}]`,
            alphaPath = `JNAM\\[${layerIndex}]\\[${colorIndex}]`,
            [r, g, b] = this.getRgb(this.handle, path),
            alpha = xelib.GetFloatValue(this.handle, alphaPath);
        return new Color(`rgba(${r}, ${g}, ${b}, ${alpha})`);
    };

    getCloudLayerColors(layerIndex) {
        return Weather.colorLabels.reduce((colors, label, colorIndex) => {
            colors[label] = this.getCloudLayerColor(layerIndex, colorIndex);
            return colors;
        }, {});
    };

    getWeatherColors() {
        let colors = [];
        xelib.WithEachHandle(xelib.GetElements(this.handle, 'NAM0'), h => {
            let group = { label: xelib.Name(h) };
            Weather.colorLabels.forEach(label => {
                let [r, g, b] = this.getRgb(h, label);
                group[label] = new Color(`rgb(${r}, ${g}, ${b})`);
            });
            colors.push(group);
        });
        return colors;
    }
}