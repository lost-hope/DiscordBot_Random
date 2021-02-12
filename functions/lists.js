'use strict';

module.exports = {
    activity: require('../lists.json').activity,
    error: require('../lists.json').error,

    reloadLists: () => {
        delete require.cache[require.resolve(`../lists.json`)]
        module.exports.activity = require('../lists.json').activity;
        module.exports.error = require('../lists.json').error;
    }
}
