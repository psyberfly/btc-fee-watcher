# BTC FEE WATCHER

## About:
A service to provide alerts via API and WS when btc fee is low.
2 Fee Ratio are caluclated:
1. Current Fee Estimate / yearly moving average 
2. Current Fee Estimate / monthly moving average 
If fee ratio > 1, fee is high, else low.
Fee ratio is updated every block.

## Prerequisites:
nodejs, npm, postgres server

## Usage:
1. Ensure your Postgres DB is online.
2. npm install  
   tsc  
   npm start    

## To Do:
currently last year's fee estimate history is loaded locally from file.

since fee ratio needs to be charted, we have to store the feeRatio at each block genesis.
So, movingAverages table can have a new column:feeRatio can be columns in same table updated at each new block.
When user queries API, return latest feeRatio instead of calculating. 
