/**
 * Created by championswimmer on 25/11/16.
 */
const Sequelize = require('sequelize');

require('pg').defaults.parseInt8 = true;

const DB_HOST = process.env.NODE_MYSQL_HOST || "localhost";
const DB_USER = process.env.SHORTURL_MYSQL_USER || "shorturl";
const DB_PASS = process.env.SHORTURL_MYSQL_PASS || "shorturl";
const DB_NAME = process.env.SHORTURL_MYSQL_DBNAME || "shorturl";


const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: 'postgres',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});


const URL = sequelize.define('url', {
    code    : { type: Sequelize.BIGINT, primaryKey: true },
    longURL : { type: Sequelize.STRING },
    hits    : { type: Sequelize.INTEGER, defaultValue: 0 }
});

const Event = sequelize.define('event', {
    time    : { type: Sequelize.DATE },
    from    : { type: Sequelize.STRING }
});

const Alias = sequelize.define('alias', {

});

const User = sequelize.define('user', {
    username:   {type: Sequelize.STRING },
    password:   {type: Sequelize.STRING }
});

Event.belongsTo(URL);

sequelize.sync();
//sequelize.sync({force: true});


module.exports = {
    addUrl: function (code, longURL, alias, done, failed) {
        if (!alias) {
            URL.create({
                code: code,
                longURL: longURL
            }).then(function (url) {
                done(url.code);
            }).catch(function (error) {
                console.log(error);
                failed(error);
            })
        } else {
            //handle longer than 9 with alias map
        }
    },
    fetchUrl: function(code, from, done, failed) {
        URL.findById(code).then(function (url) {
            done(url.longURL);
            Event.create({
                from: from,
                time: new Date(),
                urlCode: url.code
            }).then(function () {url.increment('hits')});
        }).catch(function(error) {
            failed(error)
        })
    }
};