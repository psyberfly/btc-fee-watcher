#!/bin/bash

# Function to drop all tables in a PostgreSQL database
load_fee_est_from_csv() {
    docker exec -it my-postgres psql -U postgres -d btcfee -c "COPY fee_estimate(time,sats_per_byte) FROM '/csv/fee_est_data_last_year.csv' DELIMITER ',' CSV HEADER;"

}

# Call the function
load_fee_est_from_csv
