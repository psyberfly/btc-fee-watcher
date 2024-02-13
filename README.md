# BTC FEE WATCHER
A service to provide alerts when btc fee is low via API and WS

## Prerequisites:
nodejs, npm, postgres server

## Usage:
1. Ensure your Postgres DB is online.
2. npm install  
   tsc  
   npm start    

## To Do:
since fee ratio needs to be charted, we have to store the feeRatio at each block genesis.
So, movingAverages table can have a new column:feeRatio can be columns in same table updated at each new block.
When user queries API, return latest feeRatio instead of calculating. 
