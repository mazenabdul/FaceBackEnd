const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const db = knex({

  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  }
  
});
connectionString: process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const app = express();

app.use(bodyParser.json());
app.use(cors());





const database = {

user: [

	{

		id: '123',
		name: 'John',
		email: 'john@gmail.com',
		password: 'cookies',
		entries: 0,
		joined: new Date()

	},
	{


		id: '456',
		name: 'Macy',
		email: 'macy@gmail.com',
		password: 'coke',
		entries: 0,
		joined: new Date() 
	}

	]
}



app.get('/', (req,res) => {

	res.json('This is working');
});

app.post('/signin', (req,res)=> {

db.select('email','hash').from('login')
.where('email', '=', req.body.email)
.then(data => {

	const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
	
	if (isValid){
		return db.select('*').from('users')
		.where('email','=', req.body.email)
		.then(user => {

			res.json(user[0])
		})
		.catch(err=>res.status(400).json('Unable to Get User'))

		}
		res.status(400).json('Wrong Credentials')
	})
		.catch(err => res.status(404).json('Wrong Credentials'))
})

app.post('/register', (req,res) => {

if(!req.body.email || !req.body.password || !req.body.name){

	return res.status(400).json('Insufficient Details');
}
const password = req.body.password;
const hash = bcrypt.hashSync(password);

db.transaction(trx => {

	trx.insert({

		hash: hash, 
		email: req.body.email
	})

		.into('login')
		.returning('email')
		.then(LoginEmail => {

			return trx('users')
				.returning('*')
				.insert({
				email: LoginEmail[0],
				name: req.body.name,
				joined: new Date()
			})
				.then(user => {
				  res.json(user[0]);
			})
		})
			.then(trx.commit)
			.catch(trx.rollback)	
	
		})

	.catch(err =>
      res.status(400).json(err))
})

app.get('/profile/:id', (req,res) => {
db.select('*').from('users').where({

	id: req.params.id
})
	.then(user => {

		if(user.length){
			res.json(user[0])
		} else {

			res.status(400).json('User not found!');
		}
		
	})
})


app.put('/image', (req,res)=>{

  db('users').where('id', '=', req.body.id)
  .increment('entries', 1)
  .returning('entries') 
  .then (entries => {
  	res.json(entries[0]);
  })
  .catch(err => res.status(400).json('Unable to get entries'))
  })










app.listen(process.env.PORT || 3001, () => {

	console.log(`App is running on port ${process.env.PORT}`);
});





/*
List of possible routes 
1) Root (/) --> 'Route is working'
2) /SignIn --> POST request since we re submitting data success or fail
3) /Register --> POST, want to submit data to server
4) /profile:userID --> GET request = user 
5) /image --> PUT, updating score/rank
*/
