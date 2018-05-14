//knex migrate:latest --env test //creates the migration file
//knex seed:make shows_seed --env test //creates the seed files
//knex seed:run --env test //populates the seed data

const express = require('express');
const router = express.Router();

const queries = require('../db/queries');

const cors = require('cors')
const app = express()

router.all('*', cors());

// *** GET all shows *** //
router.get('/users/:filter', (req, res, next)  => {
  queries.getUsers(req.params.filter == 'active')
  .then((users) => {
    res.status(200).json(users);
  })
  .catch((error) => {
    next(error);
  });
});

// *** GET all shows *** //
router.get('/results', (req, res, next)  => {
  queries.getResults(req.query.gender, req.query.year, 
                     req.query.classification, req.query.userid)
  .then((users) => {
    res.status(200).json(users);
  })
  .catch((error) => {
    next(error);
  });
});

// *** GET all shows *** //
router.get('/events', (req, res, next)  => {
  queries.getAllEvents()
  .then((events) => {
    res.status(200).json(events);
  })
  .catch((error) => {
    next(error);
  });
});

// *** GET single school *** //
router.get('/schools/:classification', function(req, res, next) {
  queries.getSchools(req.params.classification)
  .then(function(show) {
    res.status(200).json(show);
  })
  .catch(function(error) {
    next(error);
  });
});

// *** GET athletes by school *** //
router.get('/athletes/:schoolid/:yearcutoff', function(req, res, next) {
  queries.getAthletes(req.params.schoolid, req.params.yearcutoff)
  .then(function(athletes) {
    res.status(200).json(athletes);
  })
  .catch(function(error) {
    next(error);
  });
});

// *** GET single show *** //
router.get('/school/:id', function(req, res, next) {
  queries.getSchool(req.params.id)
  .then(function(school) {
    res.status(200).json(school);
  })
  .catch(function(error) {
    next(error);
  });
});

// *** GET single show *** //
router.put('/school/:id', function(req, res, next) {
  queries.setSchool(req.body)
  .then(function(school) {
    res.status(200).json(school);
  })
  .catch(function(error) {
    next(error);
  });
});

module.exports = router;

