var knex = require('./knex.js');

function Events() {
    return knex('events');
}

function Schools() {
    return knex('schools');
}

function Results() {
    return knex('results');
}

function Users() {
	return knex('users');
}

function Athletes() {
	return knex('athletes');
}

// *** queries *** //

function getAllEvents() { 
    return Events().select();
}
  
function getAthletes(schoolid, yearcutoff) { 
	if (yearcutoff == 'current') {
		yearcutoff = new Date().getFullYear();
		if (new Date().getMonth() > 8) {
			yearcutoff++;
		}
	}
	return Athletes().select().
		where({'schoolid': schoolid}).
		where('gradyear', '>=', yearcutoff).
		orderBy('gradyear').orderBy('lastname');
}

function getSchools(classification) {
	query = Schools().select('school', 'schoolid', 'size');
	if (classification && classification !== 'all') {
		query = query.where({
			size : classification.toUpperCase()
		});
	}
	return query.orderBy('school');
}

function getSchool(schoolId) {
	return Schools().select('school', 'schoolid', 'size', 
			'u1.userid as coachid1', 'u1.name as coach1', 'u1.affiliation as aff1', 
			'u2.userid as coachid2', 'u2.name as coach2', 'u2.affiliation as aff2', 
			'u3.userid as coachid3', 'u3.name as coach3', 'u3.affiliation as aff3',
			'u4.userid as coachid4', 'u4.name as coach4', 'u4.affiliation as aff4',
			'u5.userid as coachid5', 'u5.name as coach5', 'u5.affiliation as aff5',
			'u6.userid as coachid6', 'u6.name as coach6', 'u6.affiliation as aff6').
		leftJoin('users as u1', 'schools.coachid1', 'u1.userid').
		leftJoin('users as u2', 'schools.coachid2', 'u2.userid').
		leftJoin('users as u3', 'schools.coachid3', 'u3.userid').
		leftJoin('users as u4', 'schools.coachid4', 'u4.userid').
		leftJoin('users as u5', 'schools.coachid5', 'u5.userid').
		leftJoin('users as u6', 'schools.coachid6', 'u6.userid').
		where({
			schoolid : schoolId
		});
}

function getUsers(active) {
	query = Users().select();
	if (active) {
		return query.whereNull('deleted');
	}
	return query.orderBy('name');
}

function getOffsets(year, g, y, m, d) {

	let gender = g;
	console.dir(gender);
	if (!gender) {
		gender = ((m > 10 && d > 15 || m > 11) || m < 9 ? gender = 'm' : gender = 'f');
	}
	console.dir(gender);
	if (!year) {
		year = y;
		if (gender == 'f') {
			if (m < 9) {
				year--;
			}
		} else if (m >= 11) {
			year++;
		}
	}
	const startdate = (gender == 'f' ? `${year}0801` : `${year - 1}1115`);
	const enddate = (gender == 'f' ? `${year}1114` : `${year}0401`);
	return {gender, startdate, enddate};
}

function getResults(gen, year, classification, userid) {

	const today = new Date();
	const m = today.getMonth() + 1;
	const y = today.getFullYear();
	const d = today.getDate();

	const {gender, startdate, enddate} = getOffsets(year, gen, y, m ,d);
	query = Results().
		select('e.event','results.minutes','results.seconds','results.milliseconds',
			   'results.location','a.firstname','a.lastname','a.gradyear',
			   't.school as team','s.school','results.date','u.name as submitter').
		join('events as e', 'results.eventid', 'e.eventid').
		join('users as u', 'results.userid', 'u.userid').
		leftJoin('schools as t', function() {
			this.
				on('results.participantid', 't.schoolid').
				on('results.type', knex.raw('?', ['t']))
			}).
		leftJoin('athletes as a', function() {
			this.
				on('results.participantid', 'a.athleteid').
				on('results.type', knex.raw('?', ['a']))
			}).
		leftJoin('schools as s', function() {
			this.
				on('a.schoolid', 's.schoolid')
			}).
		where('results.validated', '>=', 0).
		whereBetween(
			'results.date', [startdate, enddate]
		);
	if (classification) {
		query = query.
			where(function() {
				this.
					where({'t.size': classification.toUpperCase()}).
					orWhere({'s.size': classification.toUpperCase()})
				});
	}
	if (userid) {
		query = query.
			where({'results.userid' : userid}).
			orderBy('results.date', 'desc').orderBy('e.eventid');
	} else {
		query = query.
			orderBy('e.eventid').orderBy('results.minutes').orderBy('results.seconds').orderBy('results.milliseconds');
	}
	return query;
}

module.exports = {
	getAllEvents: getAllEvents,
	getSchools: getSchools,
	getSchool: getSchool,
	getUsers: getUsers,
	getResults: getResults,
	getAthletes: getAthletes
};

