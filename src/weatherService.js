ngapp.service('weatherService', function() {
    const weatherMap = {
        TES4: TES4Weather,
        FO3: FO3Weather,
        FNV: FNVWeather,
        TES5: TES5Weather,
        SSE: SSEWeather,
        FO4: FO4Weather
    };

    this.Weather = weatherMap[xelib.GetGlobal('AppName')];
});