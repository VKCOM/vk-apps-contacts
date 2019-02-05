class OSM {
    async reverseLocation(lat, long) {
        return fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + long + '&zoom=18&addressdetails=1').then(function (response) {
            return response.json();
        })
    }
}

export default new OSM();
