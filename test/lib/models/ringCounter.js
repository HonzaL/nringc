
/**
 * Test script
 */

var options = {
    pgUri: "postgres://postgres:Nordit0276@192.168.2.12/Lomna",
    tableName: "arDCBP_xslow",
    reportTitle: "Spotřeba surovin",
    coldef: [
	{_id: 'diSpotr_Davk0_Mouka1', title: 'Mouka'},
	{_id: 'diSpotr_Davk2_Voda', title: 'Voda'},
	{_id: 'diSpotr_Davk4_Drozdi', title: 'Droždí'},
	{_id: 'diSpotr_Davk5_Olej', title: 'Olej'},
	{_id: 'diSpotr_Davk6_SypkaA', title: 'Sypká A'},
	{_id: 'diSpotr_Davk7_SypkaB', title: 'Sypká B'},
	{_id: 'diSpotr_Davk8_RucniOlej', title: 'Ruční olej'}
    ]
}
  , RingCountersModel = require(process.cwd() + "/lib/models/ringCounter")(options)

describe('ringCounter', function() {
  it('Ring counter model', function(done) {
      var query = {

      }
      RingCountersModel.index({}, query, function(err, report) {
	  console.log(report);
	  done();
      })
  })
})
