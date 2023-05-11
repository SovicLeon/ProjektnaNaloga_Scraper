var fs = require('fs');
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
        
        return res.json("a");
    }
};
