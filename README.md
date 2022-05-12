# A basic chat app built with Node, Express and Socket.IO

## Setting up the project locally.
1. Install the dependencies:
```sh
    npm install
```
2. Create a configs folder and add the configs :
```sh
    mkdir configs
    touch configs/dev.env
    touch configs/test.env
```
3. Specify the environment in the ```dev.env``` and ```test.env``` file:
```sh
    PORT=3000
```
4. To run the app in the development mode:
```sh
    npm run devstart
```
5. To run the app in the test mode:
```sh
    npm run test
```