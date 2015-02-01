# MGT 645 Project

This is the starter project for MGT 645. You'll fork this
code in order to get started with your project. 

## Getting started

For the following instructions, we assume that you are logged
into the virtual machine you are using for MGT 645. 

To clone the repository, issue you'll use the following git command.

	git clone https://github.com/yale-mgt-656/mgt656-spring-2015-project.git

Then, you can do 

	cd mgt656-project

Then, you'll need to install the dependencies

	npm install

And, finally, you can run the code

	./node_modules/.bin/gulp

That will run the [nodemon](https://github.com/remy/nodemon)
program, which is a nice way of running node and then restarting
it when your files change. Every time your files change, it will
also run [http://www.jshint.com/docs/](JSHint) to check your
JavaScript code for bad practices.

## Test your code

Type the following command in order to run the
[BDD](http://en.wikipedia.org/wiki/Behavior-driven_development)
tests.

	./node_modules/.bin/mocha

That will run all the tests in `test/tests.js`.


## What we're using

This application relies on a number of open source projects.
Obviously, it is a [node.js](http://nodejs.org/) application.
We are using the following components, which are built for node
applications and written by people that have made them open 
source.

* [express.js](http://expressjs.com/): Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
* [nunjucks](http://mozilla.github.io/nunjucks/): A templating language for JavaScript. This allows us to say there is a certain default page and every other page should like just like it, maybe changing just small parts.
* [morgan](https://github.com/expressjs/morgan): HTTP request logger middleware for node.js, written by the people who write Express. This allows us to print pretty logging statements while the application is handling requests.
* [validator](https://github.com/chriso/validator.js): A library of string validators and sanitizers. This helps us ensure that parameters sent to our application by users are valid.
* [body-parser](https://github.com/expressjs/body-parser): Node.js body parsing middleware by the people who write Express.
