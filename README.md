# BTC FEE ESTIMATE WATCHER

## About:
A service to provide alerts via API and WS when btc fee estimate is low.
2 Fee Ratio are caluclated:
1. Current Fee Estimate / yearly moving average 
2. Current Fee Estimate / monthly moving average 
If fee ratio > 1, fee is high, else low.
Fee Est : Moving Avg ratio is updated every 10 mins (~block).

## Prerequisites:
nodejs, npm, postgres server

## Usage:
1. Ensure your Postgres DB is online.
2. npm install  
   tsc  
   npm start    

## Spec:

**OPs:**

  Do every day:
  1. calculate moving averages of 1. past 365 days, 2. past 30 days  
  2. update chart  

  Do every block:
  1. fetch current fee rate   
  2. calculate fee-avg ratio: currrent fee rate/moving averages  
  3. update chart   

  **SERVICES:**
  
  1. API providing latest fee-avg ratio
  2. WS providing subscription to latest fee-avg ratio

## To Do:
1. currently last year's fee estimate history is loaded locally from csv file. CSV File is loaded by host via psql. Write an init procedure in server to load it. 
2. Test WS
3. Change nodejs host runtime to docker container runtime
4. Write setup scripts
5. Change intervals of IndexWatcher to prod internvals before deploying. 

## Known Issues:
1. Signing key for lib/http/handler.ts not generated:
   'No response signing key found!. Run $ ditto crpf sats_sig'
   Sample signature used for dev. Resolve issue for prod...

## Testing:

### API: 
   curl http://localhost:3561/service/index
### WS: 
   websocat -H="Accept: application/json" -H="Content-Type: application/json" ws://localhost:3572/stream?service=index
