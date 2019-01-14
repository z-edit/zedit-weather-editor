class TES4Weather extends Weather {
    cloudTexturePaths = ['CNAM', 'DNAM'];

    getCloudLayerSpeed = (layerIndex) => {
        let data = this.cacheElement(this.handle, 'DATA - ');
        return xelib.GetIntValue(data, `[${layerIndex + 1}]`) / 255.0;
    };

    getCloudLayerDisabled = (layerIndex, texture) => !texture;
    getCloudLayerColors = () => null;
}