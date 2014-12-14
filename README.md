# INTDAI Mock API

This repository contains the code base for a mock server which serves example data through an HTTP API conforming to the specifications for the INTDAI project's APIs.
The API server is implemented in JavaScript for the NodeJS runtime environment.

## Preconditions

To build and run the project a host machine needs to be made available and provisioned with the latest NodeJS runtime environment software. Depending on the operating system of choice the provisioning of the machine may vary. Further information for each operating system can be found on the [NodeJS website](http://nodejs.org).

## Building the project

Presuming the preconditions to build and execute this project are met, some dependencies for the project in the NodeJS runtime must be met. Those dependencies are described in the `package.js` file and can be installed by running `npm install`in the root of the project path. The project is built when the dependencies are installed successfully to the host machine.

## Test Driven Development

All interfaces of the server are covered with behavioral tests. The tests are implemented for the Mocha framework for the NodeJS runtime environment. In order to run those tests the project first must be built according to the previous section. Once the project was build, the tests can be run by running `npm test` in the root of the project path. This command is resolved according to the specification in the `package.json` configuration file of the project.

## Licence

The MIT License (MIT)

Copyright (c) 2014 Martin Biermann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.