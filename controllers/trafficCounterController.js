var fs = require('fs');
const geolib = require('geolib');
/**
 * vehicleDataController.js
 *
 * @description :: Server-side logic for managing vehicle data.
 */
module.exports = {

    /**
     * vehicleDataController.list()
     */
    /*list: function (req, res) {
        vehicleDataModel.find()
        .populate('postedBy')
        .exec(function (err, vehicleData) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting vehicleData.',
                    error: err
                });
            }
            var data = [];
            data.vehicleData = vehicleData;
            //return res.render('vehicleData/list', data);
            return res.json(vehicleData);
        });
    },*/

    /**
     * vehicleDataController.show()
     */
    show: function (req, res) {
        var name = req.params.name;
        fs.readFile('trafficCounter.txt', 'utf8', (err, data) => {
            if (err) throw err;
            const lines = data.split('\n');
            var found;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].toLowerCase().includes(name.toLowerCase())) {
                    if (i + 1 < lines.length) {
                        found = lines[i + 1];
                        //console.log(lines[i + 1]);
                    } else {
                        found = "Empty";
                        //console.log("No next line found.");
                    }
                    break;
                }
            }


            const regex = /\d+(?:[.,]\d+)?/g;
            var numbers = found.match(regex);

            if (numbers.length > 3) {
                numbers = numbers.slice(1);
            }

            return res.json(numbers);
        });
    },

    /**
     * vehicleDataController.create()
     */
    trafficCounter: function (req, res) {
        try {
            const requestLat = req.body.lat;
            const requestLon = req.body.lon;
    
            // read coords.txt
            const coordsTxt = fs.readFileSync('coords.txt', 'utf-8');
            const coordsLines = coordsTxt.split('\n');
    
            // find nearest location
            let nearestLocation = null;
            let smallestDistance = Infinity;
            for (const line of coordsLines) {
                const parts = line.split(';');
                const lat = parseFloat(parts[3]);  // Parse string to float
                const lon = parseFloat(parts[4]);  // Parse string to float
    
                const distance = geolib.getDistance(
                    { latitude: requestLat, longitude: requestLon },
                    { latitude: lat, longitude: lon }
                );
    
                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    nearestLocation = parts.slice(0, 3).join(';');
                }
            }
    
            // If the smallest distance is greater than 250 meters, return no matching data found
            if (smallestDistance > 250) {
                return res.status(404).send('No matching data found');
            }
    
            // read data.txt
            const dataTxt = fs.readFileSync('trafficCounter.txt', 'utf-8');
            const dataLines = dataTxt.split('\n');
    
            // find matching data
            for (const line of dataLines) {
                if (line.startsWith(nearestLocation)) {
                    const parts = line.split(';');
                    return res.json({
                        location: nearestLocation,
                        data: parts.slice(3)
                    });
                }
            }
    
            res.status(404).send('No matching data found');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }    
};
