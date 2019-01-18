class TES4Weather extends Weather {
    constructor(handle) {
        super(handle);
        this.cloudTexturePaths = ['CNAM', 'DNAM'];
    }

    getCloudLayerSpeed(layerIndex) {
        let data = this.cacheElement('DATA - ');
        return xelib.GetIntValue(data, `[${layerIndex + 1}]`) / 255.0;
    }

    saveCloudLayerSpeed(layer) {
        let data = this.cacheElement('DATA - '),
            speedValue = Math.round(layer.speed * 255);
        xelib.SetIntValue(data, `[${layer.index + 1}]`, speedValue) ;
    }

    getCloudLayerDisabled(layerIndex, texture) {
        return !texture;
    }

    getCloudLayerColors() {
        return null;
    }
}