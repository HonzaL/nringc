
/**
 * Module dependencies
 */

var pg = require('pg')
  , Pktime = require('pktime')

module.exports = function(options) { 
    var rcm = new RingCountersModel();
    rcm.pgUri = options.pgUri;
    rcm.coldef = options.coldef;
    // default hodnota hodiny zlomu
    rcm.breakHour = options.breakHour || 12;
    rcm.tableName = options.tableName;
    rcm.reportTitle = options.reportTitle;
    return rcm;
}

var RingCounters = function() {
    this.header = [{_id: "day", title: "Den"}];
    this.title = "";
    this.body = [];
    this.footer = [{day: 'Celkem'}];
    this.reportHeader = [];
};

function RingCountersModel() {} 

RingCountersModel.prototype.index = function(params, query, fn) {
    var now = new Date()
      , date = new Date()
      , month = query.month || date.getMonth()+1
      , year = query.year || date.getFullYear()
      , _self = this

    var response = new RingCounters();
    response.title = this.reportTitle;
    // Nastavime vsechny pozadovane sloupce
    for(var i in this.coldef) {
	response.header.push(this.coldef[i]);
    }
    // Nastavime hlavicku
    response.reportHeader.push({title: "Výkaz pro", value: month + "/" + year});
    response.reportHeader.push({title: "Hodina zlomu", value: this.breakHour + ":00"});
    //TODO moznost zadavat jednotku pro ruznetypy kruhovych citacu
    response.reportHeader.push({title: "Jednotka", value: "kg"});

    // Client na postgresDB
    var client = new pg.Client(this.pgUri);
    
    // konexe do db
    client.connect();
    client.on('drain', function() {
	client.end();
	fn(null, response);
    })
   
    // pro kazdy den v danem mesici se dotazuji do db
    var pocetDni = new Date(year, month, 0, 0, 0, 0).getDate()
      , dbq = []

    for(var i = 1; i <= pocetDni; i++) {
	// pro kazdy den se dotazi na data
	// nastaveni pocatecniho casu
	var beginPktime = new Pktime().setValue(new Date(year, month-1, i, -(24-this.breakHour), 0, 0, 0)).getPktime()
	  , endPktime = new Pktime().setValue(new Date(year, month-1, i, this.breakHour, 0, 0, 0)).getPktime()-1;
	dbq[beginPktime] = client.query("SELECT t.* FROM (SELECT COALESCE(max(pktime), 0) pktime FROM \"" + this.tableName + "\" WHERE pktime < $1 UNION ALL SELECT COALESCE(max(pktime), (SELECT COALESCE(max(pktime), 0) FROM \"" + this.tableName + "\" WHERE pktime < $1)) pktime FROM \"" + this.tableName + "\" WHERE pktime BETWEEN $1 AND $2) b LEFT JOIN \"" + this.tableName + "\" t ON t.pktime = b.pktime ORDER BY b.pktime ASC", [beginPktime, endPktime]);
	dbq[beginPktime].on('row', function(row, result) {
	    result.rows.push(row);
	});
	dbq[beginPktime].on('end', function(result) {
	    // Projdeme data dle konfigurace a vlozime do reportu (ReportDataRow - rdr)
	    var rdr = {};
	    for(var j in _self.coldef) {
		// pro kazdy sortiment najdeme hodnotu a vlozime do radku
		rdr[_self.coldef[j]._id] = (result.rows[1][_self.coldef[j]._id] || 0) - (result.rows[0][_self.coldef[j]._id] || 0);
		response.footer[0][_self.coldef[j]._id] = (response.footer[0][_self.coldef[j]._id] || 0) + rdr[_self.coldef[j]._id];
	    }
	    // Vytvoreny zaznam radku danho dne vlozime do reportu
	    response.body.push(rdr);
	})


    }

//    fn(null, response);
    
}
