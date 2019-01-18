class TES5Weather extends Weather {
    constructor(handle) {
        super(handle);
        this.cloudTexturePaths = [
            '00TX', '10TX', '20TX', '30TX', '40TX', '50TX', '60TX', '70TX',
            '80TX', '90TX', ':0TX', ';0TX', '<0TX', '=0TX', '>0TX', '?0TX',
            '@0TX', 'A0TX', 'B0TX', 'C0TX', 'D0TX', 'E0TX', 'F0TX', 'G0TX',
            'H0TX', 'I0TX', 'J0TX', 'K0TX', 'L0TX'
        ];
        this.dalcPaths = [
            'Directional\\X+', 'Directional\\X-', 'Directional\\Y+',
            'Directional\\Y-', 'Directional\\Z+', 'Directional\\Z-'
        ];
    }

    getCloudLayerSpeed(layerIndex) {
        let xSpeeds = this.cacheElement('Cloud Speed\\QNAM'),
            ySpeeds = this.cacheElement('Cloud Speed\\RNAM');
        return {
            x: parseFloat(xelib.GetValue(xSpeeds, `[${layerIndex}]`)),
            y: parseFloat(xelib.GetValue(ySpeeds, `[${layerIndex}]`))
        }
    }

    saveCloudLayerSpeed(layer) {
        let xSpeeds = this.cacheElement('Cloud Speed\\QNAM'),
            ySpeeds = this.cacheElement('Cloud Speed\\RNAM');
        xelib.SetValue(xSpeeds, `[${layer.index}]`, layer.speed.x);
        xelib.SetValue(ySpeeds, `[${layer.index}]`, layer.speed.y);
    }

    getDisabledCloudLayers() {
        return xelib.GetEnabledFlags(this.handle, 'NAM1')
            .map(str => parseInt(str, 10))
    }

    getCloudLayerDisabled(layerIndex) {
        if (!this.hasOwnProperty('disabledLayers'))
            this.disabledLayers = this.getDisabledCloudLayers();
        return this.disabledLayers.includes(layerIndex);
    }

    saveCloudLayerDisabled(layer) {
        xelib.SetFlag(this.handle, 'NAM1', `${layer.index}`, layer.disabled);
    }

    getCloudLayerColor(layerIndex, colorIndex) {
        let path = `PNAM\\[${layerIndex}]\\[${colorIndex}]`,
            alphaPath = `JNAM\\[${layerIndex}]\\[${colorIndex}]`,
            [r, g, b] = this.getRgb(this.handle, path),
            alpha = xelib.GetFloatValue(this.handle, alphaPath);
        return new Color(`rgba(${r}, ${g}, ${b}, ${alpha})`);
    }

    saveCloudLayerColor(layer, label, colorIndex) {
        let path = `PNAM\\[${layer.index}]\\[${colorIndex}]`,
            alphaPath = `JNAM\\[${layerIndex}]\\[${colorIndex}]`,
            alphaValue = layer[label].channel.alpha / 255.0;
        this.setRgb(path, layer[label]);
        xelib.SetFloatValue(this.handle, alphaPath, alphaValue);
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

    getDALC() {
        this.dalc = this.dalcPaths.map(path => ({
            path: path.replace('Directional\\', '')
        }));
        let path = 'Directional Ambient Lighting Colors';
        xelib.WithEachHandle(xelib.GetElements(this.handle, path), h => {
            let label = xelib.Name(h).replace('DALC - ', '');
            this.dalcPaths.forEach((path, index) => {
                let [r, g, b] = this.getRgb(h, path);
                this.dalc[index][label] = new Color(`rgb(${r}, ${g}, ${b})`);
            });
        });
        return this.dalc;
    }

    saveDALC() {
        let basePath = 'Directional Ambient Lighting Colors';
        this.dalc.forEach(item => {
            Weather.colorLabels.forEach((label, i) => {
                let path = `${basePath}\\[${i}]\\Directional\\${item.path}`;
                this.setRgb(path, item[label]);
            });
        });
    }
}